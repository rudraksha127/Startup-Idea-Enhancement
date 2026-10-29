# AgencyOS — Master Implementation Tasks & Progress Matrix

**Document Version:** 2.0.0  
**Last Updated:** 30 October 2026  
**Status:** In Active Execution  

---

## Phase Overview

- [x] **Phase 1: Codebase Inspection, Full Audit & UI Inventory**
- [x] **Phase 2: Architectural Partitioning (Frontend, Backend, Database)**
- [x] **Phase 3: Zero-Dead-Controls Implementation & State Binding**
- [x] **Phase 4: Production Express REST API Tier Scaffolding (`apps/api`)**
- [x] **Phase 5: MongoDB Schema Engineering & Seed Pipeline**
- [ ] **Phase 6: End-to-End Module-by-Module Integration & Verification**
- [ ] **Phase 7: Security Hardening, Multi-Tenant Isolation & Privacy Compliance**
- [ ] **Phase 8: Dual-Tier Production Deployment Architecture (Cloudflare + Zoho Catalyst)**
- [ ] **Phase 9: Automated Verification & Vitest/Playwright Test Suite Expansion**
- [ ] **Phase 10: AI Multi-Agent Orchestration & Deterministic Safety Rails**
- [ ] **Phase 11: Final Delivery Gate, Clean Repository & Canonical Documentation Sync**

---

## Detailed Task Breakdown

### Phase 1 — Codebase Inspection & UI Inventory
- [x] **Task 1.1:** Audit entire Next.js App Router codebase, package dependencies, and tsconfig settings.
- [x] **Task 1.2:** Produce `docs/CODEBASE_AUDIT.md` mapping all working, partial, and mock modules.
- [x] **Task 1.3:** Produce `docs/UI_INTERACTION_INVENTORY.md` tracking all 168 buttons, forms, and charts.
- [x] **Task 1.4:** Verify Git state and ensure all previous hotfixes are committed without regression.

### Phase 2 — Architectural Partitioning
- [x] **Task 2.1:** Scaffold independent Express API directory structure under `apps/api/`.
- [x] **Task 2.2:** Establish shared validation schemas and typed contracts between frontend and backend.
- [x] **Task 2.3:** Configure TypeScript path aliases (`@/*`) and independent compilation pipelines.
- [x] **Task 2.4:** Build dual-tier start scripts (`npm run dev` and `npm run dev:api`).

### Phase 3 — Zero-Dead-Controls Implementation
- [x] **Task 3.1:** Resolve leads page empty state bug with dynamic fallback hydration (`DEFAULT_LEADS`).
- [x] **Task 3.2:** Re-engineer Lead Sources Donut Chart with clean white popover tooltip and center sync.
- [x] **Task 3.3:** Lock app sidebar to viewport (`h-screen sticky`) and remove vertical whitespace gaps.
- [x] **Task 3.4:** Reposition landing page scribble annotation away from laptop preview image.
- [x] **Task 3.5:** Standardize all chart tooltips across Analytics, Billing, Outreach, AI Agents with `WHITE_TOOLTIP_STYLE`.
- [x] **Task 3.6:** Implement 3-way Theme Toggle (Light / Dark / System Default) in Header, Sidebar, and Settings.

### Phase 4 — Express REST API Tier (`apps/api/`)
- [x] **Task 4.1:** Scaffold Express 5.3 server with TypeScript (`apps/api/src/server.ts`).
- [x] **Task 4.2:** Implement security middlewares: CORS, Request-ID tracing, Error Handler, and JWT Auth.
- [x] **Task 4.3:** Build REST controllers:
  - `auth.controller.ts` (register, login, session probe)
  - `leads.controller.ts` (list, filter, getById, create, update, delete)
  - `dashboard.controller.ts` (metrics, growth history, lead sources, activity)
  - `agents.controller.ts` (agent status, daily target, execution caps)
- [x] **Task 4.4:** Write Supertest integration tests verifying HTTP endpoints (`tests/unit/express-api.test.ts`).

### Phase 5 — MongoDB Schema Engineering & Seed Pipeline
- [x] **Task 5.1:** Design Mongoose schemas with compound indexes and tenant isolation:
  - `Organization` (name, slug, subscriptionTier, billingCycle)
  - `User` (email, passwordHash, role, twoFactorEnabled)
  - `Lead` (businessName, category, location, rating, status, auditResults)
  - `Project` (clientName, service, contractAmount, status, brief)
  - `AgentConfig` (agentType, status, dailyTarget, processedToday)
- [x] **Task 5.2:** Create seed pipeline (`src/lib/seed/seed-data.ts`) with 27 curated local leads.
- [x] **Task 5.3:** Document database schema, relations, and indexing in `docs/architecture/DATABASE_DESIGN.md`.

### Phase 6 — End-to-End Module Integration (In Progress)
- [x] **Task 6.1:** Connect Dashboard cards and charts to live API endpoints with offline fallbacks.
- [x] **Task 6.2:** Connect Leads page table, filtering, pagination, search, and audit drawer to MongoDB.
- [ ] **Task 6.3:** Connect Map Explorer coordinates with simulated business clustering.
- [ ] **Task 6.4:** Connect AI Agents configuration sliders with persistent backend storage.
- [ ] **Task 6.5:** Connect Outreach sequence generator with template merging and dry-run dispatch.
- [ ] **Task 6.6:** Connect Clients list and kanban with invoice status synchronization.
- [ ] **Task 6.7:** Connect Projects delivery brief generator with export to markdown/JSON.
- [ ] **Task 6.8:** Connect Template builder with interactive demo previews.
- [ ] **Task 6.9:** Connect Analytics aggregation queries across timeframes (7d, 30d, 90d, 1y).
- [ ] **Task 6.10:** Connect Billing usage meter with automated credit deduction logic.
- [x] **Task 6.11:** Connect Settings workspace profile, API keys, and theme preferences.

### Phase 7 — Security Hardening & Compliance
- [x] **Task 7.1:** Enforce Google Maps TOS Section 3.2.3 (Zero unauthorized web scraping).
- [x] **Task 7.2:** Enforce DPDP Act 2023 & TRAI TCCCPR compliance (Default `dry_run = true` on outbound channels).
- [x] **Task 7.3:** Secure JWT tokens with `httpOnly`, `SameSite=None`, and `Secure` flags.
- [x] **Task 7.4:** Strip database connection strings and sensitive credentials from client bundles.

### Phase 8 — Dual-Tier Deployment Setup
- [x] **Task 8.1:** Author Zoho Catalyst deployment manifest (`catalyst.json`) for AppSail.
- [x] **Task 8.2:** Author Cloudflare Pages build configuration (`next.config.ts` unoptimized export).
- [x] **Task 8.3:** Document complete deployment protocol in `docs/deployment/DEPLOYMENT_GUIDE.md`.

### Phase 9 — Automated Verification & QA
- [x] **Task 9.1:** Vitest unit test suite (16 tests passing across 4 files).
- [x] **Task 9.2:** TypeScript strict typechecking (0 errors across web and api tiers).
- [x] **Task 9.3:** Puppeteer visual verification of theme toggle, chart tooltips, and leads table.

---

## Acceptance Verification Criteria
1. `npm run typecheck` passes with zero errors.
2. `npm run test` executes all unit and API contract tests with 100% pass rate.
3. Both Light and Dark themes render without contrast regressions or layout shifts.
4. All chart tooltips appear with white backgrounds, dark text, and legible numbers.
5. All 27 initial leads render in the table with working status filter tabs.
