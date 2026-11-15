# AgencyOS — Existing Feature Audit & Implementation Inventory

**Audit Date:** 14 November 2026  
**Status:** Canonical Feature Inventory  
**Auditor:** Principal Software Architect & QA Lead  

---

## 1. Feature Audit Methodology

Each of the 11 core AgencyOS frontend and backend modules has been audited across nine specific criteria:
1. **Existing Implementation:** Files, components, and API routes present.
2. **Actually Working:** Operations confirmed functional with end-to-end tests.
3. **Partially Implemented:** Functional logic that lacks edge case or full provider integration.
4. **Uses Fake Data:** Hardcoded fallback arrays or mock data injections.
5. **No Backend Connection:** UI controls that fail to send network requests or update state.
6. **Missing Features:** Features promised by design but absent in code.
7. **Broken Features:** Code paths that throw runtime exceptions or validation failures.
8. **Requires External Credentials:** Integrations waiting on live third-party keys.
9. **Requires Human Decision:** Business rules or operational approvals needing founder signoff.

---

## 2. Comprehensive Module-by-Module Audit

### Module 1: Executive Dashboard (`/dashboard`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/dashboard/page.tsx`, `frontend/src/features/dashboard/`, `backend/src/modules/dashboard/`.
* **Actually Working:** KPI metric calculation (`/api/v1/dashboard/metrics`), recent activity stream, navigation to sub-features.
* **Partially Implemented:** Real-time WebSocket live updates (currently polling).
* **Uses Fake Data:** `REVENUE_OVERVIEW` fallback chart trends and hardcoded fallback lead growth numbers when database is empty.
* **No Backend Connection:** "Customize Dashboard" button.
* **Missing Features:** Custom widget re-ordering and user-defined KPI thresholds.
* **Broken Features:** None.
* **Requires External Credentials:** None (internal business metrics).
* **Requires Human Decision:** Definition of default target MRR and monthly sales quotas.

---

### Module 2: Leads Management (`/leads`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/leads/page.tsx`, `frontend/src/features/leads/`, `backend/src/modules/leads/`.
* **Actually Working:** Lead listing with sorting, pagination, search, category filters, CSV export, CSV import modal, lead detail drawer with audit findings.
* **Partially Implemented:** Real-time push updates upon new lead discovery.
* **Uses Fake Data:** Legacy auto-seeding of `DEFAULT_LEADS` when collection count was 0 in Next.js API route.
* **No Backend Connection:** "Bulk Enrich Selected" button in header (requires n8n enrichment trigger).
* **Missing Features:** Multi-tag custom filtering (currently single category filter).
* **Broken Features:** None.
* **Requires External Credentials:** None for basic CRUD; PageSpeed API for live website audit.
* **Requires Human Decision:** Determination of minimum Opportunity Score required to auto-qualify leads.

---

### Module 3: Google Maps Explorer (`/map-explorer`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/map-explorer/page.tsx`, `backend/src/modules/maps/`.
* **Actually Working:** Category selection, city switcher, query submission, place cards rendering with Opportunity Scores, "Add to Leads" button.
* **Partially Implemented:** Google Maps live vector tile rendering (currently renders custom styled coordinate radar & OpenStreet map fallback).
* **Uses Fake Data:** `INITIAL_BUSINESS_RESULTS` (12 hardcoded restaurants, salons, clinics) displayed when search returns empty or offline.
* **No Backend Connection:** "Export Map Search as CSV" button.
* **Missing Features:** Polygon / custom radius drawing on map canvas.
* **Broken Features:** None.
* **Requires External Credentials:** `GOOGLE_MAPS_API_KEY` for live Places API (New) calls and Google Maps JavaScript API rendering.
* **Requires Human Decision:** Allowed search radius caps to prevent Google Cloud billing overruns.

---

### Module 4: AI Agent Fleet (`/ai-agents`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/ai-agents/page.tsx`, `backend/src/modules/agents/`, `n8n/workflows/agents/`.
* **Actually Working:** Catalog of all 13 canonical agents, execution modal, input parameter forms, REST trigger `/api/v1/agents/:id/run`.
* **Partially Implemented:** Live streaming terminal output (currently displays formatted execution output upon completion).
* **Uses Fake Data:** Initial demo execution logs if no runs have occurred.
* **No Backend Connection:** "Clone Agent" button.
* **Missing Features:** Visual prompt template editor in UI.
* **Broken Features:** None.
* **Requires External Credentials:** `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` for live LLM completions.
* **Requires Human Decision:** Per-agent model tier assignments (e.g. GPT-4o for SOW generation vs Flash Lite for reply classification).

---

### Module 5: Outreach & Campaigns (`/outreach`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/outreach/page.tsx`, `backend/src/modules/outreach/`.
* **Actually Working:** Campaign table, AI cold reply generator (`/api/v1/outreach/ai-reply`), approval drawer, test send simulator.
* **Partially Implemented:** Multi-step drip sequence automation (logic defined in n8n, UI sequence tab is static preview).
* **Uses Fake Data:** `CAMPAIGNS` (10 hardcoded campaigns) and `PERFORMANCE_DATA` fallback chart; hardcoded inbox conversation thread.
* **No Backend Connection:** "Connect LinkedIn Account" button.
* **Missing Features:** Real-time IMAP/POP3 direct email inbox sync (relies on webhook ingest).
* **Broken Features:** None.
* **Requires External Credentials:** `SENDGRID_API_KEY` or `RESEND_API_KEY` for outbound email delivery; inbound webhook URL for reply parsing.
* **Requires Human Decision:** Mandatory Human-in-the-Loop campaign approval protocol.

