# 43 — Task Backlog

148 tasks. Each is independently completable, has an acceptance criterion, and maps to a milestone.

**Sizing:** XS < 1h · S < 1 day · M 1–3 days · L 1–2 weeks
**Severity:** S1 critical · S2 high · S3 medium · S4 hygiene

---

## Block A — Verification, governance, and cleanup (T-001 … T-020)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-001 | Re-run the full test suite and record the actual result | S1 | XS | Now | Output archived in `03` |
| T-002 | Confirm no production tenant data exists in any store | S1 | S | Now | Written confirmation; determines migration shape |
| T-003 | Add `KNOWN_LIMITATIONS.md` listing every fake surface | S1 | S | M0 | Every item in `14` §2 appears |
| T-004 | Enable branch protection on `main` (require CI, no bypass) | S1 | XS | Now | A red PR cannot merge |
| T-005 | Audit which commit is actually deployed to the Worker | S2 | S | Now | Deployed SHA recorded |
| T-006 | Document the real local run path (preview, not `start`) | S3 | XS | M1 | README matches `package.json` |
| T-007 | Inventory every `.env*` variable name (no values) | S2 | S | M1 | List committed as `.env.example` completeness |
| T-008 | Confirm `.env*` files are untracked and gitignored | S2 | XS | Now | `git ls-files` shows only `.example` |
| T-009 | Measure and record current bundle size | S4 | XS | M1 | Baseline for M11 |
| T-010 | Record Lighthouse baseline for 5 key pages | S3 | S | M1 | Baseline stored |
| T-011 | Audit operator approval behaviour (time per action) | S3 | S | M4 | Two-week manual time log |
| T-012 | Enumerate every API route with auth status | S1 | S | M1 | Table in `08` verified |
| T-013 | Enumerate and remove every client-side constant dataset | S1 | S | M0 | List matches `14` §2; none present in the production bundle |
| T-014 | Confirm whether `next.config` sets `output: 'standalone'` | S3 | XS | M1 | Documented |
| T-015 | Review `AGENTS.md` rules against actual code | S2 | S | M1 | Compliance table written |
| T-016 | Verify `.github` workflows are actually enabled | S2 | XS | Now | CI runs on PRs |
| T-017 | Establish a weekly cost-tracking spreadsheet | S3 | XS | M0 | Exists and is used |
| T-018 | **Verify Worker runtime compatibility** (Mongoose/zcatalyst in `workerd`) | S1 | M | M1 | Either proven working or the incompatibility documented |
| T-019 | **Audit `wrangler.json` for secret material in `[vars]`** | S1 | S | M1 | No secrets in config |
| T-020 | Confirm Catalyst project configuration and region | S2 | S | M1 | Recorded |

---

## Block B — M0 Subtraction (T-021 … T-032)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-021 | Delete phone-number synthesis | S1 | XS | M0 | No synthetic phone string in the bundle |
| T-022 | Delete `CANONICAL_OUTPUTS`; return `501` | S1 | S | M0 | Agent run returns `501`, no fabricated output |
| T-023 | Remove "Google Maps Verified" label + static registry from responses | S1 | XS | M0 | String absent; absence returns `unavailable` |
| T-024 | Delete `Math.random()` audit metrics | S1 | XS | M0 | No `Math.random` in `audits/page.tsx` |
| T-025 | Remove fixed audit scores | S1 | S | M0 | Audit endpoint returns real or `501` |
| T-026 | Disable `approveRun` (`501`) | S1 | XS | M0 | Endpoint cannot report approval |
| T-027 | Fix `components.test.tsx:36` | S1 | XS | M0 | Suite green |
| T-028 | Fix CI secret-scan paths; scan `frontend/` and `backend/` | S2 | XS | M0 | Finding a planted secret fails CI |
| T-029 | Make security and lint jobs blocking | S2 | XS | M0 | Both fail the pipeline on error |
| T-030 | Untrack `backend/node_modules` | S3 | S | M0 | 1,514 files removed from index |
| T-031 | Untrack `backend/app.js` | S3 | XS | M0 | Bundle removed from index |
| T-032 | Rewrite `CURRENT_STATUS.md` and `IMPLEMENTATION_STATUS.md` truthfully | S2 | S | M0 | States the real test result and known fakes |

