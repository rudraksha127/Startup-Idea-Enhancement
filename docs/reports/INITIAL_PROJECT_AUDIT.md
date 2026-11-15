# AgencyOS — Initial Project Audit & Codebase Inventory

**Audit Date:** 14 November 2026  
**Status:** Canonical Initial Audit  
**Auditor:** Principal Enterprise Software Architect & Engineering Review Board  

---

## 1. Executive Summary

This document provides a verified, artifact-grounded audit of the AgencyOS codebase prior to executing the comprehensive Zoho Catalyst migration, live provider integrations, demo data cleanup, agentic browser QA, and production release pipeline.

### High-Level Codebase Baseline
* **Current Git Commit:** `2bd1ef5` (ahead of origin/main by 7 commits).
* **Automated Unit & Contract Tests:** 72 passing tests across 16 test files.
* **Frontend Architecture:** Next.js 15.1.4 (App Router) with React 19 and Tailwind CSS 3.4.
* **Backend Architecture:** Express REST API with 16 modular vertical slices (`backend/src/modules/`).
* **Current Database Layer:** MongoDB 8.0 with Mongoose 8.9.3 (Target: **Zoho Catalyst CloudScale Data Store** per Section 5).
* **Automation Layer:** 25 n8n workflow definitions in `n8n/workflows/` (13 agents, 7 sub-workflows, 4 system, 1 trigger).
* **Deployment Target:** Frontend on Cloudflare Pages; Backend on Zoho AppSail (`backend/catalyst.json`); Database on Zoho Catalyst Data Store.

---

## 2. Directory Structure & Monorepo State

The current repository layout follows the partitioned monorepo design:

| Directory | Role & Current State | Target Alignment (Section 3) | Required Actions |
| :--- | :--- | :---: | :--- |
| `frontend/` | Next.js 15 UI, 11 feature dashboards, static public assets | Partial | Refactor hardcoded fallback mock arrays; connect to backend API; add Dockerfile. |
| `backend/` | Express 5 API server, 16 domain modules, `catalyst.json` | Partial | Remove Mongoose/Mongo; create `src/infrastructure/persistence/zoho-catalyst/`; add Dockerfile. |
| `database/` | Contains legacy Mongo models, migrations, and seed scripts | Divergent | Migrate to `database/zoho-catalyst/` (schemas, manifests, migrations, provisioning, ZCQL queries). |
| `n8n/` | 25 JSON workflows, Docker compose (PostgreSQL + Redis + n8n) | Aligned | Connect webhooks and callbacks to Zoho Catalyst persistent backend. |
| `packages/` | `shared-types`, `utilities`, `contracts`, `validation`, `config` | Aligned | Maintain shared Zod schemas and TypeScript interfaces. |
| `tests/` | 72 Vitest unit/contract/security tests, Playwright config | Partial | Add `tests/browser/` Playwright automated browser test suites. |
| `docs/` | Comprehensive architectural and business fit documentation | Partial | Add `docs/reports/` with required audits and completion reports. |
| `infra/` | Docker, Redis, MongoDB configs | Partial | Reorganize into `infra/cloudflare-pages/`, `infra/zoho-appsail/`, `infra/n8n/`, `infra/storage/`, `infra/monitoring/`, `infra/ci-cd/`. |
| `release/` | Not yet created | Missing | Create `release/frontend/`, `release/backend/`, `release/database/`, `release/n8n/`. |

---

## 3. Technology Stack & Runtime Audit

| Technology | Current Version | Target Architecture | Status / Gap |
| :--- | :---: | :--- | :--- |
| **Node.js** | v20.18.x | Node.js 20 LTS (AppSail runtime) | Supported & Aligned |
| **Frontend Framework** | Next.js 15.1.4 | Next.js 15 App Router on Cloudflare Pages | Fully Supported |
| **UI Library** | React 19.0.0 | React 19 | Fully Supported |
| **API Framework** | Express 5.3.0 | Express 5 on Zoho AppSail | Fully Supported |
| **Primary Database** | MongoDB / Mongoose 8.9 | **Zoho Catalyst CloudScale Data Store** | **MIGRATION REQUIRED (Section 5)** |
| **Database Query Lang**| Mongoose ODM | ZCQL & `zcatalyst-sdk-node` (v3.4.0) | **IMPLEMENTATION REQUIRED** |
| **Validation Engine** | Zod 3.24.1 | Universal Zod schema parsing | Fully Supported |
| **Automation Engine** | n8n 1.70+ | n8n Cloud / Persistent Self-Hosted Docker | Workflows Validated |
| **Testing** | Vitest 2.1.8 | Vitest + Playwright Chromium | Tests passing; browser suite required |

---

## 4. Current Database State & Zoho Catalyst Migration Scope

### Current Obsolete MongoDB Artifacts (To Be Replaced):
1. `backend/src/config/db.ts` — connects via `mongoose.connect(ENV.MONGODB_URI)`.
2. `backend/src/config/env.ts` — contains `MONGODB_URI`.
3. `backend/src/models/*.ts` — 12 Mongoose Schema definitions:
   * `AgentConfig.ts`, `AgentExecution.ts`, `Campaign.ts`, `Client.ts`, `Invoice.ts`, `Lead.ts`, `LeadNote.ts`, `Organization.ts`, `OutreachMessage.ts`, `Project.ts`, `Template.ts`, `User.ts`.
