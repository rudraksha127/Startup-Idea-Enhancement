# 35 — Approval Gates, Human-in-the-Loop, and Policy

`PROPOSED`. This document defines the mechanism by which the system is allowed to act in the world.

---

## 1. Why gates are the product, not a constraint on it

The competitive claim in `19` is *supervised autonomy*. That claim only has value if the supervision is real — enforced by code, auditable, and impossible to bypass with a prompt.

Today, `approveRun` always approves (`09` §2.2). A product that says "human-in-the-loop" while its approval function returns a constant is making a false safety claim, which is worse than claiming nothing.

---

## 2. The gate taxonomy

Four gate types. Every externally-effectful operation passes at least two.

| Gate | Question | Data source | Type |
|---|---|---|---|
| **Consent** | May we contact this person on this channel? | `ConsentRecord` | Deterministic |
| **Approval** | Has a human authorised *this* action? | `Approval` | Human |
| **Budget** | Can we afford it? | `CreditAccount` + `CostRecord` | Deterministic |
| **Capability** | Is this action permitted for this agent/org/plan? | `AgentDefinition` + `FeatureFlag` + plan | Deterministic |

### 2.1 The AGENTS.md requirement, satisfied structurally

`AGENTS.md` §2 requires that "source eligibility, suppression lists, credit/spend budgets, authentication, permission checks, approval gates, and state transitions must never depend purely on LLM heuristics."

The design satisfies this by construction: **the model never evaluates a gate.** The model proposes an output; the gate evaluates the proposal against database state. There is no prompt that can grant consent, because consent lives in a table read by code.

---

## 3. Approval mechanics

### 3.1 The `Approval` record

```
Approval {
  id, orgId,
  subjectType: 'agent_run' | 'message' | 'invoice' | 'campaign',
  subjectId,
  scope: JSON,             // exactly what is being approved
  requestedBy, requestedAt,
  snapshot: JSON,          // what the approver saw — critical
  decidedBy?, decision: 'approved' | 'rejected' | 'expired',
  decidedAt?, note?,
  expiresAt
}
```

### 3.2 The `snapshot` field

The approver approves **what they saw**, not whatever the record later becomes. Storing a hash of the rendered content means a later edit invalidates the approval automatically: if `snapshotHash !== currentHash`, the approval does not apply.

Without this, there is a class of bug where a message is approved, then edited, then sent with the unapproved content. That bug is a compliance failure and it is invisible without the snapshot.

### 3.3 Expiry

Approvals expire (default 7 days, configurable). An expired approval cannot be used; the action must be re-requested. This prevents a stale approval from authorising an action weeks later in a changed context.

### 3.4 Batch approval with sampling

Bulk approval is where human oversight degrades into a rubber stamp. Design:

1. A batch may be approved, but the approver is **shown N randomly sampled messages** (default 10, or 10% whichever is larger).
2. The approver must actively confirm they reviewed the sample.
3. The sample seed and the sampled IDs are recorded in the `Approval`.
4. If any sampled message is rejected, the batch cannot be approved wholesale — it must be split.

This makes "I reviewed 200 messages" a claim with an audit trail that is honest about what was actually reviewed.

---

## 4. The policy engine

### 4.1 What it is

A pure function:

```ts
function assertAllowed(action: Action, ctx: PolicyContext): void
```

Deterministic. No model. No network. Testable exhaustively.

### 4.2 PolicyContext

```ts
interface PolicyContext {
  org: { id, plan, flags, limits };
  actor: { id, role, capabilities };
  agent?: { key, autonomyLevel, toolAllowlist, budgetRemaining };
  subject: { consent?: ConsentRecord; suppression?: Suppression; budget: number };
  run?: { id, status, approvals: Approval[] };
}
```

### 4.3 Rules, in evaluation order

| # | Rule | Failure code |
|---|---|---|
| 1 | Capability enabled for org | `capability_disabled` |
| 2 | Actor has the capability | `forbidden` |
| 3 | Agent tool is in allowlist | `tool_not_allowed` |
| 4 | Autonomy level permits the action class | `autonomy_insufficient` |
| 5 | Consent valid for channel+scope | `consent_missing` |
| 6 | Not suppressed | `suppressed` |
| 7 | Approval present and unexpired, snapshot matches | `approval_missing` |
| 8 | Budget sufficient | `budget_exhausted` |
| 9 | Rate limit not exceeded | `rate_limited` |
| 10 | Plan permits volume | `plan_limit` |

Each returns a machine-readable code surfaced to the operator, plus a human sentence. An error that says "action not permitted" is useless; "no consent recorded for email on this contact — capture consent or choose another contact" is actionable.

### 4.4 Autonomy levels and action classes

| Action class | `suggest_only` | `execute_with_approval` | `execute_autonomously` |
|---|---|---|---|
| Read | ✓ | ✓ | ✓ |
| Internal write | ✗ (proposal only) | ✓ | ✓ |
| External write | ✗ | ✓ *with approval* | ✓ |
| Financial | ✗ | ✓ *with approval* | ✗ (never) |

