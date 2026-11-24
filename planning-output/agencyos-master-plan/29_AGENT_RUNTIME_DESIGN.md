# 29 — Agent Runtime Design

`PROPOSED`. Replaces the stubs in `09`. This is the specification for making agents real.

---

## 1. Design premise

An agent is **not** a prompt with a name. It is a versioned configuration plus a durable execution plus a budget plus an audit trail. Remove any of the four and it is a demo.

The runtime's job is to make the honest thing the easy thing:

- The model cannot produce a score (deterministic values come from code).
- The model cannot send a message (gated action).
- The model cannot exceed a budget (pre-call check).
- The model cannot act without a record (every step persisted).

---

## 2. The four layers

```
┌─────────────────────────────────────────────┐
│ 1. Definition (data, versioned)             │
│    prompt, schema, tools, budget, autonomy  │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2. Execution (Temporal workflow)            │
│    steps, retries, timers, approval waits   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3. Capability (gateway + tools)             │
│    model calls, tool calls, policy checks   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Evidence (runs, steps, traces, costs)    │
│    what happened, why, at what price        │
└─────────────────────────────────────────────┘
```

---

## 3. Layer 1 — Agent definition

```ts
interface AgentDefinition {
  key: string;                    // 'audit.narrative'
  version: number;                // incremented on any change
  category: 'assessment' | 'engagement' | 'delivery' | 'ops';
  modelClass: 'fast' | 'standard' | 'frontier';
  prompt: { system: string; user: string };   // template with typed slots
  outputSchema: JsonSchema;       // validated, not optional
  tools: ToolRef[];               // allowlist; empty means pure text
  budget: { maxTokensIn, maxTokensOut, maxCredits, timeoutMs };
  autonomy: 'suggest_only' | 'execute_with_approval' | 'execute_autonomously';
  evalSetId?: string;
  isActive: boolean;
}
```

### 3.1 Versioning rules

- Any change to `prompt`, `outputSchema`, `tools`, or `modelClass` requires a **new version**.
- Old versions are retained; running runs reference the version they used.
- A version may not be activated without a passing eval run (`37`).
- Rollback is `activate(previousVersion)`, not a code deploy.

### 3.2 Prompt template discipline

Templates have **typed slots**, not string concatenation:

```
Template: "Analyse this audit. Findings: {{findings}}. Site: {{url}}."
Slots:    findings: AuditCheck[], url: string
```

This makes prompt injection via a slot value a design concern that can be addressed (delimit and label untrusted content) rather than an accident.

**Untrusted-content rule:** anything originating from a crawled page is untrusted. It is wrapped in explicit delimiters, labelled as data, and the system prompt instructs the model to treat it as data. A crawled page containing "ignore previous instructions" must not alter behaviour. This is prompt injection defence at the template level, and it is tested with a fixture page containing an injection string (`44`).

---

## 4. Layer 2 — Execution

### 4.1 Why Temporal

A single agent call is a request. An agent *run* is a workflow: fetch → retrieve → call → validate → (retry) → maybe wait for approval → maybe call a tool → record. That sequence can take minutes, can wait days for a human, and must survive a deploy. That is durable execution (`30`).

### 4.2 The canonical run workflow

```ts
async function runAgent(input: RunInput): Promise<RunResult> {
  const run = await createRun(input);                    // persists AgentRun

  const context = await assembleContext(run);            // retrieval, budgeted
  await recordStep(run, 'context', context.summary);

  const budget = await reserveBudget(run);               // throws if insufficient

  let output;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const raw = await callModel(run, context);           // via gateway
    const parsed = validate(output.schema, raw);         // zod
    if (parsed.ok) { output = parsed.data; break; }
    if (attempt === 3) throw new SchemaViolationError(parsed.errors);
    await sleep(backoff(attempt));                       // durable timer
  }

  await recordStep(run, 'model', output);

  if (requiresApproval(run, output)) {
    await setStatus(run, 'awaiting_approval');
    const decision = await waitForSignal('approval', timeout('7d'));
    if (decision !== 'approved') return reject(run, decision);
  }

  for (const action of actionsOf(output)) {
    await enforcePolicy(run, action);                    // consent/approval/budget
    await executeTool(run, action);                      // idempotent
  }

  await settleBudget(run);                               // actual, not estimated
  return complete(run, output);
}
```

Every `await` above is durable: if the worker dies, the workflow resumes at the same step. The approval wait can last days without holding a process.

### 4.3 Step records

Every `recordStep` writes a `RunStep` row: index, kind, name, status, input hash, output hash, duration, error code. The full input/output is stored in object storage with a reference, so the row stays small and the detail remains available.

---

## 5. Layer 3 — Capabilities

### 5.1 Model calls

Always via `LlmGateway` (`31`). Never a provider SDK directly. The gateway enforces:

- model class → concrete model mapping
- pre-call budget check
- PII redaction
- timeout and retry
- structured output mode
- trace emission

### 5.2 Tool contracts

```ts
interface Tool<I, O> {
  name: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  sideEffect: 'none' | 'internal' | 'external';
  requiresConsent: boolean;
  requiresApproval: boolean;
  idempotent: boolean;
  execute(input: I, ctx: ToolContext): Promise<O>;
}
```