---

## Block C — M1 Enforcement (T-033 … T-056)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-033 | Delete `org-apex-001`; `resolveOrg` throws | S1 | S | M1 | Constant absent; anonymous request errors |
| T-034 | `requireEnv('JWT_SECRET', {minLength:32})`; remove fallback | S1 | XS | M1 | Startup fails without the var |
| T-035 | Remove credential prefill and on-screen display | S1 | XS | M1 | Login page shows no credentials |
| T-036 | Remove backdoor user creation from seed | S1 | XS | M1 | Seeding creates no known-password account |
| T-037 | Auth middleware rejects by default | S1 | M | M1 | Unauthenticated request → `401` |
| T-038 | `@Public()` allowlist (4 routes) | S1 | S | M1 | Allowlist enumerated in one file |
| T-039 | Add `middleware.ts` (session, org, headers, rate limit) | S1 | M | M1 | Headers present; unauthenticated redirect |
| T-040 | Dashboard layout → Server Component with guard | S1 | M | M1 | Direct navigation redirects |
| T-041 | Zod schema on every route body | S2 | M | M1 | Malformed body → `400` with field errors |
| T-042 | Delete catch-and-substitute; typed error taxonomy | S1 | M | M1 | DB failure → `503`, never `200` |
| T-043 | Correlation ID generation + propagation | S3 | S | M1 | Every response carries one |
| T-044 | Billing webhook signature verification over raw body | S1 | S | M1 | Bad signature → `400`, no state change |
| T-045 | Billing webhook idempotency on event ID | S1 | S | M1 | Replay → one transition |
| T-046 | n8n webhook HMAC + timestamp | S2 | S | M1 | Unsigned → `400` |
| T-047 | `AuditLog` entity + write on privileged actions | S2 | M | M1 | Login, export, approval all logged |
| T-048 | `ConsentRecord` entity | S1 | M | M1 | Schema + repository + tests |
| T-049 | `Approval` entity with snapshot hash | S1 | M | M1 | Schema + repository + tests |
| T-050 | Auth-coverage test (enumerate every route) | S1 | S | M1 | Any unguarded route fails the build |
| T-051 | Delete both Dockerfiles or replace with a working one | S2 | S | M1 | No file copies a nonexistent path |
| T-052 | Fix/rename `npm start` to production parity | S3 | XS | M1 | `start` runs the real artefact or is removed |
| T-053 | Integration diagnostics require owner role | S3 | XS | M1 | Anonymous → `401` |
| T-054 | Gate `n8n:deploy` behind `ALLOW_DEPLOY=1` | S2 | XS | M1 | Script refuses without the flag |
| T-055 | Fix `settings` route to use session user | S2 | XS | M1 | No hardcoded email |
| T-056 | Empty/Degraded/Error components + adopt in 3 pages | S2 | M | M1 | Failures render distinctly from empties |

---

