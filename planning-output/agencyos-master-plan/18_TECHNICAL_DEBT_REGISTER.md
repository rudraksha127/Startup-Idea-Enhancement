# 18 — Technical Debt Register

106 items. Every item is a defect or a structural liability, not a preference. Severity is assigned by *customer and legal impact*, not by fix effort — several S1 items take under an hour.

**Severity:** S1 = blocks any customer exposure · S2 = blocks commercial launch · S3 = degrades quality or velocity · S4 = hygiene.
**Effort:** XS = <1h · S = <1d · M = 1–3d · L = 1–2w · XL = >2w.

---

## 1. Security and identity (20)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| SEC-01 | Auth middleware permits unauthenticated requests | S1 | `backend/src/middleware/auth.ts` | S | M1 |
| SEC-02 | Unresolved org binds to shared `org-apex-001` | S1 | `backend/src/common/resolve-org.ts` | XS | M1 |
| SEC-03 | No `middleware.ts`; dashboard routes publicly reachable | S1 | absence | S | M1 |
| SEC-04 | Dashboard layout is client component with no guard | S1 | `(dashboard)/layout.tsx` | M | M1 |
| SEC-05 | Hardcoded default JWT signing secret | S1 | `frontend/src/lib/auth/jwt.ts:5` | XS | M1 |
| SEC-06 | Backdoor credentials prefilled and displayed on login | S1 | `(auth)/login/page.tsx:10,123` | XS | M1 |
| SEC-07 | Seed script creates backdoor user with `password123` | S1 | `lib/seed/seed-data.ts:34` | XS | M1 |
| SEC-08 | Billing webhook has no signature verification | S1 | `api/billing/webhook/route.ts` | S | M1 |
| SEC-09 | Billing webhook marks invoices paid from unauthenticated POST | S1 | same | S | M1 |
| SEC-10 | ~24 of 42 API routes never resolve identity | S1 | route inspection | M | M1 |
| SEC-11 | No enforced `orgId` on tenant-scoped entities | S2 | models | M | M2 |
| SEC-12 | No session revocation; 7-day JWT lifetime | S2 | `lib/auth/jwt.ts:17` | M | M2 |
| SEC-13 | No MFA for privileged roles | S2 | absence | M | M6 |
| SEC-14 | No rate limiting on Next API routes | S2 | absence | S | M1 |
| SEC-15 | No login lockout / credential-stuffing defence | S2 | absence | S | M1 |
| SEC-16 | No security headers / CSP | S3 | absence | S | M1 |
| SEC-17 | n8n inbound webhook unsigned | S2 | `api/n8n/webhook/route.ts` | S | M1 |
| SEC-18 | Integration diagnostics unauthenticated (config recon) | S3 | `api/integrations/*` | XS | M1 |
| SEC-19 | `backend/node_modules` committed → unscanned supply chain | S3 | 1,514 tracked files | S | M0 |
| SEC-20 | `npm audit` non-blocking | S3 | `.github/workflows/ci.yml:142` | XS | M0 |

---

## 2. Data and persistence (18)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| DAT-01 | In-memory ZCQL client silently substitutes production store | S1 | `catalyst.client.ts` | M | M2 |
| DAT-02 | Four conflicting lead-status enums | S1 | 4 files | S | M2 |
| DAT-03 | `opportunityScore` exists on 1–10 and 0–100 scales | S1 | `database/schema/schemas.ts` | S | M2 |
| DAT-04 | Three copies of every model | S2 | `frontend/src/models`, `database/models`, `database/schema` | M | M2 |
| DAT-05 | Duplicate shared packages (`shared-types`/`utilities` vs `contracts`/`utils`) | S3 | `packages/` | S | M2 |
| DAT-06 | No schema source of truth / no migration path for Catalyst | S2 | absence | M | M2 |
| DAT-07 | No `Organisation` entity; org is a string constant | S1 | absence | S | M2 |
| DAT-08 | No `Membership` entity; roles on `User` only | S2 | absence | S | M2 |
| DAT-09 | No `AuditLog` entity | S2 | absence | S | M1 |
| DAT-10 | No `ConsentRecord` entity | S1 | absence | S | M1 |
| DAT-11 | No `AgentRun` persistence | S2 | absence | M | M3 |
| DAT-12 | No `Approval` persistence | S1 | absence | S | M1 |
| DAT-13 | No `LedgerEntry` / credit account | S2 | absence | M | M4 |
| DAT-14 | No `Integration` connection entity | S3 | absence | S | M2 |
| DAT-15 | No soft-delete/retention model (DPDP erasure vs business retention) | S2 | absence | S | M2 |
| DAT-16 | No referential integrity; orphan rows possible | S3 | ZCQL has no FKs | M | M4 |
| DAT-17 | Triple persistence path (AppSail → Mongo → empty) | S1 | `api/leads/route.ts` | M | M2 |
| DAT-18 | Analytics requires ≥5 entity joins; ZCQL caps at 4 | S3 | R2 | M | M5 |

