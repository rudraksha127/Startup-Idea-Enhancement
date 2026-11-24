# 07 — Data Model and Persistence Audit

**This is the most consequential document in Part I.** Six of the nine critical defects in the system are data-model defects or are caused by them.

---

## 1. Four model universes

The repository contains four independent definitions of the same business entities. They disagree on field names, types, and semantics.

| # | Location | Purpose | Lead status values |
|---|---|---|---|
| 1 | `frontend/src/models/` | Mongoose models used by Next API routes | `New`, `Contacted`, `Interested`, `Replied`, `Converted`, `Archived` |
| 2 | `packages/shared-types/` | TypeScript types shared to frontend | `New`, `Contacted`, `Meeting Booked`, `Proposal Sent`, `Closed Won`, `Lost` |
| 3 | `database/models/` and `database/schema/schemas.ts` | Second Mongoose/validation copy | `opportunityScore` on a **1–10** scale |
| 4 | Catalyst manifest | ZCQL entity definitions | `qualificationStatus` (separate field, different vocabulary) |

`SOURCE-VERIFIED`.

### 1.1 The two specific contradictions

**Lead status.** Set 1 and Set 2 share only two values out of six. A lead marked `Interested` in set 1 is not representable in set 2. A lead marked `Meeting Booked` in set 2 is not representable in set 1. Any sync between them silently drops or coerces state.

**Opportunity score.** Set 3 uses `1–10`. The dashboard and analytics surfaces present scores on a `0–100` scale. A lead scored `7` will render as `7%` or `7/100` depending on which component reads it. There is no conversion function, so the same lead has two different scores depending on the code path.

### 1.2 Why duplication happened

`packages/` contains **both** `shared-types` + `utilities` **and** `contracts` + `utils` — two parallel shared-package sets (`SOURCE-VERIFIED`). This is evidence of an incomplete migration: a new shared layer was started before the old one was removed, and both survived.

---

## 2. Three persistence paths (recap and detail)

| Path | Stores | Durability | Authority |
|---|---|---|---|
| MongoDB (Mongoose) | leads, users, projects, clients, teams, audits, campaigns | Real if `MONGODB_URI` reachable | **Claimed** by ADR-004 |
| Catalyst ZCQL | entities per Catalyst manifest | Real if configured | **Claimed** by ADR-005 and project intent |
| In-memory fake | anything that hit the injection point | **None** — lost on process recycle | **None, but returns success** |

### 2.1 The in-memory fake in detail

`backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` implements a ZCQL-shaped interface in memory. It is described as a fallback for local development.

**The defect is not that it exists. It is that nothing distinguishes it at runtime.** No log line is emitted at the call site, no response field indicates volatile storage, and no startup check asserts that the production client is real. A production deployment missing one environment variable silently becomes a lossy in-memory database that reports success.

`INFERRED` with high confidence: this is how data loss would occur in production, and it would be extremely difficult to diagnose because every request returns `2xx`.

### 2.2 Correction (`PROPOSED`)

- Delete the in-memory client from the production bundle.
- Introduce `CatalystRepository` and `InMemoryRepository` behind one interface.
- Select the implementation in exactly one place, keyed on `NODE_ENV === 'test'` **and** an explicit `USE_IN_MEMORY_STORE=true` that throws at startup if `NODE_ENV === 'production'`.
- Add a readiness probe that executes a trivial ZCQL read and fails if it does not return.

---

## 3. ZCQL constraints and what they forbid

External research (R2), recorded 17 Nov 2026. Zoho Catalyst's ZCQL is **not** a general-purpose SQL dialect:

| Constraint | Consequence for this design |
|---|---|
| DML only — no `CREATE TABLE`, `ALTER`, `DROP` | Schema is managed through the Catalyst console/manifest, not migrations in code. Schema drift becomes invisible without a manifest diff step. |
| Maximum **4** `JOIN` clauses per query | Deep relational reads must be decomposed into multiple queries or denormalised. An analytics query joining leads → campaigns → clients → projects → users already exhausts the budget. |
| No documented multi-statement transactions | **A financial ledger cannot rely on `BEGIN/COMMIT`.** Invariants must be enforced by append-only design plus compensating entries. |
| Row limits / pagination on result sets | Aggregations must be precomputed or paginated in application code. |

### 3.1 The three things this makes hard

1. **Financial correctness.** Credits, invoices, and payments cannot be updated atomically across rows. `36` specifies an append-only ledger with idempotency keys and compensating entries instead of transactions.
2. **Analytics.** A dashboard that aggregates across five entities requires four JOIN clauses, reaching the 4-JOIN constraint limit. `36` and `37` specify precomputed rollup entities written by a job.
3. **Referential integrity.** No foreign keys. Orphan rows are possible and must be prevented by application invariants plus a reconciliation job.

### 3.2 The decision this forces

Either (a) accept ZCQL's constraints and design around them, or (b) introduce a second, transactional store for financial state and accept dual-write complexity.

**This plan recommends (a)** (`28`). Rationale: a dual-write financial system without distributed transactions is *more* dangerous than an append-only ledger on a constrained store, because it can produce two disagreeing truths. Constraint: every financial entity must be append-only and idempotent, requiring an atomic or durably serialized balance check and debit admission to prevent concurrent double-spending.

---

## 4. Identity and tenancy model

`SOURCE-VERIFIED`:

