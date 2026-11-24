# 26 — Domain Model and Bounded Contexts

`PROPOSED`. One authoritative model, replacing the four in `07`. This document is the specification `28` implements.

---

## 1. Bounded contexts

Five contexts, each with one owner module and its own entities. Cross-context access is via identifiers and explicit read models, never via shared mutable tables.

| # | Context | Owns | Does not own |
|---|---|---|---|
| 1 | **Identity** | User, Organisation, Membership, Session | Any business data |
| 2 | **Prospecting** | Prospect, ProspectBatch, ProspectProfile, Source | Messages, audits |
| 3 | **Assessment** | Audit, AuditCheck, AuditEvidence, Score | The prospect's commercial state |
| 4 | **Engagement** | Campaign, SequenceStep, Message, ConsentRecord, Suppression, Reply | Audit computation |
| 5 | **Commerce** | CreditAccount, LedgerEntry, Invoice, Payment, CostRecord | Campaign state |

Plus two cross-cutting stores:

| Context | Owns |
|---|---|
| **Execution** | AgentDefinition, AgentRun, RunStep, ToolCall, Approval |
| **Governance** | AuditLog, Integration, FeatureFlag, RetentionPolicy |

---

## 2. Entity definitions

### 2.1 Identity

```
User
  id, email (unique), passwordHash, name, status,
  mfaSecret?, createdAt, lastLoginAt

Organisation
  id, name, slug (unique), plan, status,
  createdAt, dataRegion

Membership
  id, userId, orgId, role, status, invitedBy, joinedAt
  UNIQUE(userId, orgId)

Session
  id, userId, orgId, refreshTokenHash, userAgent, ip,
  createdAt, expiresAt, revokedAt?
```

**Invariants**
- A `User` may belong to multiple `Organisation`s.
- Every business entity carries `orgId` referencing `Organisation`.
- `role` ∈ `owner | admin | operator | viewer | client_viewer`.
- `Session.revokedAt` is checked on every request; a revoked session fails immediately.

### 2.2 Prospecting

```
Prospect
  id, orgId, businessName, domain?, placeId?, phone?, email?,
  addressLine?, locality?, region?, country?,
  source: 'google_places' | 'manual' | 'import' | 'referral' | 'website',
  sourceRef, firstSeenAt, lastFetchedAt?, expiresAt?,
  status: 'new' | 'qualified' | 'contactable' | 'contacted'
        | 'engaged' | 'converted' | 'disqualified' | 'archived',
  createdAt, createdBy, deletedAt?

ProspectProfile        (the customer's definition of a good fit)
  id, orgId, name, criteria (JSON, schema-validated), weights,
  isActive, createdAt

ProspectBatch
  id, orgId, profileId, size, status, createdBy, createdAt
```

**Critical invariant — `expiresAt`.**
If `source = 'google_places'`, then Places-derived fields (`businessName`, `addressLine`, `phone`, ratings, hours) must be purged at `expiresAt = lastFetchedAt + 30 days` (`39`, research R13). `placeId` is exempt and may persist indefinitely.

This is the schema-level expression of a legal constraint. It is not optional and must be enforced by a scheduled purge job, not by developer discipline.

### 2.3 Assessment

```
Audit
  id, orgId, subjectType: 'prospect' | 'client', subjectId,
  url, status: 'queued' | 'running' | 'complete' | 'partial' | 'failed',
  score?, rubricVersion, startedAt, completedAt, failureReason?,
  correlationId

AuditCheck
  id, auditId, checkKey, status: 'pass' | 'fail' | 'warn' | 'skipped' | 'error',
  weight, pointsAwarded, evidence (JSON), durationMs

AuditNarrative
  id, auditId, version, model, promptVersion, body,
  citations: [checkId], validationStatus, createdAt
```