---

## 3. API and backend (14)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| API-01 | No input validation on most routes despite `zod` dependency | S2 | routes | M | M1 |
| API-02 | `catch` blocks substitute data for errors | S1 | ~10 routes | M | M1 |
| API-03 | No correlation IDs | S3 | absence | S | M1 |
| API-04 | No uniform error envelope | S3 | routes | S | M1 |
| API-05 | No pagination contract | S3 | routes | S | M2 |
| API-06 | No idempotency keys on mutating endpoints | S2 | absence | M | M2 |
| API-07 | Two server implementations for one domain | S2 | `backend/` + `app/api/` | L | M3 |
| API-08 | Repository boundary absent; ZCQL called from services | S2 | `backend/src/modules/**` | M | M2 |
| API-09 | `/api/health` depth unverified | S3 | route | XS | M1 |
| API-10 | `/api/search` spans unclear data sources | S3 | route | M | M5 |
| API-11 | No API versioning | S3 | absence | S | M5 |
| API-12 | `settings` looks up hardcoded email, not session user | S2 | `api/settings/route.ts:36` | XS | M1 |
| API-13 | Export endpoints lack rate limits and audit logging | S2 | `api/leads/export` | S | M2 |
| API-14 | No OpenAPI/contract artefact | S3 | absence | M | M3 |

---

## 4. Agents and AI (13)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| AGT-01 | 13 agents are inert definitions; no execution | S1 | `definitions/index.ts` | L | M3–M7 |
| AGT-02 | Orchestrator returns canned results | S1 | `agent-orchestrator.ts` | M | M3 |
| AGT-03 | `approveRun` always approves; no actor or record | S1 | same | S | M1 (disable) / M4 (rebuild) |
| AGT-04 | Token counts fabricated | S2 | same | S | M3 |
| AGT-05 | Providers return mocks unconditionally | S1 | `lib/providers/index.ts` | M | M3 |
| AGT-06 | Hardcoded `CANONICAL_OUTPUTS` for agent runs | S1 | `api/agents/[id]/run` | XS | M0 |
| AGT-07 | Fabricated phone numbers for discovered leads | S1 | same | XS | M0 |
| AGT-08 | Prompt strings unversioned | S2 | definitions | S | M3 |
| AGT-09 | No output schema / validation | S2 | absence | M | M3 |
| AGT-10 | No tool contract layer | S2 | absence | L | M3 |
| AGT-11 | No budget enforcement | S2 | absence | M | M4 |
| AGT-12 | No trace of any model call | S2 | absence | M | M3 |
| AGT-13 | No agent eval set or regression gate | S2 | absence | M | M4 |

---

## 5. Workflows and integrations (11)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| WF-01 | 25 n8n workflows are 4-node placeholders | S3 | `n8n/workflows/**` | L | M4 |
| WF-02 | No execution evidence for any workflow | S2 | absence | S | M4 |
| WF-03 | n8n Sustainable Use License constrains SaaS use | S2 | R3 | decision | M4 |
| WF-04 | Generated workflow JSON committed; generator can drift | S3 | `n8n/scripts/generate-workflows.ts` | S | M4 |
| WF-05 | `n8n:deploy` ungated | S2 | `package.json` | XS | M1 |
| WF-06 | Workers documented but nonexistent | S2 | `backend/workers/README.md` | — | M3 |
| INT-01 | Places fallback labelled "Google Maps Verified" | S1 | `api/maps/places/route.ts` | XS | M0 |
| INT-02 | Places content retained indefinitely (TOS max 30 days) | S1 | design | M | M2 |
| INT-03 | Email path has no `dry_run` default | S1 | outreach routes | S | M1 |
| INT-04 | No suppression list / unsubscribe / bounce handling | S2 | absence | M | M6 |
| INT-05 | WhatsApp: no consent, template registry, or window tracking | S2 | absence | L | M7 |

---