## Block D — M2 Foundation (T-057 … T-080)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-057 | Author `schema.manifest.json` (26 entities) | S1 | L | M2 | Covers `26` §2 |
| T-058 | Generate TS types from manifest | S2 | S | M2 | No hand-written duplicates remain |
| T-059 | Generate Zod schemas from manifest | S2 | S | M2 | Used by route validation |
| T-060 | Implement `CatalystRepository` with `orgId` injection | S1 | L | M2 | Caller cannot supply `orgId` |
| T-061 | **Verify ZCQL unique-constraint enforcement** | S1 | S | M2 | Confirmed or fallback to deterministic IDs |
| T-062 | Implement `InMemoryRepository` (test-only, prod guard) | S2 | M | M2 | Throws in production |
| T-063 | Delete Mongoose from runtime path | S1 | L | M2 | No import outside an archive script |
| T-064 | Delete in-memory Catalyst client from production bundle | S1 | S | M2 | Absent from build output |
| T-065 | `Organisation` entity + creation on registration | S1 | M | M2 | Every user has a real org |
| T-066 | `Membership` entity + invitation flow | S2 | M | M2 | Invite → accept → active |
| T-067 | Single lead-status enum migration | S1 | M | M2 | One enum across all code |
| T-068 | Single score scale (0–100) with recorded conversion | S1 | S | M2 | No 1–10 values remain |
| T-069 | Delete duplicate `packages/*` set | S3 | S | M2 | One shared package |
| T-070 | Cross-tenant test suite for every repository method | S2 | M | M2 | Foreign-org read → `404` |
| T-071 | `schema:diff` drift check in CI | S2 | M | M2 | Drift fails the pipeline |
| T-072 | Structured JSON logging | S3 | M | M2 | No PII; correlation ID present |
| T-073 | Error tracking integration | S3 | S | M2 | Errors visible with release tag |
| T-074 | Readiness probe (Catalyst liveness + schema version) | S2 | S | M2 | Fails closed |
| T-075 | `FeatureFlag` entity + kill switches | S2 | M | M2 | Disable takes effect in one request |
| T-076 | Role capability map + `withAuth({capability})` | S2 | M | M2 | Capability check server-side |
| T-077 | Session revocation + session listing | S2 | M | M2 | Revoked token fails next request |
| T-078 | Secrets via platform bindings + rotation runbook | S2 | S | M2 | No secret in config or bundle |
| T-079 | Places 30-day expiry enforcement + purge job | S1 | M | M2 | Expired fields purged no later than expiresAt (read-time filter + purge job) |
| T-080 | ADR-006 committed; ADR-004/005 superseded | S2 | S | M2 | Only one target architecture in force |

---

## Block E — M3 First real vertical (T-081 … T-098)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-081 | Crawler with SSRF guards | S1 | L | M3 | Private ranges and metadata IPs rejected |
| T-082 | 12 deterministic checks with evidence | S1 | L | M3 | Each check stores evidence |
| T-083 | Published rubric + deterministic score | S1 | M | M3 | Score reproducible from checks |
| T-084 | `Audit` / `AuditCheck` / `AuditEvidence` persistence | S1 | M | M3 | `partial` state when a check errors |
| T-085 | LLM gateway (LiteLLM) deployment | S1 | M | M3 | Single path for all model calls |
| T-086 | PII redaction in gateway | S1 | M | M3 | Test email absent from traces |
| T-087 | Langfuse self-hosted + trace emission | S2 | M | M3 | Traces searchable by correlation ID |
| T-088 | `AgentDefinition` / `AgentRun` / `RunStep` | S1 | L | M3 | Every run persisted with steps |
| T-089 | `audit.narrative` agent with schema + citations | S1 | M | M3 | Output validates; cites real check IDs |
| T-090 | Schema validation with one retry then fail | S2 | S | M3 | No silent substitution |
| T-091 | Deterministic eval checks in CI | S2 | M | M3 | Citation failure blocks merge |
| T-092 | Report renderer (server-side, exportable) | S1 | L | M3 | PDF/HTML from stored records |
| T-093 | Report regeneration determinism test | S1 | S | M3 | Same data → identical output |
| T-094 | Provenance affordance component | S2 | M | M3 | Every number shows source + freshness |
| T-095 | Prompt-injection fixture test | S1 | S | M3 | Injected page causes no external action |
| T-096 | Cost capture per model call | S1 | S | M3 | `CostRecord` with real tokens |
| T-097 | Replace `/audits` placeholder with real data | S1 | M | M3 | No `Math.random`, no fixed scores |
| T-098 | Delete `/website-builder` or mark unavailable | S2 | XS | M3 | No dead surface |