**Invariants**
- `score` is computed by `rubricVersion` over `AuditCheck` rows. It is **never** supplied by a model.
- If any check has `status = 'error'`, the audit may not be `complete`; it is `partial`.
- `AuditNarrative.citations` must be non-empty for a narrative to be publishable.
- Two audits of the same URL with the same rubric version may differ (the web changes), but regenerating the *report* for one audit is deterministic.

### 2.4 Engagement

```
Campaign
  id, orgId, clientId, name, status: 'draft' | 'active' | 'paused'
        | 'completed' | 'cancelled',
  sequenceId, createdBy, createdAt

Message
  id, orgId, campaignId, prospectId, channel: 'email' | 'whatsapp',
  templateId?, subject?, body,
  status: 'draft' | 'pending_approval' | 'approved' | 'queued'
        | 'sent' | 'delivered' | 'bounced' | 'failed'
        | 'suppressed_dry_run' | 'rejected',
  providerMessageId?, sentAt?, failureReason?,
  idempotencyKey (unique), approvalId?, correlationId

ConsentRecord
  id, orgId, prospectId, channel, scope, basis,
  status: 'granted' | 'withdrawn' | 'expired',
  capturedAt, capturedVia, evidenceRef, expiresAt?

Suppression
  id, orgId, channel, address, reason, createdAt, createdBy
  UNIQUE(orgId, channel, address)
```

**Invariants**
- `Message` cannot transition to `queued` without: a `ConsentRecord` (status `granted`, matching channel and scope), an `Approval`, available budget, and a non-suppressed address.
- `idempotencyKey` is unique — replaying a send request cannot duplicate a message.
- `Suppression` is checked before every send and is global within the org.
- A `ConsentRecord` withdrawal immediately invalidates queued messages for that contact and channel.

### 2.5 Commerce

```
CreditAccount
  id, orgId, balance, reserved, updatedAt
  (balance and reserved are DERIVED from LedgerEntry, cached here)

LedgerEntry                        (append-only, immutable)
  id, orgId, accountId, type, direction: 'debit' | 'credit',
  amount, currency, unit: 'credit' | 'currency',
  reason, refType, refId, idempotencyKey (unique),
  createdAt, createdBy, reversesEntryId?

CostRecord
  id, orgId, runId?, provider, tokensIn?, tokensOut?,
  costMinor, currency, occurredAt

Invoice
  id, orgId, periodStart, periodEnd, amountMinor, currency,
  status: 'draft' | 'open' | 'paid' | 'void' | 'past_due',
  providerInvoiceId?, paidAt?, reconciledAt?
```

**Invariants — these carry the financial integrity of the product**
1. `LedgerEntry` rows are never updated or deleted. Corrections are new rows with `reversesEntryId`.
2. Every entry has an `idempotencyKey`; duplicate submission is a no-op.
3. `CreditAccount.balance` is a cache derived from entries and must reconcile to the sum on every read or on a scheduled job.
4. `Invoice` transitions to `paid` **only** after reconciliation against the provider, never from a webhook alone.
5. No negative balance without an explicit overdraft entry of type `overdraft_grant`.

Because ZCQL has no multi-statement transactions (R2), invariant 1–3 replace transactions entirely. This is the design decision that makes a financial ledger possible on Catalyst.

### 2.6 Execution

```
AgentDefinition
  id, orgId?, key (unique), name, category, version,
  modelClass, promptTemplate, outputSchema, toolAllowlist,
  budgetCredits, autonomyLevel: 'suggest_only'
        | 'execute_with_approval' | 'execute_autonomously',
  isActive, createdAt

AgentRun
  id, orgId, agentKey, agentVersion, trigger, status:
    'queued' | 'running' | 'awaiting_approval' | 'succeeded'
    | 'failed' | 'cancelled' | 'rejected',
  input (JSON), output (JSON)?, errorCode?, errorMessage?,
  tokensIn?, tokensOut?, costMinor?, startedAt, completedAt,
  correlationId, workflowId?, idempotencyKey (unique)

RunStep
  id, runId, index, kind: 'model' | 'tool' | 'approval' | 'validation',
  name, status, input?, output?, durationMs, errorCode?

Approval
  id, orgId, runId?, messageId?, requestedBy, requestedAt,
  decidedBy?, decision: 'approved' | 'rejected' | 'expired',
  decidedAt?, note?, scope (JSON)
```