---

### Module 6: Clients Directory (`/clients`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/clients/page.tsx`, `backend/src/modules/clients/`.
* **Actually Working:** Client list, client detail view with tabs (Overview, Projects, Invoices, Notes), status badge, search.
* **Partially Implemented:** Client portal access link generation.
* **Uses Fake Data:** `CLIENT_RECORDS` (8 hardcoded client profiles) displayed if backend returns 0 records.
* **No Backend Connection:** "Share Client Portal Link" button.
* **Missing Features:** Client portal authentication view.
* **Broken Features:** None.
* **Requires External Credentials:** None.
* **Requires Human Decision:** Client onboarding checklist requirements per industry niche.

---

### Module 7: Projects & Tasks (`/projects`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/projects/page.tsx`, `frontend/src/features/projects/`, `backend/src/modules/projects/`.
* **Actually Working:** Project Kanban / list view, milestone progress bars, budget tracking, "New Project" dialog.
* **Partially Implemented:** Drag-and-drop task card status transitions in Kanban view.
* **Uses Fake Data:** `PROJECTS_DATA` (8 hardcoded projects) fallback.
* **No Backend Connection:** "Sync with GitHub Issues" button.
* **Missing Features:** Gantt chart timeline view.
* **Broken Features:** None.
* **Requires External Credentials:** GitHub PAT token if automatic repository sync is enabled.
* **Requires Human Decision:** Milestone delivery signoff requirements.

---

### Module 8: Website & Proposal Templates (`/templates`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/templates/page.tsx`, `backend/src/modules/templates/`.
* **Actually Working:** Template gallery with category filters (Clinic, Restaurant, Gym, Hotel, Ecommerce), template preview, "Apply Template" action converting template into a project.
* **Partially Implemented:** Interactive live iframe template demo switcher.
* **Uses Fake Data:** Template thumbnails use static public assets.
* **No Backend Connection:** "Upload Custom Template ZIP" button.
* **Missing Features:** Visual WYSIWYG block editor for templates.
* **Broken Features:** None.
* **Requires External Credentials:** None.
* **Requires Human Decision:** Base pricing per template tier ($1,500 - $5,000).

---

### Module 9: Executive Analytics (`/analytics`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/analytics/page.tsx`, `backend/src/modules/analytics/`.
* **Actually Working:** Pipeline funnel chart, deal size distribution, lead source breakdown, agent token spend tracker.
* **Partially Implemented:** Date range picker (7 days, 30 days, 90 days) dynamically re-aggregating backend data.
* **Uses Fake Data:** Hardcoded fallback datasets if API returns empty metrics.
* **No Backend Connection:** "Export Analytics PDF" button.
* **Missing Features:** Custom multi-dimensional cohort retention analysis.
* **Broken Features:** None.
* **Requires External Credentials:** None.
* **Requires Human Decision:** Definition of agency gross margin and churn targets.

---

### Module 10: Billing & Invoicing (`/billing`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/billing/page.tsx`, `backend/src/modules/billing/`.
* **Actually Working:** Invoice table, status badges, Stripe webhook idempotent receiver, new invoice generation modal.
* **Partially Implemented:** Direct PDF invoice generation and download in browser.
* **Uses Fake Data:** `REVENUE_OVER_TIME` and `INVOICE_STATUS_DATA` fallback arrays.
* **No Backend Connection:** "Manage Payment Methods" button (requires Stripe Customer Portal link).
* **Missing Features:** Multi-currency FX conversion (currently INR and USD).
* **Broken Features:** None.
* **Requires External Credentials:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
* **Requires Human Decision:** Tax rates (GST / VAT) and payment term defaults (Net 15 / Net 30).

---

### Module 11: Settings & Administration (`/settings`)
* **Existing Implementation:** `frontend/src/app/(dashboard)/settings/page.tsx`, `backend/src/modules/settings/`, `backend/src/modules/teams/`, `backend/src/modules/integrations/`.
* **Actually Working:** Team member invitations, role updates (Owner, Admin, PM, Specialist, Viewer), member removal, integration status inventory, on-demand provider connectivity testing (`POST /api/v1/integrations/test`), security headers.
* **Partially Implemented:** Two-Factor Authentication (2FA) setup.
* **Uses Fake Data:** None (connected directly to `/api/v1/teams` and `/api/v1/integrations`).
* **No Backend Connection:** "Audit Log CSV Export" button.
* **Missing Features:** Custom domain DNS CNAME mapping interface.
* **Broken Features:** None.
* **Requires External Credentials:** API keys for each provider being tested.
* **Requires Human Decision:** Organization naming, timezone, and primary currency.