4. `database/indexes/index.ts` & `database/migrations/index.ts` — Mongo-specific compound indexes and migration runners.
5. `database/seed/seed-data.ts` — Mongo-specific collection population.
6. `frontend/src/models/*.ts` — duplicate Mongoose models in frontend.

### Target Zoho Catalyst CloudScale Data Store Architecture:
* Install `zcatalyst-sdk-node` (v3.4.0) in `backend/`.
* Provision Catalyst Data Store tables with exact schema manifests:
  * `Organizations`, `Users`, `Leads`, `LeadAudits`, `Campaigns`, `OutreachMessages`, `Replies`, `Meetings`, `Proposals`, `Clients`, `Projects`, `Tasks`, `Templates`, `Invoices`, `AgentConfigs`, `AgentExecutions`, `AuditLogs`.
* Implement ZCQL (Zoho Catalyst Query Language) data access repositories under `backend/src/infrastructure/persistence/zoho-catalyst/`.
* Implement Catalyst Stratus for file uploads and storage.
* Implement Catalyst Cache for session/transient rate limits.

---

## 5. Frontend & UI Operational Status

All 11 dashboard views exist and render with high visual fidelity, but exhibit varying degrees of mock data fallback:

1. **Dashboard (`/dashboard`):** Renders KPI cards, revenue charts, lead growth. Recharts components use hardcoded fallback trends when API is empty.
2. **Leads (`/leads`):** Renders lead table, filter sidebar, lead detail drawer. Ingests via `/api/leads`. Auto-seeded `DEFAULT_LEADS` on empty DB (must be removed).
3. **Map Explorer (`/map-explorer`):** Renders category pills, city selector, map view. Falls back to 12 synthetic businesses (`INITIAL_BUSINESS_RESULTS`) if search returns empty.
4. **AI Agents (`/ai-agents`):** Lists 13 canonical agents with run modal. Triggers backend orchestrator; fallback logs used if unconfigured.
5. **Outreach (`/outreach`):** Campaigns, Sequences, Inbox tabs. Falls back to hardcoded `CAMPAIGNS` (10 items) and fake conversations.
6. **Clients (`/clients`):** Client pipeline and directory. Falls back to 8 hardcoded `CLIENT_RECORDS`.
7. **Projects (`/projects`):** Project Kanban and list view. Falls back to hardcoded `PROJECTS_DATA` (8 items).
8. **Templates (`/templates`):** Website and proposal template selector. Works against template registry.
9. **Analytics (`/analytics`):** Pipeline funnels, deal size metrics. Falls back to sample trends when API is offline.
10. **Billing (`/billing`):** Invoicing and revenue overview. Falls back to hardcoded `REVENUE_OVER_TIME` array.
11. **Settings (`/settings`):** Team members, API integrations, diagnostic test tools. Real form submits to `/api/v1/teams` and `/api/v1/integrations`.

---

## 6. Integrations & External Provider Status

| Integration | Implementation | Status | Required Action |
| :--- | :--- | :---: | :--- |
| **Google Maps Platform** | Text Search & Place Details | Partial / Staging Mock | Connect live `GOOGLE_MAPS_API_KEY`; verify TOS Section 3.2.3 compliance; live autocomplete. |
| **AI Models (LLM)** | Multi-provider router (`backend/src/modules/agents/`) | Partial / Staging Mock | Connect OpenAI / Gemini / Anthropic / Groq keys; enforce model capability routing. |
| **Email (SendGrid/SES)** | Outbound dispatch service | Safe Mode (`dry_run=true`) | Connect verified API key or sandbox; verify webhook reply ingest. |
| **Calendar (Cal.com)** | Meeting coordination module | Schema Ready | Connect Cal.com API or Google Calendar OAuth. |
| **Payments (Stripe)** | Invoicing and idempotent webhooks | Implemented | Connect live/test Stripe keys; verify webhook signature verification. |
| **Deployment (Cloudflare)** | Webhook trigger service | Configured | Link Cloudflare Pages deploy hook for customer website generation. |
| **n8n Automation** | 25 JSON workflows | Validated | Connect live n8n instance with API key and bi-directional webhooks. |

---

## 7. Immediate Action Items

1. Create verified audit suite:
   * `docs/reports/EXISTING_FEATURE_AUDIT.md`
   * `docs/reports/DEMO_DATA_AUDIT.md`
   * `docs/reports/INTEGRATION_AUDIT.md`
   * `docs/reports/EXECUTION_ROADMAP.md`
2. Restructure repository per Section 3 to establish Zoho Catalyst, infrastructure, packages, and release layouts.
3. Migrate database layer from MongoDB/Mongoose to Zoho Catalyst CloudScale Data Store (ZCQL).
4. Remove all hardcoded demo datasets from frontend views and replace with genuine backend queries and honest empty states.
5. Build and execute Playwright Chrome browser automation testing across all 11 routes.
