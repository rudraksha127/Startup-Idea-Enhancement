# Prioritized Implementation Backlog — Autonomous Agency OS

**Backlog Status:** PROPOSED (Awaiting Gate 5 Planning Approval)  
**Total Tasks Defined:** 24  
**Prioritization Tiers:** P0 (Release Blocker), P1 (High Value), P2 (Planned Enhancement), P3 (Optional)  

---

## 1. Master Task Inventory

| Task ID | Linked Req | Priority | Milestone | Title | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | `BM-03` | **P0** | M0 | Execute Manual 'Chai Test' (Close 2 Pilot Clients in Vijay Nagar) | `READY` |
| **TASK-002** | `NFR-001` | **P0** | M1 | Initialize Supabase PostgreSQL DDL & Migrations | `PROPOSED` |
| **TASK-003** | `NFR-001` | **P0** | M1 | Configure Row Level Security (RLS) & Policies on All Tables | `PROPOSED` |
| **TASK-004** | `FR-001` | **P1** | M1 | Build Prospect Ingestion API with Source Validation | `PROPOSED` |
| **TASK-005** | `FR-002` | **P0** | M1 | Implement Deterministic Suppression List Service | `PROPOSED` |
| **TASK-006** | `FR-008` | **P1** | M1 | Build Next.js Operator Dashboard Shell & Kanban Pipeline | `PROPOSED` |
| **TASK-007** | `FR-004` | **P1** | M2 | Configure Google PageSpeed Insights Headless Audit Worker | `PROPOSED` |
| **TASK-008** | `FR-005` | **P1** | M2 | Implement DOM Conversion Element Checker (WhatsApp CTA & Forms) | `PROPOSED` |
| **TASK-009** | `FR-006` | **P1** | M2 | Build Visual PDF Conversion Audit Dossier Generator | `PROPOSED` |
| **TASK-010** | `FR-007` | **P1** | M2 | Implement Deterministic Lead Fit Scoring Engine | `PROPOSED` |
| **TASK-011** | `FR-008` | **P2** | M2 | Configure Supabase Real-Time Subscriptions for Audit Status Updates | `PROPOSED` |
| **TASK-012** | `FR-009` | **P1** | M3 | Implement Standardized Proposal & SOW Draft Generator | `PROPOSED` |
| **TASK-013** | `FR-010` | **P0** | M3 | Embed Mandatory Contractual Scope Boundaries & Payment Clauses | `PROPOSED` |
| **TASK-014** | `FR-011` | **P1** | M3 | Develop Reusable Next.js Client Starter Template (`agency-starter-funnel`) | `PROPOSED` |
| **TASK-015** | `FR-012` | **P1** | M3 | Integrate Client Headless CMS (Sanity / Supabase) for Batch Updates | `PROPOSED` |
| **TASK-016** | `NFR-002` | **P1** | M3 | Benchmark & Optimize Client Template Mobile PageSpeed Score (>95) | `PROPOSED` |
| **TASK-017** | `FR-013` | **P1** | M4 | Implement Scheduled 6-Hour Uptime & SSL Monitoring in n8n | `PROPOSED` |
| **TASK-018** | `FR-014` | **P2** | M4 | Build Monthly Client Performance & Uptime PDF Report Dispatcher | `PROPOSED` |
| **TASK-019** | `FR-015` | **P0** | M1 | Implement Global Operator Emergency Kill Switch in UI & API | `PROPOSED` |
| **TASK-020** | `NFR-007` | **P1** | M1 | Configure Strict TypeScript Types & Zod Request Validation | `PROPOSED` |
| **TASK-021** | `NFR-006` | **P2** | M1 | Apply Tailwind CSS Dark/Light Accessible Admin Theme (WCAG AA) | `PROPOSED` |
| **TASK-022** | `NFR-003` | **P1** | M2 | Implement Exponential Backoff & Retry Policies in n8n Workflows | `PROPOSED` |
| **TASK-023** | `BM-04` | **P2** | M4 | Build Retainer Subscription Lifecycle & Quarterly Billing Tracker | `PROPOSED` |
| **TASK-024** | `NFR-008` | **P1** | M4 | Implement Infrastructure Cost & Token Budget Monitor | `PROPOSED` |

---

## 2. Detailed Task Specifications (Milestone 0 & Milestone 1 Samples)

### TASK-001: Execute Manual 'Chai Test' (Close 2 Pilot Clients in Vijay Nagar)
- **Objective:** Manually validate local customer willingness to pay ₹25,000–₹32,000 for an Ad-Ready Student Funnel before developing the internal OS.
- **Linked Requirement:** `BM-03` | **Priority:** `P0` | **Owner:** Solo Founder
- **Acceptance Criteria:**
  1. Complete manual PageSpeed and mobile audits for 5 Vijay Nagar IT/coding institutes.
  2. Conduct in-person discovery meetings with at least 3 institute directors.
  3. Secure signed proposals and minimum 50% advance deposits from at least 2 institutes.
  4. Document friction points and exact objections for OS design refinement.
- **Verification:** Bank statement reflecting advance deposit + signed SOW agreements.

### TASK-002: Initialize Supabase PostgreSQL DDL & Migrations
- **Objective:** Apply production-ready schema migrations creating `prospects`, `audits`, `clients`, `projects`, `amc_subscriptions`, `suppression_list`, and `audit_logs`.
- **Linked Requirement:** `NFR-001`, `FR-001` | **Priority:** `P0` | **Owner:** Database Engineer / Founder
- **Acceptance Criteria:**
  1. All 8 tables created with appropriate data types, constraints, and UUID primary keys.
  2. Foreign keys enforce referential integrity with cascade rules.
  3. Migration script runs idempotently via Supabase CLI (`supabase db reset`).
- **Verification:** `TEST-INT-001` passing against local PostgreSQL container.

### TASK-005: Implement Deterministic Suppression List Service
- **Objective:** Prevent accidental outreach or contact with blacklisted, opted-out, or prohibited domains and phone numbers.
- **Linked Requirement:** `FR-002` | **Priority:** `P0` | **Owner:** Backend Engineer / Founder
- **Acceptance Criteria:**
  1. Querying `suppression_list` takes <5ms via indexed domain/phone lookup.
  2. Any ingestion or audit attempt matching a suppressed entity is blocked with `409 Conflict`.
  3. Hard block on adding Google Maps scraping sources.
- **Verification:** `TEST-UNIT-003` passing across edge cases (case insensitivity, subdomains, phone formats).

### TASK-019: Implement Global Operator Emergency Kill Switch
- **Objective:** Provide a fail-safe mechanism in UI and backend to immediately halt all background workflows.
- **Linked Requirement:** `FR-015` | **Priority:** `P0` | **Owner:** Principal Architect / Founder
- **Acceptance Criteria:**
  1. Prominent toggle switch on operator dashboard header.
  2. Changing switch updates `system_settings.emergency_kill_switch` atomically.
  3. n8n workflows check this flag as node #1; terminate immediately if active.
- **Verification:** `TEST-UNIT-014` passing: queued jobs immediately abort when switch is flipped.
