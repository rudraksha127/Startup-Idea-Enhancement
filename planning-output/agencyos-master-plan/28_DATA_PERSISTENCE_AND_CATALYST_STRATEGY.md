# 28 — Data Persistence and Catalyst Strategy

`PROPOSED`. Resolves the four-model, three-path problem in `07`. **Catalyst remains authoritative; MongoDB does not replace it.**

---

## 1. The decision

| Question | Answer |
|---|---|
| Authoritative business database | **Zoho Catalyst Data Store (ZCQL)** |
| Second business database | **None** |
| MongoDB | Removed from the runtime path |
| Postgres | Permitted **only** as workflow-engine infrastructure, never for business data |
| Redis | Permitted **only** as workflow/cache infrastructure, never as a system of record |
| In-memory store | Tests only, unreachable in production |

### 1.1 The infrastructure/business distinction

This distinction is essential and frequently blurred:

| Store | Contents | Is it a system of record for the business? |
|---|---|---|
| Catalyst Data Store | Clients, prospects, audits, campaigns, messages, ledger, approvals | **Yes** |
| Temporal persistence (Postgres/Cassandra) | Workflow history, timers, activity state | No — it records *execution*, not business facts |
| Redis | Cache, rate-limit counters, locks | No |
| Object storage | Report PDFs, exports, evidence snapshots | No — derived artefacts |
| Langfuse (ClickHouse) | LLM traces | No — observability |

The workflow engine has its own database and that is legitimate. The error would be treating workflow history as business history. It is not: a workflow can be deleted and reconstructed from business records; business records cannot be reconstructed from workflow history.

---

## 2. ZCQL constraints and the design response

Research R2 (17 Nov 2026). Each constraint has a specific architectural answer.

| Constraint | Design response |
|---|---|
| DML only, no DDL | Committed `schema.manifest.json` + drift detection; schema applied via console runbook |
| ≤ 4 JOINs per query | Denormalise read models; precompute rollups; never join across contexts |
| No documented multi-statement transactions | Append-only ledger with idempotency keys and compensating entries |
| Result pagination limits | Cursor pagination everywhere; aggregations precomputed |
| No foreign keys | Application invariants + nightly reconciliation job |

---

## 3. Schema management

### 3.1 The manifest

```
/catalyst/schema.manifest.json
```

Single source of truth. Contains every entity, field, type, index, and relationship. Committed. Reviewed like code.

### 3.2 Generated artefacts

| Generated from manifest | Consumed by |
|---|---|
| TypeScript interfaces | All modules |
| Zod schemas | Route validation |
| Zod-derived JSON Schemas | Model output validation |
| ER diagram (Mermaid) | `docs/architecture/DATA_MODEL.md` |

**Consequence:** the four hand-written model copies (`07` §1) are deleted. There is one definition and it generates the rest. Drift becomes a compile error rather than a runtime surprise.

### 3.3 Drift detection

```
npm run schema:diff
```

Queries the live Catalyst project, compares to the manifest, and exits non-zero on any difference. Runs in CI against staging, and manually against production before any release.

**Why not automated apply:** ZCQL cannot DDL. Application is a console operation with a recorded runbook (`25` SOP). Automation would require the Catalyst management API, which is a separate integration and a later optimisation.

---

## 4. Repository layer

### 4.1 The interface

```ts
interface Repository<T> {
  findById(ctx: RepoContext, id: string): Promise<T | null>;
  findMany(ctx: RepoContext, query: Query): Promise<Page<T>>;
  create(ctx: RepoContext, input: CreateInput<T>): Promise<T>;
  update(ctx: RepoContext, id: string, patch: Patch<T>): Promise<T>;
}
```

`RepoContext` carries `orgId`, `actorId`, `correlationId`. **The caller cannot supply `orgId` as a query parameter** — the repository injects it from context and rejects any query containing an `orgId` clause from the caller.

### 4.2 Why this specific design

The tenancy leak in `07` §4 happened because filters were written by hand in 42 places. A design that requires remembering the filter will fail again. A design where the filter is *impossible to omit* cannot fail in that way.

Test (in `44`): for every repository method, calling it with a context for org A and an id belonging to org B returns `null`/`404`, never the record.

### 4.3 Implementations

| Implementation | Selected when | Guard |
|---|---|---|
| `CatalystRepository` | Production, staging, local-with-Catalyst | Default |
| `InMemoryRepository` | Unit tests | Requires `NODE_ENV === 'test'` **and** `USE_IN_MEMORY_STORE === 'true'`; throws at startup if `NODE_ENV === 'production'` |

Selection occurs in exactly one file. There is no fallback: if the selected implementation fails, the error propagates.

---

## 5. Transaction replacement: the append-only pattern

ZCQL has no `BEGIN/COMMIT`. Financial correctness is therefore achieved by construction.

### 5.1 The pattern

```
To charge 100 credits for a run:
  1. INSERT LedgerEntry { idempotencyKey: 'run:<runId>:charge',
                          direction: 'debit', amount: 100, ... }
  2. If the insert succeeds → charge applied exactly once.
  3. If it fails on unique idempotencyKey → already applied; treat as success.
  4. Update CreditAccount.balance cache (best-effort; reconcilable).

To reverse a charge:
  1. INSERT LedgerEntry { idempotencyKey: 'run:<runId>:refund',
                          direction: 'credit', amount: 100,
                          reversesEntryId: <original> }
  Never UPDATE or DELETE the original.
```

