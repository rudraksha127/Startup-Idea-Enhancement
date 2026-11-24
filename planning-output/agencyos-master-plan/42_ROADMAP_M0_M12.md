# 42 — Roadmap M0–M12

Thirteen milestones. Each has a single sentence of purpose, explicit exit criteria, and a stop point.

**Sequencing principle:** safety → truth → usefulness → scale → commerce. No milestone may begin before its predecessor's exit criteria are met. This is not ceremony; every reordering in this plan reintroduces a defect the plan exists to remove.

---

## Overview

| M | Name | Purpose | Duration | Depends on |
|---|---|---|---|---|
| M0 | Subtraction | Remove what is false or dangerous | 1 week | — |
| M1 | Enforcement | Make the app safe to show anyone | 2 weeks | M0 |
| M2 | Foundation | One authoritative store, real tenancy | 3 weeks | M1 |
| M3 | First real vertical | Audits that are actually audits | 3 weeks | M2 |
| M4 | Substrate | Durable execution, ledger, gates, observability | 3 weeks | M3 |
| M5 | Discovery | Compliant prospect sourcing | 2 weeks | M4 |
| M6 | Outreach | Consented, approved, tracked email | 3 weeks | M5 |
| M7 | Autonomy | Earned autonomy + WhatsApp (conditional) | 3 weeks | M6 |
| M8 | Delivery | Reporting, proposals, CRM sync | 3 weeks | M7 |
| M9 | Commercialisation | Billing, staging, security gate | 3 weeks | M8 |
| M10 | Enterprise readiness | SSO, ReBAC, isolation options | 4 weeks | M9 |
| M11 | Scale | Performance, cost, reliability | 4 weeks | M10 |
| M12 | Platform | Multi-agency workspace | 6+ weeks | M11 |

Durations are effort estimates for one experienced engineer, not calendar commitments. They are deliberately optimistic in the sense that they exclude the discovery work each milestone will surface.

---

## M0 — Subtraction

**Purpose:** remove everything that is false or dangerous. This milestone makes the product *smaller*.

**Scope**

| # | Task | Debt ID | Effort |
|---|---|---|---|
| 1 | Delete phone synthesis in agent run route | AGT-07 | 1h |
| 2 | Delete `CANONICAL_OUTPUTS`; return `501` | AGT-06 | 3h |
| 3 | Remove "Google Maps Verified" label and static registry from API responses | INT-01 | 2h |
| 4 | Delete `Math.random()` audit metrics; render empty state | UI-01 | 2h |
| 5 | Remove fixed audit scores; return `501` or empty | UI-02 | 2h |
| 6 | Make `approveRun` return `501`; disable the endpoint | AGT-03 | 1h |
| 7 | Delete client-side synthetic datasets (`REALISTIC_BUSINESSES`, `DEFAULT_CAMPAIGNS`, `CANONICAL_13_UI_AGENTS`) | UI-03, UI-04, UI-05 | 4h |
| 8 | Add `KNOWN_LIMITATIONS.md` listing every fake surface | `14` §2 | 2h |
| 9 | Fix the failing test | TST-01 | 1h |
| 10 | Fix CI secret scan paths; make security + lint blocking | TST-02, TST-03 | 2h |
| 11 | Untrack `backend/node_modules` and `backend/app.js` | SEC-19, BLD-04 | 2h |
| 12 | Rewrite status docs to state the actual test result | DOC-01 | 2h |

These twelve work items map to **fifteen task IDs** in `43`: three supporting tasks (enumerating synthetic constants, writing the limitations page, and opening the cost-tracking sheet) sit in block A and carry an M0 milestone.

**Exit criteria**
- No surface displays a number or record that no system produced.
- None of the four synthetic dataset constants remains in the production bundle.
- `KNOWN_LIMITATIONS.md` enumerates every fake surface from `14` §2.
- `npm run test` passes.
- CI secret scan scans real paths and blocks on findings.
- `git ls-files | grep node_modules` returns nothing.
- Status docs state 72/72 or whatever is true at completion.

**Stop point:** after M0 the product is honest and less impressive. Founders should expect this and not interpret it as regression.

---

## M1 — Enforcement

**Purpose:** make it impossible to use the product without a real identity and organisation.

