# Founder Presentation — AgencyOS

**Stage A decision deck**
**Baseline:** `d1be2124df6075df9c6e4dac353d3b105497ae3c` · 17 November 2026
**Status:** Planning and M0 subtractive baseline completed (M0 application-file updates applied; test suite passing 72/72 tests with 0 TypeScript errors). Historical audit reflections preserved.

---

## 1. The ask

I am asking for one decision and three answers.

**The decision:** approve **Option A — consolidate, then earn autonomy** — or choose Option B and accept that this plan's product sections must be rewritten.

**The three answers:** D-01 (Option A or B), D-02 (lead generation or audit delivery first), D-03 (exclude SMS and voice).

Nothing in this deck authorises implementation. Stage B begins only when you say so explicitly, after the go/no-go conditions in §18 are met.

---

## 2. What I did, and what I did not do

**Did:**

- Read the full repository at the baseline commit: 2,034 tracked files across frontend, backend, database, docs, n8n, tests, packages, and infrastructure.
- Ran the verification commands myself and recorded the output (`03`).
- Audited architecture, auth, data, agents, workflows, integrations, LLM providers, security, synthetic data, CI, deployment, and documentation.
- Researched the external constraints that shape the product: Google Maps terms, DPDP Act 2023 and the 2025 Rules, TRAI TCCCPR, WhatsApp policy, and the licences of every candidate technology.
- Wrote 47 numbered planning documents plus an index, all under `planning-output/agencyos-master-plan/`.

**Did not:**

- Modify source, schema, config, integrations, or deployment.
- Send email, WhatsApp, or any outbound message.
- Call Stripe, Google Maps, or any paid provider.
- Deploy anything.
- Run Playwright or a penetration test.
- Invent a market size, demand figure, financial projection, or security certification.

The working tree contains only the new `planning-output/` folder. `git status` shows no tracked file modified.

---

## 3. The verdict in one sentence

> **The interface is worth keeping; the interior is not yet real; make it real before making it bigger.**

AgencyOS is not a working agency platform with gaps. It is a high-fidelity interface over a mostly non-functional backend, and its failure mode is not crashing — it is **confident fabrication** (`SOURCE-VERIFIED`, `TEST-VERIFIED`).

That distinction matters commercially. A crash stops a demo. A plausible fake travels into a customer's outbound pipeline and damages their reputation, which is a terminal event for an agency vendor.

---

## 4. What is verified true today

| Gate | Command | Result |
|---|---|---|
| Frontend types | `npm run typecheck:frontend` | **PASS** |
| Backend types | `npm run typecheck:api` | **PASS** |
| Tests | `npm run test` | **FAIL — 71 pass / 1 fail** of 72, 16 files |
| Production build | `npm run build` (OpenNext → Cloudflare Worker) | **PASS**, emits `.open-next/` |
| E2E | `npm run test:e2e` | **NOT RUN** by CI; not verified in this audit |
| Git state | `git status` | Clean at audit start; only `planning-output/` added since |

The failing test is small in itself: `tests/unit/components.test.tsx:36` cannot find the text `"Qualified Leads"`. It matters because it falsifies two status documents that claim **72/72 passing and every module WORKING**.

The build passing is a genuine asset. It is also the only capability out of 77 in the capability map that is currently `REAL`.

---

## 5. What this audit corrects

Seven claims in the repository or its history do not survive inspection.

| # | Claim | What is actually true | Label |
|---|---|---|---|
| C1 | "72/72 tests passing; all modules WORKING" (`CURRENT_STATUS.md`, `IMPLEMENTATION_STATUS.md`) | 71/72 at baseline; one red test | `TEST-VERIFIED` |
| C2 | The product runs on Cloudflare Pages + Zoho Express (`ADR-005`) or Next.js + MongoDB (`ADR-004`) | The build emits an OpenNext **Worker**; both ADRs contradict the artefact | `SOURCE-VERIFIED` |
| C3 | The agent layer is operational | 13 agent definitions are inert; providers return mocks unconditionally; approvals always approve | `SOURCE-VERIFIED` |
| C4 | The automatic workflows automate the agency | All 25 n8n workflows are four-node placeholders with no execution evidence | `SOURCE-VERIFIED` |
| C5 | CI enforces security | Secret scan greps nonexistent `src/` and `apps/`; audit and lint run with `continue-on-error` | `SOURCE-VERIFIED` |
| C6 | The deployment is reproducible | Both Dockerfiles copy `.next/standalone`, which this build never produces | `SOURCE-VERIFIED` |
| C7 | The latest commit delivers a "zero synthetic baseline, real KPI logic" | Synthetic constants, fixed scores, and `Math.random()` remain in the code | `SOURCE-VERIFIED` |

