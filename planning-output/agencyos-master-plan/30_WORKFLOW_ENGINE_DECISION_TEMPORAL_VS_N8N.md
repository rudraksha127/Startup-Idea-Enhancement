# 30 — Workflow Engine Decision: Temporal vs n8n

`PROPOSED` recommendation with reasoning, licence verification, and a rejection analysis.

---

## 1. The requirement

The product must run work that:

- takes longer than a request (an audit of 50 pages)
- spans days (a campaign waiting for replies)
- waits for a human (approval before a send)
- must survive deploys and evictions
- must retry safely without duplicating side effects
- must be inspectable after the fact

This is the definition of **durable execution**. It is a specific capability, not a generic "automation" capability.

---

## 2. Candidates

| Candidate | Licence (R5, R3) | Model | Fit |
|---|---|---|---|
| **Temporal** | MIT, self-host or Cloud | Code-defined workflows, durable timers, signals | High |
| **n8n** | Sustainable Use License (**not OSI**) | Visual JSON workflows | Low–medium |
| **Cloudflare Workflows** | Platform service | Durable steps in Workers | Medium (platform lock-in) |
| **Inngest / Trigger.dev** | Vendor-hosted | Event-driven durable functions | Medium |
| **BullMQ** | MIT | Redis queues, no durability of state | Low |
| **Hand-rolled** | N/A | DB state machine + cron | Low–medium at this complexity |

---

## 3. Recommendation

> **Adopt Temporal in M4. Constrain n8n to internal operational glue. Do not use n8n as the product's execution engine.**

### 3.1 Why Temporal

| Property | Value to this product |
|---|---|
| **MIT licence** | No commercial restriction on offering it as part of a paid service (R5) |
| **Durable timers** | The 24-hour WhatsApp window, follow-up delays, approval timeouts — all free |
| **Signals** | Human approval is a first-class primitive (`waitForSignal`) rather than a polled table |
| **Code-defined** | Workflows are TypeScript, reviewed like code, unit-testable, versioned in git |
| **Deterministic replay** | A run can be reconstructed; this is the audit trail the product needs |
| **Activity retries** | Retry policy per activity, with backoff, without duplicating side effects |
| **Visibility** | Every workflow has state, history, and a UI |
| **Self-hostable** | No vendor dependency for a core capability |

### 3.2 Costs, stated honestly

| Cost | Magnitude |
|---|---|
| Operational surface | A Temporal cluster (Postgres + Temporal server + workers) or Temporal Cloud |
| Learning curve | Workflow determinism constraints are unfamiliar and easy to violate |
| Debugging | Replay-based debugging has a different mental model |
| Versioning | Workflow versioning requires discipline (`patched`, `getVersion`) |
| Local dev | Needs a local cluster or the dev server |

**Judgement:** the cost is real but bounded, and it is paid once. The alternative — hand-rolling durability — is paid continuously, in every feature, forever.

### 3.3 Alternatives rejected

**Cloudflare Workflows** — genuinely attractive: same platform as the Worker, no new cluster. Rejected for two reasons: (a) it creates deep platform lock-in for a core capability, contradicting the abstraction principle in `27`; (b) the Worker's execution model constrains long-running activities that need a persistent Node process. Reconsider if the Node service proves unnecessary.

**Inngest / Trigger.dev** — good developer experience, but vendor-hosted execution of customer business processes raises a data-processing question under DPDP (`39`) that Temporal self-hosted avoids.

**BullMQ** — a queue, not durable execution. A queued job that fails mid-way leaves no resumable state. It solves a different problem.

**Hand-rolled state machine + cron** — viable for one workflow, unmanageable for ten. The product will have at least: audit, qualification batch, outreach sequence, campaign execution, report generation, retention purge, ledger reconciliation, read-model rebuild. Each has timers, retries, and failure branches.

---

## 4. Why n8n is not the engine

### 4.1 The licence, precisely

Research R3 (17 Nov 2026): n8n uses the **Sustainable Use License**, which is not OSI-approved. It permits internal business use and certain non-commercial distribution. **Offering n8n's functionality to third parties as a hosted service requires a commercial agreement.**

An Agency-as-a-Service product that executes customer workflows on company-operated n8n infrastructure is providing n8n as a service.

**This is an `INFERRED` legal reading and requires counsel.** But the direction is clear enough to make an architectural decision now rather than discover it during a funding round.

### 4.2 The technical gaps

Beyond licensing, n8n does not provide what the product needs:

| Requirement | n8n |
|---|---|
| Deterministic replay of a run | No |
| Typed activity contracts | No (JSON nodes) |
| Unit-testable workflow logic | No |
| Versioned workflow definition in git as source of truth | Partial (exported JSON) |
| Per-step cost attribution | No |
| Native wait-for-human-signal with durable timeout | Partial (wait node) |
| Strong typing of step I/O | No |

A visual workflow tool optimises for *breadth of integrations and speed of authoring*. A durable execution engine optimises for *correctness of long-running state*. The product needs the second.

