# 09 — Agent and Orchestration Audit

**Scope:** `backend/src/modules/agents/**`, `frontend/src/lib/providers/**`, `/api/agents/**`.
**All findings `SOURCE-VERIFIED` unless labelled otherwise.**

---

## 1. The headline

The product's central claim is 13 autonomous agents. **Zero of them execute.** There is no model call, no tool invocation, no queue, no retry, no budget, no trace, and no persistence of a run. What exists is a definition table, a switch statement, and a set of pre-written outputs.

This is not a partially built feature. It is a **UI affordance with a backend-shaped decoration**.

---

## 2. What exists

### 2.1 The 13 definitions

`backend/src/modules/agents/definitions/index.ts` — an array of 13 objects, each with an id, name, description, category, and a prompt string. The prompts are written as instructions to a model. **Nothing consumes them.**

What is missing, and would be required for any of them to run:

| Required | Present |
|---|---|
| Model client | No |
| Prompt assembly (context injection) | No |
| Tool/function definitions | No |
| Structured output schema | No |
| Execution queue | No |
| Retry / timeout policy | No |
| Token/cost budget | No |
| Trace or log of a run | No |
| Persistence of run record | No |
| Output validation | No |
| Human approval mechanism | No (canned) |

11 of 11 required components are absent. The definitions are inert data.

### 2.2 The orchestrator

`backend/src/modules/agents/agent-orchestrator.ts`:

- Orchestration returns canned structures keyed by agent id.
- `approveRun` returns a fixed approval result regardless of the run's actual state, the approver's identity, or whether approval was requested.
- Token counts are fabricated constants — they are not measured, not estimated, and not derived from any provider response.

**Consequence:** `approveRun` will "approve" a run that does not exist, for a user who may not have permission, and the caller cannot tell. Any audit trail built on this is fiction.

### 2.3 The run route

`frontend/src/app/api/agents/[id]/run/route.ts`:

- Returns `CANONICAL_OUTPUTS[id]` — a hardcoded map of pre-written results.
- For agents whose output includes "discovered leads", it **synthesises phone numbers**.
- On error, falls through to an "offline fallback" that returns the same canonical output.

This is the most dangerous artefact in the codebase after the auth findings. A lead-generation agent that invents phone numbers will put fabricated contact data into a customer's CRM and then into their outbound calling. The damage is not to the software; it is to the customer's reputation and to real people receiving calls.

### 2.4 The provider layer

`frontend/src/lib/providers/index.ts` returns mock implementations **unconditionally** — no environment check, no key check, no configuration switch. Even with valid Gemini, OpenAI, NVIDIA NIM, and OpenRouter keys present in the environment (`SOURCE-VERIFIED` that the env files exist), the application never calls them.

**Inference (`INFERRED`, high confidence):** the "provider abstraction" was built as an interface with a mock first, and the real implementation was never written. The presence of live keys indicates intent; the absence of a conditional indicates the intent was never connected.

### 2.5 The workers

`backend/workers/README.md` describes BullMQ and Catalyst worker processes. No worker source exists (`SOURCE-VERIFIED` absence). `DOCUMENTED-ONLY`.

---

## 3. Why the fake orchestration is worse than no orchestration

A missing feature is honest: the button is absent, the user knows. A fake feature is dishonest: the button is present, the user believes, and the belief propagates into decisions.

Specifically:

1. **Approval semantics become meaningless.** If `approveRun` always approves, the approval gate the product markets does not exist. A customer relying on human-in-the-loop for compliance (a regulated client, for instance) has no control.
2. **Cost telemetry becomes meaningless.** Fabricated token counts mean no one can forecast spend, and the first real execution will produce a cost surprise.
3. **Quality cannot be evaluated.** With canned outputs, every agent appears to succeed. There is no failure signal to learn from, so prompt and model quality is unmeasured and unmeasurable.
4. **The team learns the wrong architecture.** Building on `CANONICAL_OUTPUTS` teaches that agents return constants. The eventual real implementation will require unlearning.