| # | Task | Debt ID |
|---|---|---|
| 1 | Delete `org-apex-001`; `resolveOrg` throws | SEC-02 |
| 2 | `requireEnv('JWT_SECRET')`; remove fallback | SEC-05 |
| 3 | Delete backdoor credentials from login UI, seed, and docs | SEC-06, SEC-07 |
| 4 | Auth middleware rejects by default; `@Public()` allowlist | SEC-01, SEC-10 |
| 5 | Add `middleware.ts` with session + org + headers + rate limit | SEC-03, SEC-14, SEC-16 |
| 6 | Dashboard layout → Server Component with session guard | SEC-04 |
| 7 | Zod validation on every route | API-01 |
| 8 | Delete catch-and-substitute; typed errors + correlation IDs | API-02, API-03 |
| 9 | Billing webhook signature verification + idempotency | SEC-08, SEC-09 |
| 10 | n8n webhook HMAC | SEC-17 |
| 11 | `AuditLog` + `ConsentRecord` entities | DAT-09, DAT-10 |
| 12 | `Approval` entity | DAT-12 |
| 13 | Auth-coverage test (every non-public route → 401) | TST-05 |
| 14 | Delete broken Dockerfiles; fix `npm start` | BLD-01, BLD-02 |
| 15 | Integration diagnostics require owner role | SEC-18 |
| 16 | Gate `n8n:deploy` behind explicit env flag | WF-05 |
| 17 | Fix `settings` route to use session user | API-12 |
| 18 | Empty/Degraded/Error state components | UI-07 |

**Exit criteria**
- Anonymous access to every non-public route returns `401` (enumerating test).
- `org-apex-001` does not appear in the codebase or the built bundle.
- Startup fails without `JWT_SECRET`.
- A webhook without a valid signature returns `400` and changes nothing.
- No route accepts an unvalidated body.
- Dashboard redirects to login when unauthenticated.

**Stop point:** the product is now safe to show. It is still largely empty. This is the correct trade.

---

## M2 — Foundation

**Purpose:** one store, one schema, one tenancy model.

| # | Task | Debt ID |
|---|---|---|
| 1 | Author `catalyst/schema.manifest.json` (26 entities) | DAT-06 |
| 2 | Generate types + Zod schemas from manifest | DAT-04, DAT-05 |
| 3 | `CatalystRepository` with `orgId` injection | DAT-01, SEC-11 |
| 4 | `InMemoryRepository` test-only with production guard | DAT-01 |
| 5 | Delete Mongoose from runtime path | BLD-05, DAT-17 |
| 6 | Delete in-memory Catalyst client | DAT-01 |
| 7 | `Organisation` + `Membership` entities | DAT-07, DAT-08 |
| 8 | Single lead status enum + score scale | DAT-02, DAT-03 |
| 9 | Cross-tenant test suite | TST-06 |
| 10 | `schema:diff` drift check in CI | DAT-06 |
| 11 | Structured logging + error tracking | BLD-09 |
| 12 | Readiness probe (Catalyst reachable) | API-09 |
| 13 | Kill switches (`FeatureFlag`) | `25` SOP-06 |
| 14 | Role capability map + `withAuth` wrapper | `34` §6 |
| 15 | Session revocation | SEC-12 |
| 16 | Secret management via bindings; rotation runbook | BLD-10 |
| 17 | Places 30-day expiry enforcement | INT-02 |
| 18 | Retention purge job | DAT-15 |
| 19 | Rollback runbook | BLD-08 |
| 20 | Backup + restore test into provisioned staging environment | `28` §10 |
| 21 | **Verify ZCQL unique constraint** | R-07 (T-061) |
| 22 | ADR-006 committed; ADR-004/005 superseded | DOC-02, DOC-03 |

**Exit criteria**
- One repository path; no silent fallback exists.
- Cross-tenant access returns `404` for every repository method.
- Schema drift fails CI.
- Readiness fails when Catalyst is unreachable.
- A kill switch disables a capability within one request.
- Staging environment provisioned and backup restored into staging with row-count verification before M2 exit.
- Only one target architecture is in force.

**Critical unknown resolved here:** whether ZCQL enforces unique constraints. If not, the ledger uses deterministic row IDs (`36` §3.4). This must be settled before M4.

---

## M3 — First real vertical

**Purpose:** an audit that is actually an audit. This is the wedge and the first sellable capability.

| # | Task |
|---|---|
| 1 | Crawler with SSRF guards (`38` §3.7) |
| 2 | 12 deterministic checks with evidence capture |
| 3 | Published rubric + deterministic score |
| 4 | `Audit`, `AuditCheck`, `AuditEvidence` persistence |
| 5 | LLM gateway (LiteLLM) + redaction |
| 6 | Langfuse self-hosted + traces |
| 7 | `AgentDefinition` + `AgentRun` + `RunStep` persistence |
| 8 | `audit.narrative` agent with output schema + citations |
| 9 | Schema validation with one retry, then fail |
| 10 | Deterministic eval checks for citations |
| 11 | Report renderer (server-side, exportable) |
| 12 | Report regeneration determinism test |
| 13 | Provenance affordance in UI (`23` §2, P3) |
| 14 | Prompt-injection fixture test |
| 15 | Cost capture per model call |
| 16 | Remove `/audits` placeholder; wire to real audits |
| 17 | Delete `/website-builder` or mark it unavailable (T-098, D-09) |