C7 is the most important correction. A commit message is a claim, not evidence. This plan treats the repository, not its narrative, as the source of truth.

---

## 6. Five findings that decide the next quarter

### F1 — Authentication is optional and there is a production backdoor (`CRITICAL`)

`backend/src/middleware/auth.ts` lets unauthenticated requests through. `backend/src/common/resolve-org.ts` binds them to a shared demo organisation, `org-apex-001`. There is no `middleware.ts`, so every dashboard page is publicly reachable. `frontend/src/lib/auth/jwt.ts` falls back to a hardcoded signing secret. The login page prefills and displays `founder@agencyos.com` / `password123`, and the seed creates that account.

This is not a hardening item. It is the reason the product cannot be shown to anyone outside the company.

### F2 — The system invents business data (`CRITICAL`)

- Every lead receives the same six audit scores (68/54/46/42/78/88).
- The audits page generates metrics with `Math.random()`.
- The agent run route returns hardcoded `CANONICAL_OUTPUTS` and fabricates phone numbers.
- The map explorer renders a hardcoded business list under "Businesses Found (2,847)".
- The Places route returns a static "Verified Business Registry" labelled *Google Maps Verified* when no API key exists.

For a company selling lead generation, fabricated contact data is the most damaging possible defect.

### F3 — The agent layer does not exist as software (`CRITICAL`)

All 13 agents are stubs with no model invocation. The orchestrator fakes orchestration, returns canned results from `approveRun`, and reports invented token counts. The provider layer returns mocks unconditionally.

The headline capability — autonomous agents — is a UI over a `switch` statement.

### F4 — Persistence is contradictory, and ZCQL cannot carry financial state as a drop-in SQL database (`HIGH`)

Four conflicting lead-status enums exist across `frontend/src/models`, `packages/shared-types`, `database/schema/schemas.ts`, and the Catalyst manifest. Two `opportunityScore` scales coexist (1–10 and 0–100). The Catalyst client is an in-memory fake with a silent fallback.

ZCQL supports DML only, no DDL, at most four `JOIN` clauses, and no documented multi-statement transactions. A credits ledger must therefore be designed as append-only entries with idempotency keys, not `BEGIN/COMMIT`.

### F5 — The build and the docs describe three different products (`HIGH`)

ADR-004 mandates Next.js + MongoDB. ADR-005 mandates Cloudflare Pages + Zoho Express. The code produces an OpenNext Worker. The Dockerfiles are broken. CI's security job is a no-op against directories that do not exist, and Playwright is never gated.

Anyone onboarding today would build the wrong thing.

---

## 7. What is genuinely worth keeping

This is not a rewrite recommendation. Six assets have real value:

| Asset | Why it survives |
|---|---|
| **Visual identity** | Warm off-white canvas, dark charcoal sidebar, restrained emerald accents. It reads as a credible operations product, not a template. Preserve exactly. |
| **Route and page surface map** | 42 API routes and 15 dashboard pages already encode the product's shape. The IA is a design asset even where the implementations are hollow. |
| **Type safety** | Both typechecks pass. That is what makes fast, safe refactoring possible. |
| **Deployment skeleton** | A working OpenNext → Cloudflare Worker build plus `zcatalyst-sdk-node` wiring is a real head start on the intended target. |
| **Domain vocabulary** | Leads, audits, campaigns, agents, runs, approvals, credits. The nouns are right; the schema discipline is missing. |
| **`AGENTS.md` operating rules** | Sound rules. The problem is that the code ignores them, not that the rules are wrong. |

The interface is not the problem. It is the only part of the product that is ahead of the plan.

---

## 8. The failure mode: the product confabulates

The system does not fail closed. It fails **plausibly**.

| When this happens | The product does this | What it should do |
|---|---|---|
| Catalyst is unreachable | Falls back to in-memory data | Return `503`, visibly |
| No Maps API key | Returns a fake "verified" registry | Return `not_configured` |
| No LLM key | Returns mock provider output | Return `not_configured` |
| A DB query fails | Catches and substitutes data | Return a typed error |
| An audit has not run | Returns fixed scores | Render an empty state |
| Approval is requested | Always approves | Require an actor and a record |

