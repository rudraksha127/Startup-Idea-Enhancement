# 00 — Executive Summary

**Evidence basis:** repository at `d1be212`, 17 Nov 2026
**Stage:** A (planning). No implementation performed.

---

## 1. The one-paragraph finding

AgencyOS is not a working agency platform with some gaps. It is a **high-fidelity interface over a mostly non-functional backend**, where the failure mode is not crashing but **confident fabrication**: the product returns plausible-looking business data, audit scores, agent results, and financial records that were never computed, never fetched, and in some cases never existed (`SOURCE-VERIFIED`, `TEST-VERIFIED`). The interface quality is genuinely strong and worth preserving. The functional core beneath it is largely absent, and several defects are security-critical rather than cosmetic. That combination — attractive surface, fabricated interior, exploitable auth — is the worst possible configuration to put in front of a paying customer.

---

## 2. What was verified, and what it showed

| Gate | Command | Result |
|---|---|---|
| Frontend types | `npm run typecheck:frontend` | **PASS** |
| Backend types | `npm run typecheck:api` | **PASS** |
| Tests | `npm run test` | **FAIL — 71 pass / 1 fail** of 72, 16 files |
| Production build | `npm run build` (OpenNext → Cloudflare Worker) | **PASS**, emits `.open-next/` |
| E2E | `npm run test:e2e` | **NOT RUN by CI, not verified in this audit** |

The single test failure is small in itself — `tests/unit/components.test.tsx:36` cannot find the text `"Qualified Leads"` — but it falsifies two documentation artefacts that claim **72/72 passing and all modules WORKING** (`SOURCE-VERIFIED`: `docs/execution/CURRENT_STATUS.md`, `docs/IMPLEMENTATION_STATUS.md`). Documentation that overstates readiness is itself a release blocker, because it removes the pressure that would otherwise force the fix.

---

## 3. The five findings that decide the company's next quarter

### F1 — Authentication is optional, and there is a production backdoor (`CRITICAL`)
`backend/src/middleware/auth.ts` lets unauthenticated requests through and `backend/src/common/resolve-org.ts` silently binds them to a shared demo organisation `org-apex-001`. There is no `middleware.ts` anywhere in the app, so **every dashboard page is publicly reachable**. `frontend/src/lib/auth/jwt.ts` falls back to a hardcoded signing secret when `JWT_SECRET` is unset. `frontend/src/app/(auth)/login/page.tsx` prefills and advertises `founder@agencyos.com` / `password123`, and `frontend/src/lib/seed/seed-data.ts` creates exactly that account.
`SOURCE-VERIFIED`. This is not a hardening item. It is the reason the product cannot be shown to a customer.

### F2 — The system invents business data (`CRITICAL`)
- `frontend/src/app/api/leads/[leadId]/audit/route.ts` returns the same six audit scores (68/54/46/42/78/88) for every lead.
- `frontend/src/app/(dashboard)/audits/page.tsx` generates audit metrics with `Math.random()`.
- `frontend/src/app/api/agents/[id]/run/route.ts` emits hardcoded `CANONICAL_OUTPUTS` and **fabricates phone numbers** for discovered leads.
- `frontend/src/app/(dashboard)/map-explorer/page.tsx` renders a hardcoded `REALISTIC_BUSINESSES` array under the label "Businesses Found (2,847)".
- `frontend/src/app/api/maps/places/route.ts` returns a static "Verified Business Registry" labelled as *Google Maps Verified* when no API key is present.

`SOURCE-VERIFIED`. For an agency selling lead generation, fabricated contact data is the single most damaging possible defect: it reaches the customer's outbound pipeline and their reputation.

### F3 — The agent layer does not exist as software (`CRITICAL`)
All 13 agents in `backend/src/modules/agents/definitions/index.ts` are hardcoded stubs with no LLM invocation. `backend/src/modules/agents/agent-orchestrator.ts` fakes orchestration, returns canned results from `approveRun`, and reports invented token counts. `frontend/src/lib/providers/index.ts` returns mock implementations unconditionally.
`SOURCE-VERIFIED`. The headline capability of the product — autonomous agents — is a UI over a `switch` statement.

### F4 — Persistence is contradictory and ZCQL cannot carry financial state (`HIGH`)
Four conflicting lead-status enums exist across `frontend/src/models`, `packages/shared-types`, `database/schema/schemas.ts`, and the Catalyst manifest. `backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` is an **in-memory ZCQL fake with silent fallback**. ZCQL supports DML only, no DDL, at most four `JOIN` clauses, and no documented multi-statement transactions — which means a credits ledger and invoice state machine require an application-level design, not a `BEGIN/COMMIT`.
`SOURCE-VERIFIED`. This is the constraint that most shapes the target architecture.

### F5 — The build and docs describe three different products (`HIGH`)
`ADR-004` mandates Next.js + MongoDB on Supabase-era assumptions; `ADR-005` mandates Cloudflare **Pages** + Zoho Express; the code actually produces an **OpenNext Worker** (`wrangler.json`, `main: .open-next/worker.js`). The root and `frontend` Dockerfiles are identical and broken — they copy `.next/standalone`, which the OpenNext build does not produce. CI's security job runs with `continue-on-error: true` against directories (`src/`, `apps/`) that do not exist, and Playwright is never gated.
`SOURCE-VERIFIED`. Anyone onboarding today would build the wrong thing.

---

## 4. What is genuinely worth keeping

This is not a rewrite recommendation. Six assets have real value:

1. **The visual system.** Warm off-white canvas, dark charcoal sidebar, restrained emerald accents. It reads as a credible operations product, not a template. Preserve exactly (`SOURCE-VERIFIED`).
2. **The route and page surface map.** 42 API routes and a complete dashboard IA already encode the product's shape. The IA is a design asset even where the implementations are hollow (`SOURCE-VERIFIED`).
3. **The domain vocabulary.** Leads, audits, campaigns, agents, runs, approvals, credits. The nouns are right; the schema discipline is missing (`INFERRED`).
4. **The deployment skeleton.** A working OpenNext → Cloudflare Worker build plus `zcatalyst-sdk-node` wiring is a real head start on the intended target (`TEST-VERIFIED` build, `SOURCE-VERIFIED` config).
5. **Type safety.** Both `typecheck:frontend` and `typecheck:api` pass. That is what makes fast, safe refactoring possible (`TEST-VERIFIED`).
6. **The `AGENTS.md` operating rules.** Sound rules. The problem is that the code ignores them, not that the rules are wrong (`SOURCE-VERIFIED`).

---

## 5. Recommended strategy: **consolidate, then earn autonomy**

Do not add capabilities. Remove the lie, then rebuild the spine.

**M0–M1 (4 weeks): Make it honest and safe.**
Delete or hard-disable every fabricating surface. Enforce auth. Remove the backdoor account and the JWT default. Gate the dashboard. Make every unconfigured integration return an explicit `not_configured` state instead of a plausible fake. Fix the failing test and correct the status docs. *Exit criterion: no surface in the product can display a number or a record that no system produced.*

**M2–M4 (9 weeks): Build the real spine on Catalyst.**
One authoritative schema. ZCQL repository layer with no silent in-memory fallback — fail loudly. A real agent runtime with tool contracts, budgets, and traces. A credits ledger with compensating entries. Approval gates enforced server-side.

**M5–M8: Earn autonomy progressively.**
Agents start at `suggest_only`, graduate to `execute_with_approval` per capability, and only reach `execute_autonomously` after measured performance with evidence. Autonomy is a permission the system earns per capability, not a global switch.

**M9–M12: Commercialise.**
Multi-tenant isolation, billing, SLAs, and the compliance posture needed to sell into India-first SMB and agency markets.

---

## 6. Technology verdict in one line each

| Candidate | Verdict |
|---|---|
| **Temporal** | **ADOPT (M4)** — MIT, durable execution is exactly the missing primitive for multi-step agency workflows. Heavier ops cost; justify by M5. |
| **n8n** | **CONSTRAIN** — Sustainable Use License, not OSI. Fine as internal glue today; a commercial licence is required before hosting workflows for third parties. Do not make it the product's execution engine. |
| **LangGraph** | **DEFER (conditional, M6)** — MIT library, useful only once an agent genuinely branches. A linear audit pipeline is clearer in plain TypeScript. Avoid the commercial Platform lock-in. |
| **LiteLLM** | **ADOPT (M3)** — MIT gateway, solves multi-provider routing, retries, and cost accounting in one component. |
| **Langfuse** | **ADOPT (M3)** — MIT core, self-hostable, gives traces + evals + prompt versioning. Enterprise features not required. |
| **Qdrant** | **DEFER (M8)** — Apache-2.0 and excellent, but only justified once there is real corpus volume. Start with Catalyst-native retrieval. |
| **Hermes Agent** | **EVALUATE AS ISOLATED TOOL (M7)** — MIT, actively maintained, strong MCP support. Not a business orchestrator; never let it hold business state. |
| **OpenHands** | **REJECT for core** — MIT and capable, but a coding-agent runtime is not the product. Optional internal engineering tool only. |
| **OPA / OpenFGA** | **DEFER** — Apache-2.0, correct shapes for policy and ReBAC, but premature before tenancy exists. Start with explicit server-side guards. |

**Anti-recommendation:** adopting any of the above before F1–F4 are fixed adds operational surface to a system that cannot yet be trusted to return a true number.

---

## 7. The decision the founder actually has to make

There are two honest options.

**Option A — Consolidate (recommended).** Four weeks of subtraction and safety, then build the spine. Slower to demo, but every subsequent demo is true. Cost: the product looks *less* complete at the end of M1 than it does today, because the fakes come out.

**Option B — Demo-first.** Keep the synthetic surfaces, add a "demo mode" banner, and sell pilots against a scripted experience. Faster to revenue, but it hard-codes the fabrication into the commercial model, and the first customer who exports a lead list discovers F2.

This plan assumes Option A. If the founder chooses Option B, sections `14` and `40` describe precisely what must be disclosed to customers and what the repayment risk is.

---

## 8. Go / no-go

Stage B (implementation) should **not** begin until:
- The founder approves Option A or B explicitly (`46`).
- The three blocking decisions D-01, D-02, D-03 are answered; the remaining eleven may be explicitly deferred with an owner.
- M0's scope is accepted as *subtractive*, with the understanding that visible capability will temporarily decrease.

---

## 9. Honest limits of this audit

- **No live integration was exercised.** No email, WhatsApp, Stripe, or Maps call was made. Connector behaviour is assessed from code only (`SOURCE-VERIFIED` reading, behaviour `BLOCKED`).
- **E2E was not run.** Playwright exists but was not executed; its state is `BLOCKED`, not "passing".
- **No production environment was inspected.** Deployment claims are inferred from configuration files (`INFERRED`).
- **No market sizing was performed.** No TAM/SAM figure appears anywhere in this corpus, deliberately.
- **No security penetration test was performed.** The security findings are code-reading findings, not exploitation results.