**Exit criteria**
- An audit of a real URL produces a score derived from stored checks.
- Every score links to its evidence.
- Regenerating a report produces identical output.
- No model call produces a score.
- Traces exist, redacted, with cost.
- An injected crawl page does not cause an external action.
- `npm run test` and eval checks pass.

**This is the first milestone that produces something a customer would pay for.**

**Design-partner boundary (applies from M3).** A "design partner" is an external business running one audit engagement under all of the following:

- A signed pilot agreement naming the data, the retention period, and the deletion path.
- A public target URL only; no access to internal systems, credentials, or private customer data.
- Manual delivery by the founder; no self-serve account, no payment flow, no SLA.
- Data stored in the staging environment, exported for delivery, and deleted on request.

This is deliberately *not* commercial launch. It is the smallest way to test whether the audit is worth paying for without putting production tenancy, billing, or a security review ahead of evidence. M9 remains the gate for self-serve customers, payment data, and customer-facing SLAs.

---

## M4 — Substrate

**Purpose:** the machinery every later vertical depends on: durability, money, gates, quality.

| # | Task |
|---|---|
| 1 | Temporal cluster + workflow service; archive the 25 placeholder n8n workflows |
| 2 | `audit.run` migrated to a workflow |
| 3 | Ledger entities + append + idempotency |
| 4 | Balance computation + reconciliation job |
| 5 | Budget enforcement in gateway |
| 6 | Approval engine + snapshot hash |
| 7 | Policy engine (pure function, ≥95% coverage) |
| 8 | Autonomy levels in `AgentDefinition` |
| 9 | Kill switch per agent |
| 10 | Judge-based evals + regression gate |
| 11 | Quality dashboard |
| 12 | Alerts (error rate, readiness, spend, ledger mismatch) |
| 13 | OTel tracing across Worker → workflow → activities |
| 14 | `settlement_pending` state |
| 15 | Cost-to-credit conversion function |
| 16 | Import-boundary lint (connectors only via hub) |

**Exit criteria**
- An audit survives a worker restart mid-run.
- A duplicate charge is impossible (property test).
- A charge without approval is impossible.
- Ledger mismatch alerts and does not auto-correct.
- A prompt change that degrades output is blocked.
- Spending above the run budget fails before the network call.

**Stop point:** the substrate is the largest single investment and produces no new visible feature. Founders should expect a plateau here.

---

## M5 — Discovery

**Purpose:** find prospects legally, with provenance.

| # | Task |
|---|---|
| 1 | `places` connector with `expiresAt` enforcement |
| 2 | Attribution display |
| 3 | Purge job for expired Places fields |
| 4 | `Prospect`, `ProspectProfile`, `ProspectBatch` |
| 5 | Qualification scoring (deterministic formula) |
| 6 | `qualify.explain` agent (suggest only) |
| 7 | Ranked prospect list with evidence links |
| 8 | Manual + CSV import with source recording |
| 9 | Reject disallowed sources |
| 10 | Replace `/map-explorer` fake with real results or explicit unavailable |

**Exit criteria**
- No prospect exists without a `source`.
- No Places-derived field exists past `expiresAt`.
- Qualification score is a formula, not a model output.
- Discovery is unavailable (not faked) when Places is not configured.

---

## M6 — Outreach

**Purpose:** email that is consented, approved, tracked, and suppressible.

| # | Task |
|---|---|
| 1 | `Campaign`, `Message`, `Suppression`, `OutboxEntry` |
| 2 | `email` connector with full contract |
| 3 | `dryRun` default in non-production |
| 4 | Consent gate at send |
| 5 | Approval gate at send |
| 6 | Batch approval with sampling |
| 7 | Provider message ID + delivery state |
| 8 | Unsubscribe + synchronous global suppression |
| 9 | Bounce/complaint webhooks + auto-suppression |
| 10 | Complaint-rate monitoring with org auto-pause |
| 11 | Volume caps per org |
| 12 | `engage.draft` agent (suggest only) |
| 13 | Reply inbox + state machine |
| 14 | `engage.triage` with LangGraph (if branching) |

**Exit criteria**
- A send without consent returns `403` and makes no provider call.
- A send without approval returns `403`.
- `dryRun` produces an `OutboxEntry` and no network call (contract test).
- Unsubscribe suppresses globally within the same request.
- Complaint rate above threshold pauses the org automatically.