### 4.3 Where n8n legitimately fits

| Use | Permitted |
|---|---|
| Internal back-office automations (invoicing reminders, internal notifications) | Yes |
| Agency staff wiring tools for themselves | Yes |
| Customer-facing workflow execution | **No** without commercial licence |
| Product's core orchestration | **No** — wrong tool regardless of licence |

**Recommendation:** keep the existing n8n scripts as internal tooling, delete the 25 placeholder workflows (`10` §3), and do not present n8n in the product.

---

## 5. Workflow inventory (what runs on Temporal)

| Workflow | Trigger | Duration | Waits for human |
|---|---|---|---|
| `audit.run` | Request | minutes | No |
| `qualification.batch` | Request | minutes–hours | No |
| `outreach.sequence` | Campaign activation | days | **Yes — per message initially** |
| `message.send` | Approval | seconds | No |
| `campaign.execute` | Schedule | weeks | **Yes — on sequence changes** |
| `report.generate` | Schedule | minutes | No |
| `retention.purge` | Daily cron | minutes | No |
| `ledger.reconcile` | Hourly cron | seconds | No |
| `readmodel.rebuild` | Manual | minutes | No |
| `places.refresh` | Daily cron | minutes | No |

Ten workflows. Each is a TypeScript function with typed activities. Each is testable in isolation with a mocked activity layer.

---

## 6. Activity catalogue

Activities are the only place side effects happen.

| Activity | Side effect | Idempotent | Retry |
|---|---|---|---|
| `fetchPage` | none | yes | 3, backoff |
| `runChecks` | none | yes | 1 |
| `scoreAudit` | internal | yes | 1 |
| `callModel` | none (cost) | no — dedupe by key | 3 |
| `persistAudit` | internal | yes (upsert by key) | 3 |
| `sendEmail` | **external** | **must be** — idempotency key | 3, then dead-letter |
| `sendWhatsApp` | **external** | **must be** | 3, then dead-letter |
| `chargeCredits` | internal | yes (ledger idempotency) | ∞ (safe) |
| `syncCrm` | **external** | **must be** | 3 |
| `notifyOperator` | internal | yes | 1 |

### 6.1 The non-idempotent danger list

`sendEmail`, `sendWhatsApp`, `syncCrm` are the activities where a retry can cause real-world duplication. Each must carry a provider-side idempotency key derived from `(runId, messageId)`. For providers lacking native idempotency, connectors must execute atomic pre-send claim reservations and record an explicit uncertain-send state so retries reconcile provider status rather than blindly resending.

**Rule:** an external activity without an idempotency key is not permitted in the codebase. Enforced by the activity wrapper's type signature.

---

## 7. Deployment shape

```
Temporal cluster (self-hosted)
  ├── Postgres (Temporal's own DB — infrastructure, not business data)
  └── Temporal server

Workflow service (Node container)
  ├── Temporal worker (polls task queue)
  ├── Activity implementations
  └── Imports module services — never repositories directly
```

Deployed on a Node host (Zoho AppSail or equivalent). This is the only component that genuinely requires a long-lived process, which is why it exists (`27` §2.1).

**Scaling:** workers scale horizontally; the cluster does not need to scale until workflow volume is high. Start with one worker, one cluster.

---

## 8. Versioning discipline

| Change | Technique |
|---|---|
| Add an activity | Safe |
| Change activity signature | New activity name |
| Reorder steps | `patched()` guard |
| Change branching logic | `getVersion()` |
| Delete a workflow | Stop new starts; let running complete; remove after retention |

Violating determinism produces non-deterministic replay errors at runtime, which are painful to diagnose. Mitigation: a lint rule against `Date.now()`, `Math.random()`, and direct I/O inside workflow code (they belong in activities), plus a replay test in CI.

---

## 9. Decision record

> **ADR-007: Durable execution engine**
>
> **Status:** Proposed
> **Decision:** Temporal (MIT) for all multi-step, long-running, or human-gated work. n8n restricted to internal operational use.
> **Rationale:** durable timers, signals, deterministic replay, and per-activity retries are required by the product's core flows; n8n's licence also restricts hosted multi-tenant use.
> **Consequences:** one additional deployable and cluster. Workflow code must obey determinism constraints. n8n remains as internal glue only.
> **Revisit if:** Cloudflare Workflows matures to cover long-running Node activities without lock-in, or if workflow volume stays low enough that a hand-rolled state machine suffices (unlikely beyond ten workflows).

---

## 10. Sequencing note

Temporal is **M4**, not M1. Building the durable layer before there is business state to make durable would be premature. M1–M3 establish identity, schema, and the first synchronous audit vertical (M3); M4 introduces durable workflow orchestration for multi-step flows and approval gates. Outreach durability follows in M6.

Interim: M1–M3 use synchronous request/response with no long-running work. That is acceptable because the audit (M3) is fast enough to complete in a request. The first genuinely durable need is the approval wait in outreach (M6) — which is why M4 precedes M6.