### 5.2 Why this is safer than transactions here

A transaction protects a multi-row invariant within one database. An append-only ledger protects the same invariant *without* requiring one, because:

- The unit of truth is a single immutable row.
- Idempotency makes retries safe.
- Balance is derived, so it cannot be corrupted independently of the entries.
- Disputes are resolvable by reading history rather than inferring state.

The cost is that balance is eventually consistent with the entries. Mitigation: reconcile on read for account pages, and on a scheduled job otherwise.

### 5.3 Reconciliation job

Runs hourly:

1. Sum all `LedgerEntry` per account.
2. Compare to `CreditAccount.balance`.
3. On mismatch: alert, write an `AuditLog` entry, and — critically — **do not auto-correct**. A mismatch means a bug; silently fixing it hides the bug.

---

## 6. Denormalisation strategy

Because joins are capped at four, the schema stores read-optimised fields.

| Read model | Denormalised fields | Refreshed by |
|---|---|---|
| `ProspectListItem` | latest audit score, latest audit date, message count, last contact date | Event on audit complete / message sent |
| `ClientDashboard` | leads contacted, replies, conversions, credits used, period | Scheduled rollup |
| `CampaignStats` | sent, delivered, replied, converted per step | Event on message state change |
| `OrgUsage` | credits consumed this period, runs, sends | Event on cost record |

Rules:
- A denormalised field is **derived** and always rebuildable from source records.
- A rebuild command exists (`npm run rebuild:readmodels`).
- If a read model is wrong, the fix is a rebuild, never a manual edit.

---

## 7. Data lifecycle

| Data | Retention | Basis |
|---|---|---|
| Prospect Places-derived fields | **30 days** from fetch | Google Maps TOS (R13) |
| Prospect `placeId` | Indefinite | TOS-exempt |
| Prospect core record | Until deleted or 24 months inactive | Business + DPDP minimisation |
| Audit + evidence | 24 months | Client reporting need |
| Messages | 24 months | Dispute resolution |
| Consent records | Indefinite (after withdrawal: 7 years, evidence only) | Legal defence |
| Ledger entries | Indefinite | Financial record |
| Audit log | 7 years | Compliance |
| LLM traces | 90 days (redacted) | Debugging |
| Reports | 24 months | Client access |
| Suppression list | Indefinite | Must outlive everything — a person who unsubscribed must never be re-contacted |

`PROPOSED` periods. The legally-required ones (ledger, audit, consent evidence) are not negotiable; the rest are policy choices (`46` D-10).

### 7.1 The purge job

A daily job enforces the table above, writes what it purged to `AuditLog`, and alerts on any entity it could not purge. **A retention policy without an enforced purge job is a document, not a control.**

---

## 8. Migration from the current state

There is no production data (`BLOCKED` on confirming, but no evidence of tenants exists). Therefore:

| Step | Action | Reversible |
|---|---|---|
| 1 | Author manifest for 26 entities (`26`) | Yes |
| 2 | Generate types + zod schemas | Yes |
| 3 | Implement `CatalystRepository` | Yes |
| 4 | Implement `InMemoryRepository` for tests | Yes |
| 5 | Switch reads to repository behind a flag | Yes |
| 6 | Switch writes | Yes |
| 7 | Delete Mongoose models | **No** — commit as a tagged revert point |
| 8 | Delete in-memory client from production path | **No** — same tag |
| 9 | Delete `backend/node_modules`, `backend/app.js` | **No** — git history retains |

If legacy local MongoDB data matters, step 6.5 exports it to JSON and imports via a one-shot script, recording every converted value (including the `1–10 → 0–100` score conversion) in an import report.

**This window — no production data — is the single largest advantage the project has.** It expires with the first customer.

---

## 9. Access control at the data layer

There is no Row Level Security in ZCQL. Isolation is therefore enforced in three places:

1. **Repository injection** — `orgId` is applied by the repository, not the caller.
2. **Query allowlist** — a repository rejects any query object containing an `orgId` key supplied by a caller.
3. **Test coverage** — a cross-tenant test suite that attempts access from a foreign org for every repository method.

Plus a defence-in-depth measure: **org-scoped cache keys** and **org-scoped object storage prefixes**, so a cache or storage mishap cannot cross tenants either.

This is weaker than database-enforced RLS and should be stated plainly: **it is application-level isolation, and its correctness depends on the repository being the only data access path.** A lint rule forbids importing the Catalyst SDK anywhere outside `platform/persistence`.

---

## 10. Backup and recovery

| Requirement | Approach |
|---|---|
| Business data backup | Catalyst export, daily, to object storage, 30-day retention |
| Restore test | Quarterly restore into staging and row-count comparison |
| Point-in-time | Catalyst capability dependent — `BLOCKED`, verify with vendor |
| Workflow history | Temporal's own retention (7–30 days configurable) |
| Deletion recovery | Soft delete + purge job grace period |

**Untested backups are not backups.** The quarterly restore test is the control; the daily export is only the mechanism.

---

## 11. Verdict

Catalyst can carry this product, but only if the team accepts three disciplines:

1. **Append-only for money.** No transactions means no in-place mutation.
2. **Denormalise for reads.** Four joins is a hard ceiling.
3. **Application-level tenancy.** No RLS means the repository is the only defence.

Each is a real constraint with a real cost. The alternative — a second transactional database — costs more, because dual-write without distributed transactions produces two disagreeing truths, and reconciling them is harder than designing around a constraint once.
