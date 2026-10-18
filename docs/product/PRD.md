# Product Requirements Document (PRD) — Autonomous Agency OS

**Document ID:** PRD-001  
**Version:** 1.0.0-draft  
**Status:** PROPOSED (Pending Gate 5 Approval)  
**Author:** Technical Product Manager & Systems Architect  
**Approved by:** Pending Founder / Executive Council Signoff  

---

## 1. Product Vision & Problem Statement

### 1.1 Product Vision
Autonomous Agency OS is an internal operating system and command center built for a solo software developer running a productized digital agency. The platform coordinates deterministic operational workflows and AI-assisted tasks across prospect auditing, lead scoring, proposal drafting, client onboarding, and maintenance administration—enabling the founder to scale agency revenue without sacrificing core engineering focus.

### 1.2 Problem Statement
Solo software agency founders in Tier-2 Indian markets spend 60%–70% of their working hours on repetitive business development activities: scouring local directories, manually testing prospect websites, writing customized pitch emails, triaging messy inboxes, and handling trivial client content update requests. This fragmentation crushes engineering velocity, leads to irregular revenue cycles, and caps agency capacity at 2–3 active clients.

---

## 2. Target Users & Stakeholders

### 2.1 Internal User: Solo Founder / Operator
- **Profile:** Full-stack software engineer and agency owner.
- **Goal:** Automate client discovery, qualification, proposal drafting, and routine maintenance monitoring so that 75%+ of working time is dedicated to high-value development and architecture.
- **Key Pain Point:** Dislikes manual sales prospecting, administrative follow-ups, and being interrupted for minor website spelling changes.

### 2.2 External Buyer: Vocational & Skill-Training Institute Owner
- **Profile:** Director/Managing Director of an independent IT, coding, digital marketing, or multimedia training institute in Vijay Nagar / Palasia, Indore.
- **Goal:** Maximize student batch enrollments, stop losing ad traffic to slow-loading pages, and ensure student inquiries are instantly routed to counselors on WhatsApp.
- **Key Pain Point:** Heavy monthly spend on Google/Meta Ads (₹25,000–₹75,000/mo) with high bounce rates, broken inquiry forms, and untracked leads.

---

## 3. Business Objectives & Success Metrics

| Metric ID | Objective / Target | Target Value | Verification Window |
| :--- | :--- | :--- | :--- |
| **BM-01** | Audit Generation Velocity | <90 seconds per complete audit dossier | Milestone 2 |
| **BM-02** | Initial Website Delivery Time | <25 engineering hours per client build | Milestone 3 |
| **BM-03** | Pilot Client Conversion | Minimum 2 paying pilot clients closed | Milestone 1 (Gate Zero) |
| **BM-04** | Monthly Retainer Retention | >80% quarterly renewal rate | Month 6 Steady State |
| **BM-05** | Gross Operating Margin | >80% across all productized delivery tiers | Continuous |

---

## 4. Functional Requirements (FR)

### Module A: Permitted Prospect & Source Management
- **FR-001:** The system shall maintain an append-only `prospects` registry storing business identity, verified website URL, physical locality, source provenance, and legal processing status.
- **FR-002:** The system shall enforce a deterministic suppression list (domain, phone number, email) that immediately halts all workflow activity for opted-out, disqualified, or previously contacted entities.
- **FR-003:** The system shall strictly reject prospect inputs originating from prohibited sources (specifically Google Maps scraping or unverified third-party email dumps).

### Module B: Programmatic Website & Conversion Auditing
- **FR-004:** The system shall execute headless Core Web Vitals checks (via Google PageSpeed API) measuring mobile performance, LCP (Largest Contentful Paint), and CLS (Cumulative Layout Shift).
- **FR-005:** The system shall inspect the prospect's mobile landing page for essential conversion elements: active WhatsApp click-to-chat button, functional inquiry form, and valid SSL certificate.
- **FR-006:** The system shall compile audited metrics into a standardized, 2-page visual "Conversion & Mobile Speed Audit Dossier" formatted in clean PDF.

### Module C: Lead Scoring & Pipeline Management
- **FR-007:** The system shall compute an explainable `Lead Fit Score` (0–100) combining observed digital friction (e.g., mobile load time >4s, missing WhatsApp CTA) and commercial viability indicators.
- **FR-008:** The system shall present an internal Kanban pipeline tracking prospect status: `DISCOVERED` → `AUDITED` → `QUALIFIED` → `OUTREACH_STAGED` → `IN_DISCUSSION` → `PROPOSAL_SENT` → `WON` / `LOST` / `SUPPRESSED`.