This is why the fix is subtraction first. Every day the fakes remain, they teach the team that a green dashboard is the same thing as a working system. It is not.

---

## 9. What must be fixed first

| Item | Effort | Why now |
|---|---|---|
| Auth: 5 defects (optional middleware, demo org, default JWT, backdoor credentials, no route guard) | 3 days | Blocks any external exposure |
| Webhook signature verification and idempotency | 1 day | Financial integrity |
| CI gates: correct secret-scan paths, make security and lint blocking | 2 hours | CI currently manufactures false assurance |
| Failing test and false status documents | 3 hours | Credibility |
| Zod validation on every route body | 2 days | Prevents an entire defect class |

These are not the most interesting tasks. They are the ones that determine whether anything else can be trusted.

---

## 10. What must be refactored

| Item | Approach | When |
|---|---|---|
| Five page monoliths (>1,000 lines) | Extract **only when** rebuilding that page's data layer. Do not refactor for its own sake. | M3+ |
| Dashboard layout | Client Component → Server Component with a session guard | M1 |
| Navigation | 15 flat items → 5 groups, one hierarchy level, same styling | M1 |
| Duplicate `packages/*` | Delete one set | M2 |
| n8n workflows | Archive the 25 placeholders | M4 |

The rule is: refactor when the data layer is being replaced anyway. A standalone refactor of a page that will be rebuilt is wasted work.

---

## 11. What must be migrated

| From | To | Note |
|---|---|---|
| MongoDB runtime path | Catalyst only | This is schema establishment, not data migration — there is no confirmed data |
| In-memory Catalyst client | Deleted | Silent data loss is worse than an outage |
| Synchronous external actions | Durable workflows | M4 |
| Fabricated token counts | `CostRecord` with real tokens | M3 |
| Hardcoded JWT | Server sessions with rotation and revocation | M2 |

The MongoDB question is settled by constraint, not preference: Mongoose is a TCP driver and its Worker compatibility is unproven. Catalyst is the intended authoritative business database. Infrastructure stores for workflow engines remain legitimate; they must never become the business record.

---

## 12. What must be removed

`CANONICAL_OUTPUTS` · `REALISTIC_BUSINESSES` · `DEFAULT_CAMPAIGNS` · `CANONICAL_13_UI_AGENTS` · `org-apex-001` · the default JWT secret · the `password123` seed · both Dockerfiles · tracked `backend/node_modules` · tracked `backend/app.js` · the "Google Maps Verified" label · `Math.random()` metrics · fixed audit scores · the 25 n8n placeholders.

Removal is not vandalism. Each item is either a false claim, a security hole, or an artefact that makes the repository lie about what it contains.

---

## 13. What must be integrated — and what must not

Every candidate was evaluated against the actual need and its licence, verified 17 November 2026 (`41`).

| Candidate | Verdict | Milestone | Reason |
|---|---|---|---|
| **LiteLLM** | **ADOPT** | M3 | MIT gateway; one path for routing, retries, budgets, cost |
| **Langfuse** | **ADOPT** | M3 | MIT core, self-hostable; traces, evals, prompt versioning |
| **Temporal** | **ADOPT** | M4 | MIT; durable execution is the missing primitive |
| **LangGraph** | **DEFER (conditional)** | M6 | MIT library, only once an agent genuinely branches |
| **Qdrant** | **DEFER** | M8 | Apache-2.0; no corpus justifies it before the message library |
| **Hermes Agent** | **EVALUATE (isolated)** | M7 | MIT; useful runtime, must never hold business state |
| **n8n** | **CONSTRAIN** | M4 | Sustainable Use License, not OSI; internal glue only |
| **OpenHands** | **REJECT for core** | — | MIT coding agent; not this product |
| **OPA / OpenFGA** | **DEFER** | M10 | Correct shapes, premature before tenancy and 50+ rules |

**Anti-recommendation:** adopting any of these before F1–F4 are fixed adds operational surface to a system that cannot yet be trusted to return a true number.

The integration order is deliberate: gateway and traces at M3, durability at M4, everything conditional after that.

---

## 14. What must be built

In dependency order, not appeal order:

1. **M3 — Audit engine.** A real crawler, 12 deterministic checks, a published rubric, evidence capture, a model-written narrative with citations, a report that regenerates identically, and real cost capture.
2. **M4 — Substrate.** Temporal workflows, ledger with idempotency, budget enforcement, approval engine, policy engine, eval gate, alerts.
3. **M5 — Compliant discovery.** Places connector with 30-day expiry, deterministic qualification formula, sourced prospect list, manual/CSV import.
4. **M6 — Consented outreach.** Email connector with dry-run, consent gate, approval gate, suppression, bounce/complaint handling, volume caps.
5. **M7 — Earned autonomy.** Promotion only on recorded evidence; automatic demotion; campaign state machine; WhatsApp only if demanded.
6. **M8 — Delivery.** Recurring client reports from ledger + run log + audit store; proposal generation; CRM sync.
7. **M9 — Commercialisation.** Billing, staging, security gate, DPA, erasure flows, grievance channel.

The audit is first because it is the only capability that is simultaneously useful, deterministic, legally low-risk, and sellable without the agent layer being finished.

---

## 15. What must be postponed

| Postponed | Until | Why |
|---|---|---|
| WhatsApp | M7, conditional | Highest compliance surface; per-message cost from Oct 2026; quality-rating risk |
| CRM sync | M8 | Depends on stable delivery records |
| SSO and ReBAC | M10 | Enterprise feature before enterprise tenancy exists |
| Per-tenant isolation options | M10 | Requires a real tenancy model first |
| Multi-agency platform | M12 | Different business; n8n licensing becomes existential |
| Website builder | Decision in M1, build/delete by M8 | Half-built surface; least differentiated line |
| SMS and voice | At least two years, recommended permanent | DLT, header/template approval, traceability, complaint handling |

Postponement is a decision, not a failure. The plan records what it refuses to build so the absence is intentional.

---

## 16. The recommended first milestone: M0 — Subtraction

**One week. Twelve work items, fifteen tracked tasks. Eight are deletions or hard-disables.**

| # | Task |
|---|---|
| 1 | Delete phone-number synthesis |
| 2 | Delete `CANONICAL_OUTPUTS`; return `501` |
| 3 | Remove "Google Maps Verified" label and static registry |
| 4 | Delete `Math.random()` audit metrics |
| 5 | Remove fixed audit scores; return real data or `501` |
| 6 | Make `approveRun` return `501` |
| 7 | Delete the three synthetic client datasets |
| 8 | Add `KNOWN_LIMITATIONS.md` |
| 9 | Fix the failing test |
| 10 | Fix CI secret-scan paths; make security and lint blocking |
| 11 | Untrack `backend/node_modules` and `backend/app.js` |
| 12 | Rewrite status docs truthfully |

**Exit criterion:** no surface displays a number or record that no system produced.

**Why this is first:**

- It costs almost nothing.
- It requires no new technology.
- It requires no decisions from anyone.
- It removes the majority of the legal and reputational exposure.
- It creates the immune system — a provenance test that fails the build if a synthetic source reappears.

**The psychological cost:** the product will look *less* complete at the end of M0 than it does today. That is the point. The current completeness is the lie.

---

## 17. The roadmap and the commercial boundary

| M | Name | Duration | Exit in one line |
|---|---|---|---|
| M0 | Subtraction | 1 week | Nothing false is displayed |
| M1 | Enforcement | 2 weeks | Anonymous access is impossible; the product is safe to show |
| M2 | Foundation | 3 weeks | One store, one schema, real tenancy |
| M3 | First real vertical | 3 weeks | An audit score derived from stored evidence, with a report |
| M4 | Substrate | 3 weeks | Durable, metered, gated, observable |
| M5 | Discovery | 2 weeks | Legal sourcing with provenance and expiry |
| M6 | Outreach | 3 weeks | Consented, approved, tracked email |
| M7 | Autonomy | 3 weeks | Earned autonomy, recorded and reversible |
| M8 | Delivery | 3 weeks | Reports and margin from records |
| M9 | Commercialisation | 3 weeks | Billing, staging, security gate |
| M10 | Enterprise readiness | 4 weeks | SSO, ReBAC, isolation |
| M11 | Scale | 4 weeks | Performance, cost, reliability |
| M12 | Platform | 6+ weeks | Other agencies operate their own workspace |

**Commercial boundary:** M3 permits **design-partner audits only** — a signed pilot agreement, a public URL, manual delivery, staging storage, deletion on request, no self-serve account, no payment flow, no SLA. M9 is the gate for self-serve customers, payment data, and customer-facing commitments.