**Invariants**
- `AgentRun` terminal states are terminal; no transition out of `succeeded`/`failed`/`cancelled`/`rejected`.
- `awaiting_approval` is a durable state that survives restarts — this is why `30` recommends durable execution.
- An `Approval` records who decided, when, and what they saw. It cannot be created by the system on its own behalf.
- `AgentRun.tokensIn/Out/costMinor` are written from provider responses, never estimated constants.

### 2.7 Governance

```
AuditLog                          (append-only)
  id, orgId, actorId, actorType: 'user' | 'system' | 'agent',
  action, entityType, entityId, before?, after?,
  ip?, userAgent?, correlationId, createdAt

Integration
  id, orgId, provider, status: 'connected' | 'error' | 'not_configured',
  secretRef (NOT the secret), connectedBy, connectedAt,
  lastCheckedAt, lastErrorCode?

FeatureFlag
  id, key, scope: 'global' | 'org', orgId?, enabled,
  updatedBy, updatedAt

RetentionPolicy
  id, entityType, retentionDays, basis
```

**Invariants**
- `AuditLog` is append-only; no update or delete path exists in code.
- `Integration` stores a *reference* to a secret, never the secret.
- Every feature flag is individually disableable at runtime (`25` SOP-06).

---

## 3. The single lead-status enum

Replacing four competing definitions (`07` §1):

```
new → qualified → contactable → contacted → engaged → converted
  ↘ disqualified          ↘ archived (from any state)
```

| State | Meaning | Entered by |
|---|---|---|
| `new` | Recorded, no assessment yet | Import / discovery |
| `qualified` | Assessment says it is worth pursuing | System (score threshold) |
| `contactable` | A lawful contact basis exists | System (consent/legitimacy check) |
| `contacted` | At least one message sent | System (send confirmed) |
| `engaged` | A reply was received | System (inbound) |
| `converted` | Became a client | Human |
| `disqualified` | Assessment says no | System or human |
| `archived` | Removed from active work | Human |

`suggested` is not a state. It is a UI affordance for the next transition.

`opportunityScore` is a single integer `0–100`, derived from the audit rubric. Any legacy `1–10` value is multiplied by 10 at import, and the conversion is recorded in the `AuditLog`.

---

## 4. Cross-context rules

| Rule | Reason |
|---|---|
| Assessment never writes to Prospecting | Audit results are immutable facts; prospect state derives from them |
| Engagement never computes an audit score | Scores come from Assessment only |
| Commerce consumes `CostRecord`, never computes cost | One place measures money |
| Execution may read any context, writes only its own | Prevents an agent from mutating business state directly |
| Governance observes everything, mutates nothing but flags | Audit integrity |

The last rule matters most: **an agent cannot write a business entity.** It proposes an action; the action is executed by the owning context after gates pass. This is what makes "autonomous" survivable.

---

## 5. Entity count and migration note

| Context | Entities |
|---|---|
| Identity | 4 |
| Prospecting | 3 |
| Assessment | 3 |
| Engagement | 4 |
| Commerce | 4 |
| Execution | 4 |
| Governance | 4 |
| **Total** | **26** |

26 entities replace an ambiguous set of ~17 spread across three model copies. Ten of the 26 do not exist in any form today (ConsentRecord, Suppression, LedgerEntry, CostRecord, Approval, AgentRun, RunStep, AuditLog, RetentionPolicy, FeatureFlag).

Because there is no production data (`07` §8), this is **schema establishment, not migration**. That window closes on the first paying customer.