## 6. UI and product integrity (10)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| UI-01 | `Math.random()` audit metrics | S1 | `audits/page.tsx` | XS | M0 |
| UI-02 | Fixed audit scores (68/54/46/42/78/88) for all leads | S1 | `api/leads/[leadId]/audit` | XS | M0 |
| UI-03 | Hardcoded business list + "2,847" count | S1 | `map-explorer/page.tsx` | S | M1 |
| UI-04 | `DEFAULT_CAMPAIGNS` synthetic campaigns | S2 | `outreach/page.tsx` | S | M1 |
| UI-05 | `CANONICAL_13_UI_AGENTS` presents 13 available agents | S1 | `ai-agents/page.tsx` | S | M1 |
| UI-06 | Website builder has no backend | S2 | `website-builder/page.tsx` | decision | M8 |
| UI-07 | Empty state indistinguishable from failure | S2 | ~10 routes | M | M1 |
| UI-08 | Five page monoliths >1,000 lines | S3 | see `05` | L | incremental |
| UI-09 | No provenance indicator on any number | S2 | absence | M | M2 |
| UI-10 | No accessibility testing | S3 | absence | S | M2 |

---

## 7. Build, deploy, operations (10)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| BLD-01 | Dockerfiles copy `.next/standalone`; build emits `.open-next` | S2 | `Dockerfile`, `frontend/Dockerfile` | S | M1 |
| BLD-02 | `npm start` serves a different artefact than `deploy` | S3 | `package.json:15` | XS | M1 |
| BLD-03 | Two build paths (`build` vs `build:frontend`) | S3 | `package.json` | S | M1 |
| BLD-04 | `backend/app.js` 43k-line bundle committed | S3 | tracked file | S | M0 |
| BLD-05 | Mongoose TCP dependency may not run on Workers | S1 | `mongoose` dep | M | M2 |
| BLD-06 | `zcatalyst-sdk-node` Worker compatibility unverified | S2 | unverified | S | M1 |
| BLD-07 | No staging environment | S2 | absence | M | M9 |
| BLD-08 | No rollback procedure | S2 | absence | S | M2 |
| BLD-09 | No structured logging / tracing / alerting | S2 | absence | M | M2 |
| BLD-10 | Secrets have no manager or rotation policy | S2 | `.env*` files | M | M2 |

---

## 8. Testing and CI (7)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| TST-01 | Test suite red (`components.test.tsx:36`) | S1 | `TEST-VERIFIED` | XS | M0 |
| TST-02 | CI secret scan targets nonexistent `src/`, `apps/` | S2 | `ci.yml:148-153` | XS | M0 |
| TST-03 | CI security + lint non-blocking | S2 | `ci.yml:142,159,191` | XS | M0 |
| TST-04 | Playwright never runs in CI | S2 | `ci.yml` | S | M1 |
| TST-05 | No auth-coverage test | S1 | absence | S | M1 |
| TST-06 | No tenant-isolation test | S2 | absence | S | M2 |
| TST-07 | No coverage measurement | S3 | absence | XS | M1 |

---

## 9. Documentation and governance (3)

| ID | Item | Sev | Ev | Effort | Fix in |
|---|---|---|---|---|---|
| DOC-01 | `CURRENT_STATUS.md` / `IMPLEMENTATION_STATUS.md` claim 72/72 | S2 | `TEST-VERIFIED` contradiction | XS | M0 |
| DOC-02 | ADR-004 and ADR-005 conflict; neither matches code | S2 | `docs/architecture/decisions/` | S | M1 |
| DOC-03 | `DATABASE_DESIGN.md` specifies unused PostgreSQL/Supabase stack | S3 | file | XS | M1 |

---

## 10. Count reconciliation

Counts by section: 20 + 18 + 14 + 13 + 11 + 10 + 10 + 7 + 3 = **106 rows** across nine sections. Five pairs share a root cause — SEC-09/SEC-08, AGT-07/AGT-06, UI-02/UI-01, TST-02/TST-03, INT-02/INT-01 — but each is retained as a separate row because each needs its own remediation and its own proving test. The figure quoted throughout this corpus is therefore **106**, not 96.

---

## 11. Severity distribution

| Severity | Count | Meaning |
|---|---|---|
| S1 | 34 | Must be closed before any external exposure |
| S2 | 48 | Must be closed before commercial launch |
| S3 | 24 | Slows delivery; close continuously |
| S4 | 0 | Hygiene — none currently recorded at this severity |
| **Total** | **106** | |

**34 S1 items.** Ten take under an hour each and twenty-four take a day or less. The M0 work in `42` — twelve work items — totals roughly **one week**. That is the single most important economic fact in this audit: the product can be moved from "dangerous" to "safe" faster than it can be moved from "stub" to "feature".

---

## 12. Debt trajectory warning

Debt compounds here in a specific way: **every new feature built on the current substrate inherits the substrate's dishonesty.** An agent built on the in-memory store will lose data. A workflow built on unvalidated input will corrupt state. A report built on fabricated token counts will misprice.

This is why the plan refuses to sequence features before substrate. It is not perfectionism; it is the observation that the marginal cost of each new feature is currently higher than it looks, because each one adds a surface that must later be unwound.