---

## M7 — Autonomy

**Purpose:** let the system act alone where evidence justifies it, and add WhatsApp only if demanded.

| # | Task |
|---|---|
| 1 | Autonomy promotion mechanism + record |
| 2 | Demotion on quality degradation |
| 3 | Reliability display in product |
| 4 | Campaign state machine + sequence execution |
| 5 | Follow-up scheduling (durable timers) |
| 6 | `report.summary` agent + citations |
| 7 | Conditional: WhatsApp connector (`33` §6) |
| 8 | Conditional: Hermes evaluation (`41` §8) |

**Exit criteria**
- A capability can be promoted only with recorded evidence meeting thresholds.
- Demotion is automatic.
- The product displays real reliability numbers per capability.
- If WhatsApp shipped: opt-in, template approval, window tracking all enforced.

---

## M8 — Delivery

**Purpose:** prove the work happened, and connect to where customers keep their data.

| # | Task |
|---|---|
| 1 | Report generation from ledger + run log + audit store |
| 2 | Report versioning + data snapshot |
| 3 | Per-client cost vs revenue view |
| 4 | Proposal generation |
| 5 | `crm.generic` connector |
| 6 | Read-model rebuild command |
| 7 | Conditional: Qdrant if retrieval triggers met |

**Exit criteria**
- A report regenerated for the same period yields identical numbers.
- Per-client margin is computable from records.
- CRM sync is idempotent and dry-runnable.

---

## M9 — Commercialisation

**Purpose:** take money and pass a security review.

| # | Task |
|---|---|
| 1 | Staging environment |
| 2 | Invoicing + provider reconciliation |
| 3 | Subscription lifecycle (plan, proration, dunning) |
| 4 | Credit purchase flow |
| 5 | DPA template, privacy notice, sub-processor list |
| 6 | Data export / erasure flows |
| 7 | Grievance channel |
| 8 | External penetration test + remediation |
| 9 | Incident runbook rehearsal |
| 10 | MFA for owner/admin |
| 11 | Final security gate (`38` §7) |

**Exit criteria**
- An invoice is marked paid only after provider reconciliation.
- A security review by a prospective customer can be answered from documentation.
- Penetration test findings are remediated or explicitly accepted.
- No self-serve customer data or payment data exists before this milestone; design-partner engagements are governed by written terms (`42` M3/M9).

---

## M10 — Enterprise readiness

SSO, OpenFGA for per-object sharing (if triggered), database-level isolation option (if required), OPA (if policy exceeds 50 rules), SOC 2 readiness assessment if a customer requires it.

---

## M11 — Scale

Performance under load, cost optimisation via model routing review, multi-region if required, on-call rotation.

---

## M12 — Platform

Other agencies operate their own workspace. This milestone is where n8n licensing, per-tenant data partitioning, and margin discipline become existential rather than theoretical.

---

## 1. Why this order and not another

| Alternative order | What breaks |
|---|---|
| Features first, substrate later | Every feature inherits the fake substrate and must be rebuilt |
| Agents first, data later | Agents act on fabricated data — the current failure, amplified |
| Outreach first, audits later | Highest compliance surface before the gates exist |
| Billing first | Prices set against a cost model that does not exist |
| Everything in parallel | Nothing reaches an exit criterion |

The chain `enforcement → truth → usefulness → scale → commerce` is not a preference. It is the dependency graph.

---

## 2. Stop points

Each milestone is a valid stopping place. This is deliberate, given R-05 and R-06 (`40` §1).

| Stop after | You have | You can |
|---|---|---|
| M1 | A safe, empty product | Demo without embarrassment |
| M3 | A real audit product | Run design-partner audits under written terms |
| M4 | Durable, metered infrastructure | Run reliably at small scale |
| M6 | Consented outreach | Sell a pipeline service |
| M9 | A commercial product | Charge money |

Stopping at M1 is not failure. Continuing past M3 without a customer is a warning sign.

---

## 3. What is deliberately absent from the roadmap

| Absent | Reason |
|---|---|
| SMS and voice | TRAI burden disproportionate (`39` §3.3) |
| Scraping anything | Prohibited (`AGENTS.md` §6) |
| Website builder | Undecided (`46` D-09) |
| Mobile app | No demonstrated need |
| Marketplace | Different business |
| Fine-tuning | Cost exceeds benefit |

---

## 4. Roadmap risk

The single largest execution risk is not technical: it is that the team, having removed the fakes in M0, feels the product has regressed and re-adds them. The mitigation is `14` §4.4 — a provenance contract test that fails the build if a synthetic source appears in a production response.

That test is the roadmap's immune system. It should be written in M0, before anything else.