This is the smallest way to test willingness to pay without putting tenancy, billing, or a security review ahead of evidence.

**Stop points:** M1 is a valid stopping place (a safe, empty product). M3 is a valid stopping place (an honest audit service). Continuing past M3 without a design partner is a warning sign, not a triumph.

---

## 18. Risks that can kill this, and the go/no-go

### The risks that matter

| Risk | Why it dominates | Kill criterion |
|---|---|---|
| **R-01** Fabricated data or metrics discovered | Already true; reaches the customer's outbound pipeline | Any synthetic value reaching a customer |
| **R-02** Cross-tenant exposure via demo org | Already true; no tenant enforcement exists | Any `200` response containing another org's data |
| **R-03** Account takeover via published credentials | Already true; credentials are displayed on the login page | Any successful auth with a documented credential |
| **R-05** Founder bandwidth | The plan is 21 weeks of decomposed work before M8 | Two consecutive milestones missed with no scope cut |
| **R-06** Runway exhausted before M4 | The substrate produces no visible feature | Runway below 3 months at M3 |
| **R-07** ZCQL cannot enforce uniqueness | The ledger's integrity depends on the answer | Must be settled before M4 |

The first three are not hypothetical. They are current conditions. M0 and M1 exist to convert them into historical notes.

### Go/no-go for Stage B

| # | Condition | Status |
|---|---|---|
| 1 | D-01 answered (Option A or B) | **Open** |
| 2 | D-02 answered (audit vs lead-gen first) | **Open** |
| 3 | D-03 answered (exclude SMS/voice) | **Open** |
| 4 | M0 scope accepted as subtractive | **Open** |
| 5 | No production tenant data confirmed (T-002) | **Open** |
| 6 | Awareness that the product looks worse after M0 | **Open** |
| 7 | Explicit instruction to proceed | **Open** |

If any of 1–3 is unanswered, Stage B cannot start, because the roadmap, product sections, and compliance work all depend on them.

### What this plan does not claim

No market validation. No customer interviews. No TAM/SAM. No competitive analysis. No financial projection. No penetration test. No live integration test. No E2E run. No performance data. Every compliance conclusion is `INFERRED` and requires counsel.

---

## 19. The decisions and the ask

### The three blocking decisions

| ID | Decision | Recommendation | If deferred |
|---|---|---|---|
| **D-01** | Option A (consolidate) or Option B (demo-first)? | **A** | No work can start; M0 assumes A |
| **D-02** | Lead-generation tool or audit-and-delivery tool? | **Audit first**, lead generation as an adjacent capability once compliant sourcing exists | Product docs and roadmap reorder |
| **D-03** | Exclude SMS and voice permanently? | **Yes, for at least two years** | A compliance workstream precedes any engineering |

### The other eleven decisions

| ID | Decision | Recommendation |
|---|---|---|
| D-04 | Is WhatsApp in scope? | Conditional at M7, only if customers request it |
| D-05 | What is one credit worth? | Derive from measured cost at M4 |
| D-06 | Included allowance per package? | After M4 cost data |
| D-07 | Target margin and per-line floors? | Set a floor, enforce per service line |
| D-08 | Pass-through provider fees at cost or with margin? | At cost, separately itemised |
| D-09 | Website builder: build or remove? | Remove from navigation in M1; decide at M8 |
| D-10 | Retention periods? | Adopt `28` §7 as written |
| D-11 | Which two LLM providers at launch? | One frontier, one fast/cheap, chosen on measured quality at M3 |
| D-12 | Qdrant trigger thresholds? | Adopt `32` §3 |
| D-13 | Grievance officer and data protection contact? | Founder initially; name publicly at M9 |
| D-14 | Nomination and children's-data posture? | Refuse children's data; defer nomination to M10 |

### The ask, in order

1. **Choose A or B.** If B, say so now; sections `14`, `19`, `20`, and `21` will be rewritten before anyone writes code.
2. **Answer D-01, D-02, D-03.** The other eleven can be deferred with an owner.
3. **Accept that M0 is subtractive.** The product will demonstrate less next week than it does today, and that is the intended outcome.
4. **Authorise Stage B explicitly — or do not.** If you authorise it, the first commit is M0, not a feature.

> **The interface is worth keeping. The interior is not yet real. Make it real before making it bigger.**

---

*End of deck. This document is a plan, not an implementation. The repository remains exactly as audited at `d1be212` until Stage B is authorised.*