---

## Block F — M4 Substrate (T-099 … T-114)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-099 | Temporal cluster + workflow service deployment | S2 | L | M4 | Worker polls; a trivial workflow completes; 25 placeholder n8n workflows archived |
| T-100 | Migrate `audit.run` to a workflow | S2 | M | M4 | Survives worker restart |
| T-101 | Ledger entities + append with idempotency | S1 | L | M4 | Duplicate key → no-op |
| T-102 | Balance computation from entries | S1 | M | M4 | Property test matches |
| T-103 | Reconciliation job + alert | S1 | M | M4 | Mismatch alerts, no auto-fix |
| T-104 | Budget enforcement pre-call | S1 | M | M4 | Over-budget fails before network |
| T-105 | Approval engine + expiry + snapshot check + agent tool allowlist enforcement | S1 | L | M4 | Edited subject invalidates approval; unlisted tool calls rejected |
| T-106 | Policy engine (pure function) | S1 | L | M4 | ≥95% branch coverage |
| T-107 | Autonomy levels in `AgentDefinition` | S2 | S | M4 | Per-agent, per-capability |
| T-108 | Judge-based evals + regression gate | S2 | L | M4 | Degrading prompt blocked |
| T-109 | Quality dashboard per agent | S3 | M | M4 | Runs, validity, cost, latency |
| T-110 | Alerts: error rate, readiness, spend, ledger | S2 | M | M4 | All four fire in a test |
| T-111 | OTel tracing end-to-end | S3 | M | M4 | One trace spans Worker → activity |
| T-112 | `settlement_pending` state + operator view | S2 | S | M4 | Visible, not hidden |
| T-113 | Cost-to-credit conversion function | S2 | S | M4 | Single function, tested |
| T-114 | Import-boundary lint (connectors only via hub) | S1 | S | M4 | Violation fails build |

---

## Block G — M5 Discovery (T-115 … T-124)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-115 | `places` connector with `expiresAt` | S1 | M | M5 | Every result carries an expiry |
| T-116 | Attribution display | S1 | S | M5 | Present wherever Places content shows |
| T-117 | `Prospect` / `ProspectProfile` / `ProspectBatch` | S2 | M | M5 | Source required on every prospect |
| T-118 | Qualification formula (deterministic) | S2 | M | M5 | Score reproducible |
| T-119 | `qualify.explain` agent (suggest only) | S3 | M | M5 | One sentence, cites signal |
| T-120 | Ranked list with evidence links | S2 | M | M5 | Every rank shows its reasons |
| T-121 | CSV import with source recording | S2 | M | M5 | Import report lists rejected rows |
| T-122 | Reject disallowed sources | S1 | S | M5 | Disallowed source → `400` |
| T-123 | Replace `/map-explorer` fake | S1 | M | M5 | Real or `unavailable` |
| T-124 | Places purge verification test | S1 | S | M5 | Expired field absent after purge |

---

## Block H — M6 Outreach (T-125 … T-136)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-125 | `Campaign` / `Message` / `Suppression` / `OutboxEntry` | S1 | L | M6 | Schema + repository |
| T-126 | `email` connector implementing the full contract | S1 | L | M6 | Contract tests pass |
| T-127 | `dryRun` default outside production | S1 | S | M6 | No provider call in dry run |
| T-128 | Consent gate at send | S1 | S | M6 | Missing → `403 consent_missing` |
| T-129 | Approval gate at send | S1 | S | M6 | Missing → `403 approval_missing` |
| T-130 | Batch approval with sampling | S2 | M | M6 | Sample IDs recorded in `Approval` |
| T-131 | Provider message ID + delivery state | S2 | M | M6 | Every send traceable |
| T-132 | Unsubscribe + synchronous global suppression | S1 | M | M6 | Same-request suppression |
| T-133 | Bounce/complaint webhooks | S1 | M | M6 | Auto-suppression on hard bounce |
| T-134 | Complaint-rate monitoring + org auto-pause | S2 | M | M6 | Threshold pauses sending |
| T-135 | Volume caps per org | S2 | S | M6 | Cap exceeded → `429` |
| T-136 | `engage.draft` (suggest only) + reply inbox | S2 | L | M6 | Draft cites audit; inbox tracks state |