---

## 4. What a real runtime requires

Specified fully in `29`; summarised here as the gap list.

| Layer | Requirement |
|---|---|
| **Definition** | Versioned agent record in the database: model, prompt template, tool allowlist, output schema, budget, autonomy level |
| **Invocation** | Gateway-mediated model call with timeout, retry with jitter, and circuit breaker (`31`) |
| **Context** | Explicit retrieval step, token-budgeted, with source citations (`32`) |
| **Tools** | Typed contracts with per-tool permissions, dry-run mode, and idempotency keys (`33`) |
| **Execution** | Durable workflow so a 40-step audit survives a deploy (`30`) |
| **Budget** | Hard token and currency ceilings, enforced before the call, not after |
| **Approval** | Server-enforced gate on specific tools/steps, recorded with actor and timestamp (`35`) |
| **Output** | JSON-schema validation; on failure, retry once then fail visibly — never substitute |
| **Telemetry** | Trace per run: prompt, model, tokens, latency, cost, tool calls, output, validation result (`37`) |
| **Evaluation** | Golden-set regression on prompt or model change (`37`) |

---

## 5. Autonomy as an earned permission

The product narrative implies agents act autonomously. The plan recommends **not** implementing autonomy as a global property. Instead:

```
suggest_only → execute_with_approval → execute_autonomously
```

per **capability**, not per agent, with promotion requiring measured evidence:

- ≥ 50 reviewed runs
- ≥ 95% output-schema validity
- ≤ 2% human correction rate on a sampled set
- zero safety-gate violations
- founder sign-off recorded

`PROPOSED`, specified in `35`. Rationale: autonomy granted before measurement is a liability transfer from the company to the customer, and the first bad autonomous action ends the customer relationship.

---

## 6. Agent inventory and disposition

The 13 agents map to plausible service lines. Disposition is a planning recommendation, not a judgement of the existing definitions (which are prompt sketches).

| Group | Agent roles represented | Disposition |
|---|---|---|
| Discovery | Prospect discovery, business research | **Rebuild in M5** — requires compliant data source (`39`) |
| Qualification | Lead scoring, fit assessment | **Rebuild in M3** — highest value, lowest risk, good first real agent |
| Audit | Website audit, SEO audit, presence audit | **Rebuild in M3–M4** — deterministic checks first, LLM for synthesis only |
| Outreach | Message drafting, personalisation, reply triage | **Rebuild in M6** — must sit behind consent + approval gates |
| Delivery | Proposal drafting, reporting, content | **Rebuild in M7** |
| Ops | Meeting prep, CRM hygiene | **Defer to M9** |

**Principle (`PROPOSED`):** for every agent, separate what can be computed deterministically from what requires a model. An SEO audit is a crawler plus rules; the model writes the narrative. Building audits as LLM tasks produces non-reproducible scores — which is precisely the failure visible in `/audits` today (`14`).

---

## 7. Provider strategy observations

Four provider credentials exist: Gemini, OpenAI, NVIDIA NIM, OpenRouter. This is already sprawl before a single call is made.

**Recommendation (`PROPOSED`):** one gateway (LiteLLM, MIT) in front of providers; exactly two active providers at launch (one primary frontier model, one cheap/fast model); routing rules by task class; per-org and per-run budgets enforced at the gateway. Rationale and licence verification in `31` and `41`.

---

## 8. Verdict

| Dimension | Assessment |
|---|---|
| Agent execution | **None** |
| Orchestration | **Fake** |
| Approvals | **Canned** |
| Cost telemetry | **Fabricated** |
| Provider integration | **Mock unconditional** |
| Run persistence | **None** |
| Tool layer | **None** |
| Worker/queue | **Documented only** |
| Definitions | 13 prompt sketches, reusable as design input |

The agent layer is the product's promise and its largest hollow space. It is also, correctly sequenced, the *last* thing to build — because an agent is only as trustworthy as the data it reads, the permissions it holds, and the ledger that records what it did. Those are M1–M4.