| Tool | Side effect | Consent | Approval |
|---|---|---|---|
| `read_audit` | none | no | no |
| `read_prospect` | none | no | no |
| `crawl_page` | none | no | no |
| `score_audit` | internal | no | no |
| `create_prospect` | internal | no | no |
| `draft_message` | none | no | no |
| `send_message` | **external** | **yes** | **yes** |
| `create_invoice` | **external** | no | **yes** |
| `sync_crm` | **external** | no | **yes** |

**Rule:** a tool with `sideEffect: 'external'` cannot be invoked by an agent in `suggest_only`. The runtime refuses, not the prompt.

### 5.3 The policy gate

`enforcePolicy(run, action)` checks, in order, and throws a typed error on the first failure:

1. Is this tool in the agent's allowlist?
2. Does the org's plan permit this capability?
3. Does the autonomy level permit this action?
4. If `requiresConsent`: is there a valid `ConsentRecord`?
5. If `requiresApproval`: is there an `Approval` covering this scope?
6. Is there budget?
7. Is the capability flag enabled (kill switch)?

All seven are server-side. None is expressed in a prompt. This is the `AGENTS.md` §2 requirement — deterministic boundaries that never depend on LLM heuristics — implemented literally.

---

## 6. Layer 4 — Evidence

| Record | Contents |
|---|---|
| `AgentRun` | input, status, output, tokens, cost, timing, workflow id |
| `RunStep` | per-step kind, status, duration, input/output hashes |
| `Approval` | who, when, what they saw, decision, note |
| `CostRecord` | provider, tokens, cost, currency |
| Langfuse trace | full prompt, response, model, latency (redacted) |

**Requirement:** any run must be reconstructible from records alone, without re-running. If a customer asks "why did you send this message on 14 November", the answer is a query, not an investigation.

---

## 7. The 13 agents, re-specified

| Agent key | Deterministic part | Model part | Autonomy at launch |
|---|---|---|---|
| `audit.checks` | **All checks** | none | autonomous |
| `audit.narrative` | score | narrative + fixes | suggest_only |
| `audit.prioritise` | rubric weights | ranking rationale | suggest_only |
| `qualify.score` | **Formula over signals** | none | autonomous |
| `qualify.explain` | score | one-sentence reason | suggest_only |
| `engage.draft` | recipient, evidence | message body | suggest_only |
| `engage.triage` | — | intent classification | suggest_only |
| `engage.followup` | schedule | message body | suggest_only |
| `report.summary` | **All numbers** | narrative | suggest_only |
| `report.insight` | — | pattern observation | suggest_only |
| `deliver.proposal` | scope, price | prose | suggest_only |
| `ops.meetingprep` | calendar data | briefing | suggest_only |
| `ops.hygiene` | duplicate detection | none | autonomous |

**Observation:** four agents are entirely deterministic and should never call a model. Six are drafting aids that never act. Two are advisory. One is genuinely low-risk automation. **No agent launches autonomous except the deterministic ones**, which are not really agents — they are functions with good branding, which is exactly what they should be.

---

## 8. Failure semantics

| Failure | Behaviour |
|---|---|
| Model timeout | Retry with backoff (3 attempts), then `failed` with reason |
| Schema violation | Retry once with the error appended; then `failed` |
| Budget exhausted | **Fail before the call**, status `failed`, reason `budget` |
| Policy denied | Status `failed`, reason code, no retry |
| Tool error (retryable) | Retry per tool policy |
| Tool error (permanent) | `failed`, surface to operator |
| Worker crash | Workflow resumes; no data loss |
| Approval timeout | `expired` after configured period; no action taken |

**Never:** substitute a canned output, silently downgrade to a cheaper model, or return partial success as success.

---

## 9. Cost and rate control

| Control | Where enforced |
|---|---|
| Per-run token ceiling | Gateway, pre-call |
| Per-run credit ceiling | Policy gate, pre-step |
| Per-org monthly ceiling | Policy gate |
| Per-tool rate limit | Tool wrapper |
| Provider concurrency | Gateway pool |
| Platform daily spend cap | Gateway, hard stop |

A hard stop is a product decision: work stops and the operator is told. The alternative — continuing and billing later — has caused more startup failures than any technical defect.

---

## 10. What this replaces

| Current artefact | Fate |
|---|---|
| `definitions/index.ts` (13 stubs) | Replaced by DB definitions seeded from these specs |
| `agent-orchestrator.ts` | Deleted |
| `CANONICAL_OUTPUTS` | Deleted |
| `approveRun` canned response | Replaced by `Approval` entity + durable signal |
| Fabricated token counts | Replaced by `CostRecord` from provider responses |
| `lib/providers/index.ts` mocks | Replaced by `LlmGateway` |

---

## 11. Minimum viable agent (M3 exit criterion)

The first real agent must satisfy all of:

1. Reads from Catalyst via repository.
2. Calls a model via the gateway, with the prompt versioned in the DB.
3. Validates output against a schema; fails on violation.
4. Persists `AgentRun` and every `RunStep`.
5. Emits a Langfuse trace.
6. Records actual tokens and cost.
7. Cannot exceed its budget.
8. Requires approval if its output includes an external action.
9. Is reproducible: the same input and version produce a comparable output, with recorded variance.

If any of the nine is missing, the agent is still a demo. `audit.narrative` is the recommended first agent because its deterministic counterpart (`audit.checks`) already exists by then, so the model's contribution is narrowly scoped to prose.