### Module D: Proposal & Statement of Work (SOW) Generation
- **FR-009:** The system shall generate tailored proposal drafts based exclusively on approved, productized service packages (Standard "Ad-Ready Funnel" at ₹32,000 setup + ₹3,500/mo retainer).
- **FR-010:** The system shall enforce strict contractual boundary clauses in all generated proposals: maximum 2 revision rounds, 50% upfront payment milestone, explicit exclusion of custom LMS/portal development, and mandatory quarterly retainer billing.

### Module E: Client Delivery & Content Management Handoff
- **FR-011:** Upon project win (`WON`), the system shall initialize a development-ready technical brief, asset checklist, and GitHub repository template pre-configured with Next.js, Tailwind, and Supabase.
- **FR-012:** The delivery template shall include an integrated Headless CMS (e.g., Sanity / Supabase Studio) allowing client administrative staff to edit batch dates, fee announcements, and notices without code changes.

### Module F: Maintenance, Uptime & Performance Monitoring
- **FR-013:** The system shall run scheduled health checks (every 6 hours) monitoring client website HTTP status, SSL expiry date, and mobile page speed.
- **FR-014:** The system shall automatically record and compile monthly "Uptime & Performance Reports" sent to retainer clients to demonstrate ongoing retainer value.

### Module G: Operator Safety Controls & Emergency Stop
- **FR-015:** The system shall provide a global, hard-coded "Emergency Kill Switch" in the operator dashboard that immediately pauses all scheduled n8n workflows, external API triggers, and background jobs.

---

## 5. Non-Functional Requirements (NFR)

- **NFR-001 (Security):** All database tables in Supabase must have Row Level Security (RLS) enabled. External API keys must be encrypted at rest and stored in environment secrets.
- **NFR-002 (Performance):** Dashboard page loads and pipeline transitions must render in <500ms on broadband connections. Headless audit jobs must complete in <120 seconds.
- **NFR-003 (Reliability):** System workflows must incorporate automatic exponential backoff retries (maximum 3 attempts) for external API rate limits.
- **NFR-004 (Compliance):** Sourced contact data handling must strictly comply with Section 4 and Section 7 of India's DPDP Act 2023. Zero unconsented cold messaging on WhatsApp.
- **NFR-005 (Data Integrity):** Relational integrity must be enforced via foreign keys, cascading deletes on test entities, and audit logging for all status transitions.
- **NFR-006 (Usability):** Admin dashboard must be 100% responsive across desktop and tablet viewpoints, utilizing dark/light themes with accessible contrast ratios (WCAG AA).
- **NFR-007 (Maintainability):** Codebase must maintain 100% TypeScript type safety with zero `any` types in production paths.
- **NFR-008 (Cost Efficiency):** Core internal platform operating costs must not exceed $30/month across Supabase, Vercel, and LLM gateway in development and early production.

---

## 6. MVP Scope vs. Explicit Exclusions

```
+--------------------------------------------------------------------------------------------------+
| SCOPE BOUNDARY DEFINITION                                                                        |
+--------------------------------------------------+-----------------------------------------------+
| In Scope for MVP (Milestones 0–3)                | Explicitly Excluded from MVP (Deferred)       |
+--------------------------------------------------+-----------------------------------------------+
| - Manual/CSV prospect ingestion with source check| - Autonomous cold email auto-sending          |
| - Programmatic Lighthouse & WhatsApp CTA audit   | - Autonomous WhatsApp cold mass messaging     |
| - PDF Conversion Audit Dossier generator         | - Scraping Google Maps / Places API           |
| - Deterministic Lead Scoring & Kanban Pipeline   | - Multi-tenant SaaS for external agencies     |
| - Proposal & SOW generator with locked scope     | - Automated payment gateway / legal escrow    |
| - Next.js + Headless CMS starter template        | - Complex multi-agent swarms / vector DBs     |
| - Scheduled client website uptime ping & alerting| - White-label client portal mobile apps       |
| - Global emergency kill switch                   | - Full LMS / student attendance systems       |
+--------------------------------------------------+-----------------------------------------------+
```