- `User` has an email and password hash.
- Organisation identity is resolved at request time from a token claim, with a fallback to `org-apex-001`.
- There is **no** `organisationId` foreign key enforced across entities in the Mongoose models observed; filtering by organisation is done ad hoc in query filters.

### 4.1 Impact

Multi-tenancy is currently a convention, not a constraint. A single missing `.where({ orgId })` in any of 42 routes is a cross-tenant leak. In a system where several routes already fall back to a *shared* org, the probability that at least one filter is missing is high. A targeted audit is an M1 task; this document records the *structural* risk rather than claiming a specific leak was found (`INFERRED`; exploitation `BLOCKED`).

### 4.2 Correction (`PROPOSED`)

- `orgId` becomes a required, indexed field on every tenant-scoped entity.
- A repository layer **always** injects `orgId` from the resolved session; callers cannot pass it. This removes the ability to forget the filter.
- A test enumerates every repository method and asserts it rejects a caller-supplied `orgId` that differs from the session's.

---

## 5. Schema versioning

There is no migration framework in use for Catalyst (`SOURCE-VERIFIED` absence), and `database/scripts/manage.ts` provides `migrate`, `indexes`, `seed`, `health` subcommands whose targets are MongoDB.

**Consequence:** the Catalyst schema exists only as console state. A new environment cannot be created from the repository. Onboarding a second developer means manually recreating entities.

**Correction (`PROPOSED`):** a committed `catalyst/schema.manifest.json` that is the single source of truth, plus a `schema:diff` script that queries the live project and fails CI on drift. Schema *application* remains a human/console action with a recorded runbook — because ZCQL cannot DDL — but *drift detection* becomes automatic. Specified in `28`.

---

## 6. Entity inventory and disposition

| Entity | Exists today | Authority | Disposition |
|---|---|---|---|
| User | Mongoose | Ambiguous | Keep; move to Catalyst; add `orgId` |
| Organisation | Implicit (`org-apex-001`) | None | **Create** as first-class entity |
| Membership | Absent (roles on User) | None | **Create** (user ↔ org ↔ role) |
| Lead | 3 definitions | Ambiguous | Consolidate to one; single status enum |
| LeadAudit | Fixed score generator | None | Rebuild as evidence-backed record |
| Campaign | Client constants + Mongoose | Ambiguous | Keep; require real send records |
| OutreachMessage | Partial | Ambiguous | **Create** with provider message ID |
| Agent | Hardcoded array | None | **Create** as DB entity with versioned prompt |
| AgentRun | Fake | None | **Create** with trace, budget, status machine |
| Approval | Canned return | None | **Create** with actor, decision, timestamp |
| CreditAccount | Absent | None | **Create** |
| LedgerEntry | Absent | None | **Create** append-only |
| Invoice | Mongoose, unauthenticated mutation | None | Rebuild with provider reconciliation |
| Project | Mongoose | Ambiguous | Keep |
| Client | Mongoose | Ambiguous | Keep |
| Template | Mongoose | Ambiguous | Keep |
| Integration | Config-derived, not persisted | None | **Create** connection records |
| AuditLog | Absent | None | **Create** — required for DPDP and for trust |
| ConsentRecord | Absent | None | **Create** — required for TRAI/WhatsApp |

`PROPOSED` dispositions. The absence of `ConsentRecord` and `AuditLog` is both a compliance failure (`39`) and an operational one: neither "who approved this send" nor "did this person consent" can be answered today.

---

## 7. Data-integrity invariants to enforce

Each becomes a test in `44`.

1. Every tenant-scoped row has a non-null `orgId` equal to the writer's org.
2. Lead status is a single enumerated set; no other value can be written.
3. `opportunityScore` is one scale (proposed `0–100`, integer) with a documented conversion if any legacy `1–10` data exists.
4. A `LedgerEntry` is immutable; corrections are new entries referencing the corrected entry.
5. An `AgentRun` in a terminal state cannot transition.
6. A message cannot be sent without a `ConsentRecord` whose scope covers the channel and whose status is `granted`.
7. An `Approval` references exactly one `AgentRun` step and records actor, decision, and timestamp.
8. Deleting a lead is a soft delete with `deletedAt`, because DPDP erasure and business retention have different clocks.

---

## 8. Migration shape (`PROPOSED`, detailed in `28`)

There is no production data to migrate as far as this audit can establish (`BLOCKED` — no database access). Therefore the plan is **not** a data migration; it is a **schema establishment**:

1. Author the Catalyst manifest as the single source of truth.
2. Generate TypeScript types from the manifest; delete the three hand-written model copies.
3. Route all reads/writes through repositories bound to Catalyst.
4. Delete Mongoose from the runtime path; retain it only in a one-shot export script if legacy local data must be preserved.
5. Delete the in-memory client from production code paths.

This is cheaper than a migration and is only possible because the system has no real users yet. That window closes the moment a paying customer exists. **This is the strongest single argument for consolidation now.**

---

## 9. Verdict

| Dimension | Assessment |
|---|---|
| Single source of truth | **None** |
| Enum consistency | **Four conflicting definitions** |
| Transactional integrity | **Unavailable on ZCQL; unaddressed** |
| Tenancy enforcement | **Convention only** |
| Schema versioning | **None** |
| Audit/consent records | **Absent** |
| Silent data loss risk | **High** — in-memory fallback reports success |

Data is the product. Today the product has four disagreeing definitions of its primary entity and a storage layer that can accept writes into volatile memory while reporting success. Everything in Part III is downstream of fixing this.
