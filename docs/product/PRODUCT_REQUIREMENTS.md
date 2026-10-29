# AgencyOS Product Requirements Document (PRD)

**Status:** Canonical Reference  
**Release Target:** v1.0 Production SaaS  

---

## 1. Functional Requirements by Module

### 1.1 Dashboard (`/dashboard`) [P0]
- **KPI Metrics:** Display Total Leads, Active Outreach, Active Clients, and Monthly Revenue with historical trend badges.
- **Visual Analytics:** Interactive Recharts for Lead Generation Growth (7 months) and Lead Status Distribution.
- **Operational Feeds:** AI Agent status indicators, Model usage breakdown, and execution run history.

### 1.2 Leads Management (`/leads`) [P0]
- **Data Table:** Support server-side pagination, sorting (`createdAt`, `opportunityScore`, `rating`, `reviewCount`), and category/status filtering.
- **Bulk Actions:** Multi-select row selection for batch status changes and export.
- **CSV Ingest & Egest:** Import valid CSV files with PapaParse parsing; export CSV downloads.
- **Inspector Drawer:** Clicking any lead opens the instant Lead Detail & Website Audit panel.

### 1.3 Map Explorer (`/map-explorer`) [P1]
- **Radar Scanner:** Simulated geographic density map with cluster markers and category filter pills.
- **Lead Preview:** Right-side preview panel with 5 interactive sub-tabs: Overview, Reviews, Photos, Website Diagnostic, and AI Insights.
- **Direct Actions:** One-click Add to Leads, Email drafting, and WhatsApp link generation.

### 1.4 AI Agents Suite (`/ai-agents`) [P0]
- **Fleet View:** Overview cards for 5 agents (Research, Outreach, Reply Manager, Sales, Content) with status toggles.
- **Detailed Agent Configuration:** 7 functional sub-tabs: Configuration, Input & Triggers, Tools & Integrations, Prompt & Instructions, Output Format, Schedule, and Run History.

### 1.5 Outreach Engine (`/outreach`) [P0]
- **Campaigns Management:** List campaigns with deliverability stats (Sent, Opens, Replies, Meetings).
- **Sequence Builder:** Flowchart node builder with delays and condition branching.
- **Inbox & Reply Triage:** Email thread inbox with reply composer and AI objection guidance.

### 1.6 Clients CRM (`/clients`) [P1]
- **Client Directory:** List clients with active projects, total lifetime value, and contract status.
- **Profile Dossier:** Client contacts, tags, recent activity feed, and linked projects.

### 1.7 Projects & Delivery (`/projects`) [P0]
- **Project Tracking:** Progress bars, budget breakdown (Amount Paid, Amount Due), and deadlines.
- **Gantt Timeline:** Visual milestone tracking (Design Approval, Frontend, Backend, QA, Go-Live).
- **Developer Brief:** Exportable technical requirements document for developers.

### 1.8 Website Template Library (`/templates`) [P1]
- **Catalog:** Filterable website templates (Restaurant Pro, Café Delight, Dental Clinic, Hotel Luxe).
- **Inspection Drawer:** Multi-image preview carousel, 10-point feature checklist, and variation selectors.

### 1.9 Comprehensive Analytics (`/analytics`) [P1]
- 6 sub-dashboards: Overview, Conversion Funnel, Lead Sources, Campaign Performance, Revenue & MRR, and AI Telemetry.

### 1.10 Billing & Subscriptions (`/billing`) [P1]
- Invoice history table, upcoming payments list, and revenue by payment method breakdown.

### 1.11 Workspace Settings (`/settings`) [P0]
- Organization profile, Team management (roles, 2FA status), API key management (Gemini, Resend, Stripe), AI budget slider, and DPDP Act compliance toggles.

---

## 2. Non-Functional Requirements (NFRs)

- **Performance:** First Contentful Paint (FCP) < 1.2s; API route response time < 200ms.
- **Security:** Zero client-side credential leakage; JWT authentication with HttpOnly cookies; strict Zod validation on all POST/PATCH payloads.
- **Reliability:** 99.9% uptime target; graceful fallbacks for external AI or email provider outages.
- **Compliance:** Full compliance with Google Maps TOS Section 3.2.3 and the Indian DPDP Act 2023.