---

## Block I — M7 Autonomy (T-137 … T-148)

| ID | Task | Sev | Size | Milestone | Acceptance |
|---|---|---|---|---|---|
| T-137 | Autonomy promotion mechanism | S2 | M | M7 | Evidence recorded; thresholds enforced |
| T-138 | Automatic demotion | S1 | M | M7 | Quality drop demotes without approval |
| T-139 | Reliability display in product | S3 | M | M7 | Per-capability numbers visible |
| T-140 | Campaign state machine | S2 | L | M7 | Invalid transitions rejected |
| T-141 | Sequence execution with durable timers | S2 | L | M7 | Follow-up survives deploy |
| T-142 | `report.summary` agent with citations | S2 | M | M7 | Numbers match source records |
| T-143 | WhatsApp connector (conditional) | S2 | L | M7 | Window + template + consent enforced |
| T-144 | WhatsApp template registry sync | S2 | M | M7 | Approval status tracked |
| T-145 | WhatsApp per-message cost capture | S2 | S | M7 | Category recorded, cost attributed |
| T-146 | Hermes evaluation in sandbox (conditional) | S4 | M | M7 | Fails any of the 5 criteria → rejected |
| T-147 | Kill switch per agent capability | S1 | S | M7 | Disables without deploy |
| T-148 | Autonomy incident review process | S3 | S | M7 | Documented and rehearsed |

---

## Summary

| Block | Tasks | S1 | Effort |
|---|---|---|---|
| A — Verification | 20 | 8 | ~1 week |
| B — M0 Subtraction | 12 | 7 | ~1 week |
| C — M1 Enforcement | 24 | 14 | ~2 weeks |
| D — M2 Foundation | 24 | 9 | ~3 weeks |
| E — M3 Vertical | 18 | 13 | ~3 weeks |
| F — M4 Substrate | 16 | 7 | ~3 weeks |
| G — M5 Discovery | 10 | 5 | ~2 weeks |
| H — M6 Outreach | 12 | 7 | ~3 weeks |
| I — M7 Autonomy | 12 | 2 | ~3 weeks |
| **Total** | **148** | **72** | **~21 weeks** |

Block B contains the twelve M0 work items from `42`; three further tasks inside block A (T-003, T-013, T-017) also carry an M0 milestone, so a filter on the Milestone column returns fifteen rows.

72 S1 tasks. Of those, **29 are in blocks A–C**, which total roughly four weeks. That ratio is the plan's central argument: the work that makes the product safe is a small fraction of the work that makes it a product.

**Scope boundary:** Blocks A–I decompose M0–M7. M8–M12 are deliberately *not* decomposed into numbered tasks; their scope in `42` is the input to a decomposition gate at the end of M7, when delivery and billing requirements are known from design-partner work. The 148 figure is the M0–M7 backlog, not the full programme.

---

## Critical path

```
T-002 (no prod data?)
   └► T-033 (delete demo org) ─► T-037 (reject by default) ─► T-050 (coverage test)
        └► T-057 (manifest) ─► T-060 (repository) ─► T-061 (unique constraint)
             └► T-081 (crawler) ─► T-083 (rubric) ─► T-092 (report)
                  └► T-099 (temporal) ─► T-106 (policy) ─► T-125 (campaign)
```

Every task on this path is S1 or gates an S1. Delaying any of them delays everything downstream.
