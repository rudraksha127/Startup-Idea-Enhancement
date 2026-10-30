# Prioritized Implementation Backlog — Autonomous Agency OS

**Backlog Status:** ACTIVE (Production Verification Complete)  
**Total Tasks Defined:** 24  
**Prioritization Tiers:** P0 (Release Blocker), P1 (High Value), P2 (Planned Enhancement), P3 (Optional)  

---

## 1. Master Task Inventory

| Task ID | Linked Req | Priority | Milestone | Title | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | `BM-03` | **P0** | M0 | Execute Manual 'Chai Test' (Close 2 Pilot Clients in Vijay Nagar) | `COMPLETED` |
| **TASK-002** | `NFR-001` | **P0** | M1 | Initialize Database DDL, Mongoose Schemas & Migrations | `COMPLETED` |
| **TASK-003** | `NFR-001` | **P0** | M1 | Configure Multi-Tenant Boundary Isolation & Policies | `COMPLETED` |
| **TASK-004** | `FR-001` | **P1** | M1 | Build Prospect Ingestion API with Source Validation | `COMPLETED` |
| **TASK-005** | `FR-002` | **P0** | M1 | Implement Deterministic Suppression List Service | `COMPLETED` |
| **TASK-006** | `FR-008` | **P1** | M1 | Build Next.js Operator Dashboard Shell & Kanban Pipeline | `COMPLETED` |
| **TASK-007** | `FR-004` | **P1** | M2 | Configure Google PageSpeed Insights Headless Audit Worker | `COMPLETED` |
| **TASK-008** | `FR-005` | **P1** | M2 | Implement DOM Conversion Element Checker (WhatsApp CTA & Forms) | `COMPLETED` |
| **TASK-009** | `FR-006` | **P1** | M2 | Build Visual PDF Conversion Audit Dossier Generator | `COMPLETED` |
| **TASK-010** | `FR-007` | **P1** | M2 | Implement Deterministic Lead Fit Scoring Engine | `COMPLETED` |
| **TASK-011** | `FR-008` | **P2** | M2 | Configure Real-Time Lead Updates & Dynamic Pollers | `COMPLETED` |
| **TASK-012** | `FR-009` | **P1** | M3 | Implement Standardized Proposal & SOW Draft Generator | `COMPLETED` |
| **TASK-013** | `FR-010` | **P0** | M3 | Embed Mandatory Contractual Scope Boundaries & Payment Clauses | `COMPLETED` |
| **TASK-014** | `FR-011` | **P1** | M3 | Develop Reusable Next.js Client Starter Template (`agency-starter-funnel`) | `COMPLETED` |
| **TASK-015** | `FR-012` | **P1** | M3 | Integrate Client Headless CMS for Batch Updates | `COMPLETED` |
| **TASK-016** | `NFR-002` | **P1** | M3 | Benchmark & Optimize Client Template Mobile PageSpeed Score (>95) | `COMPLETED` |
| **TASK-017** | `FR-013` | **P1** | M4 | Implement Scheduled Uptime & SSL Monitoring | `COMPLETED` |
| **TASK-018** | `FR-014` | **P2** | M4 | Build Monthly Client Performance & Uptime PDF Report Dispatcher | `COMPLETED` |
| **TASK-019** | `FR-015` | **P0** | M1 | Implement Global Operator Emergency Kill Switch in UI & API | `COMPLETED` |
| **TASK-020** | `NFR-007` | **P1** | M1 | Configure Strict TypeScript Types & Zod Request Validation | `COMPLETED` |
| **TASK-021** | `NFR-006` | **P2** | M1 | Apply Tailwind CSS Dark/Light Accessible Admin Theme (WCAG AA) | `COMPLETED` |
| **TASK-022** | `NFR-003` | **P1** | M2 | Implement Exponential Backoff & Retry Policies | `COMPLETED` |
| **TASK-023** | `BM-04` | **P2** | M4 | Build Retainer Subscription Lifecycle & Quarterly Billing Tracker | `COMPLETED` |
| **TASK-024** | `NFR-008` | **P1** | M4 | Implement Infrastructure Cost & Token Budget Monitor | `COMPLETED` |

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

### TASK-002: Initialize Database DDL, Mongoose Schemas & Migrations
- **Objective:** Apply production-ready schema migrations creating `prospects`/`leads`, `audits`, `clients`, `projects`, `invoices`, `templates`, `suppression_list`, `agent_executions`, and `audit_logs`.
- **Linked Requirement:** `NFR-001`, `FR-001` | **Priority:** `P0` | **Owner:** Database Engineer / Founder
- **Acceptance Criteria:**
  1. All 12 collections created with appropriate data types, constraints, and ObjectId references.
  2. Mongoose schemas enforce referential integrity with cascade rules.
  3. Migration and seed scripts run idempotently.
- **Verification:** Vitest test suites passing across all models and services.

### TASK-005: Implement Deterministic Suppression List Service
- **Objective:** Prevent accidental outreach or contact with blacklisted, opted-out, or prohibited domains and phone numbers.
- **Linked Requirement:** `FR-002` | **Priority:** `P0` | **Owner:** Backend Engineer / Founder
- **Acceptance Criteria:**
  1. Querying suppression takes <5ms via indexed domain/phone lookup.
  2. Any ingestion or audit attempt matching a suppressed entity is blocked with `409 Conflict`.
  3. Hard block on adding Google Maps scraping sources per Google TOS 3.2.3.
- **Verification:** Passing across edge cases (case insensitivity, subdomains, phone formats).

### TASK-019: Implement Global Operator Emergency Kill Switch
- **Objective:** Provide a fail-safe mechanism in UI and backend to immediately halt all background workflows.
- **Linked Requirement:** `FR-015` | **Priority:** `P0` | **Owner:** Principal Architect / Founder
- **Acceptance Criteria:**
  1. Prominent toggle switch on operator dashboard header / settings.
  2. Changing switch updates `settings.dryRunMode` and halts live dispatches atomically.
  3. All outbound connectors default to dry-run simulation mode.
- **Verification:** Passing test suite; all dispatched emails safely logged with zero external spam risk.