**Financial actions never become autonomous.** A model that can spend money without a human is an unacceptable risk regardless of measured accuracy, and the cost of being wrong is asymmetric.

---

## 5. The earned-autonomy mechanism

### 5.1 Promotion criteria

A capability moves from `execute_with_approval` to `execute_autonomously` when, over a measurement window:

| Criterion | Threshold (default) |
|---|---|
| Runs completed | ≥ 50 |
| Output schema validity | ≥ 99% |
| Human rejection rate | ≤ 2% |
| Human edit rate (material) | ≤ 5% |
| Safety-gate violations | 0 |
| Incidents caused | 0 |
| Measurement window | ≥ 21 days |

`PROPOSED` thresholds. They are deliberately conservative and should be tightened, not loosened, after the first incident.

### 5.2 The promotion artefact

Promotion is a recorded decision, not a config change:

```
AutonomyPromotion {
  agentKey, capability, fromLevel, toLevel,
  evidence: { runs, schemaValidity, rejectionRate, editRate, window },
  approvedBy, approvedAt, note
}
```

Displayed in the product as the reliability record (`19` §5). This turns caution into a marketing asset with receipts.

### 5.3 Demotion

Automatic demotion when, over any 7-day window:

- rejection rate > 10%, or
- a safety violation occurs, or
- schema validity < 95%.

Demotion is immediate and does not require approval. Restoring the higher level requires the full promotion evidence again. **Asymmetric by design:** easy to fall, hard to climb.

---

## 6. Where gates sit in the flow

```
Agent proposes output
        │
        ▼
┌──────────────────────┐
│ Output schema valid? │──no──► fail, retry once, then error
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ Contains external    │──no──► persist, done
│ actions?             │
└──────────┬───────────┘yes
           ▼
┌──────────────────────┐
│ Autonomy permits?    │──no──► Approval request → wait (durable)
└──────────┬───────────┘           │
           ▼                       ▼
┌──────────────────────┐    ┌──────────────┐
│ Policy: consent,     │    │ Approved?    │──no──► rejected, recorded
│ suppression, budget  │    └──────┬───────┘
└──────────┬───────────┘           │yes
           ▼                       ▼
┌──────────────────────────────────────────┐
│ Execute via connector (idempotent)       │
└──────────────────────────────────────────┘
```

Every box is code. None is a prompt.

---

## 7. The approval UI contract

An approval screen must show:

1. **What will happen** — the exact action, recipient, channel, content.
2. **Why** — the evidence the agent used, with links.
3. **What it costs** — credits and, where applicable, provider fees.
4. **What has been checked** — consent status, suppression status, budget after.
5. **What happens if rejected** — the run stops, or a revision is requested.

An approval screen that shows only a message body and an Approve button is a rubber stamp with extra steps.

---

## 8. Testing the gates

Gate tests are the highest-value tests in the suite, because a gate failure is a real-world harm.

| Test | Assertion |
|---|---|
| Consent absent | Send refused with `consent_missing`, no provider call |
| Consent withdrawn | Queued messages invalidated, send refused |
| Suppressed | Refused, no provider call |
| Approval absent | Refused |
| Approval expired | Refused |
| Approval snapshot mismatch | Refused |
| Budget exhausted | Refused before network |
| Autonomy `suggest_only` + external action | Refused |
| Financial action at any autonomy | Always requires approval |
| Kill switch | Refused within one request |
| Batch approval without sample confirmation | Refused |

Each is a small test. Together they constitute the safety case for the product.

---

## 9. What is explicitly not permitted

| Not permitted | Why |
|---|---|
| Model decides whether consent exists | Deterministic boundary (`AGENTS.md` §2) |
| Model decides to send | Same |
| Approval by the same actor who requested, above a threshold | Separation of duties for high-volume action |
| Auto-approval based on a model's confidence score | Confidence is not authorisation |
| Silent downgrade to a cheaper model to fit budget | Changes output quality without disclosure |
| Retry after a content-policy refusal on another provider | Circumvention |
| Financial autonomy at any level | Asymmetric downside |
| "Remember my approval for next time" across subjects | Approval is scoped, not blanket |

---

## 10. Exit criteria (M4)

1. `Approval` is a persisted entity with actor, timestamp, and snapshot.
2. An external action without approval returns `403` — proven by test.
3. An expired approval returns `403` — proven by test.
4. A modified subject invalidates its approval — proven by test.
5. The policy engine is a pure function with ≥ 95% branch coverage.
6. Autonomy level is per agent and per capability, stored in the DB.
7. Demotion is automatic and measurable.
8. No code path can execute an external action without calling `assertAllowed`.

The last item is the one to enforce with an import-boundary lint rule: connectors are importable only from the hub, and the hub's `perform` always calls `assertAllowed`.
