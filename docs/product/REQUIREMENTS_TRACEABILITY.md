# Requirements Traceability Matrix (RTM)

This matrix establishes formal traceability between Functional / Non-Functional Requirements, implementation tasks, test specifications, and release milestones.

---

## 1. Functional Requirements Traceability

| Requirement ID | Description | Linked Task ID | Verification Test ID | Target Milestone | Release Gate |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Prospect registry with provenance | `TASK-004` | `TEST-INT-001` | Milestone 2 | Gate B |
| **FR-002** | Deterministic suppression enforcement | `TASK-005` | `TEST-UNIT-003` | Milestone 2 | Gate C |
| **FR-003** | Prohibition of banned sources (Google Maps) | `TASK-004` | `TEST-UNIT-004` | Milestone 2 | Gate C |
| **FR-004** | Headless Core Web Vitals checks | `TASK-007` | `TEST-INT-005` | Milestone 2 | Gate B |
| **FR-005** | DOM inspection for WhatsApp CTA & forms | `TASK-008` | `TEST-UNIT-006` | Milestone 2 | Gate B |
| **FR-006** | Visual PDF Conversion Audit generator | `TASK-009` | `TEST-INT-007` | Milestone 2 | Gate A |
| **FR-007** | Deterministic Lead Fit Score calculation | `TASK-010` | `TEST-UNIT-008` | Milestone 2 | Gate B |
| **FR-008** | Kanban pipeline & state machine | `TASK-006` | `TEST-E2E-002` | Milestone 2 | Gate A |
| **FR-009** | Standardized proposal & SOW generator | `TASK-012` | `TEST-UNIT-009` | Milestone 3 | Gate A |
| **FR-010** | Contractual scope boundary enforcement | `TASK-012` | `TEST-UNIT-010` | Milestone 3 | Gate G |
| **FR-011** | Automated repo template initialization | `TASK-014` | `TEST-INT-011` | Milestone 3 | Gate B |
| **FR-012** | Headless CMS client self-service boundary | `TASK-015` | `TEST-E2E-004` | Milestone 3 | Gate A |
| **FR-013** | Scheduled 6-hour uptime & SSL ping | `TASK-017` | `TEST-INT-012` | Milestone 4 | Gate E |
| **FR-014** | Monthly client uptime & speed reporting | `TASK-018` | `TEST-INT-013` | Milestone 4 | Gate G |
| **FR-015** | Global operator emergency kill switch | `TASK-019` | `TEST-UNIT-014` | Milestone 2 | Gate C |

---

## 2. Non-Functional Requirements Traceability

| Requirement ID | Constraint Description | Implementation Mechanism | Verification Test ID | Gate |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-001** | Row Level Security (RLS) on all tables | Supabase Postgres RLS policies | `TEST-SEC-001` | Gate C |
| **NFR-002** | Dashboard render <500ms, audit <120s | Next.js Server Components, async jobs | `TEST-PERF-001` | Gate H |
| **NFR-003** | Exponential backoff for external APIs | n8n retry configuration, resilient fetchers | `TEST-RES-001` | Gate B |
| **NFR-004** | DPDP Act 2023 compliance | Zero cold scraping, consent check | `TEST-SEC-002` | Gate C |
| **NFR-005** | Relational integrity & audit trail | PostgreSQL foreign keys, trigger audit log | `TEST-INT-002` | Gate B |
| **NFR-006** | Responsive & accessible UI (WCAG AA) | Tailwind CSS tokens, semantic HTML5 | `TEST-E2E-001` | Gate A |
| **NFR-007** | Strict TypeScript type safety (zero `any`) | `tsconfig.json` strict mode, Zod validation | `TEST-LINT-001` | Gate B |
| **NFR-008** | Operating costs <$30/mo | Free/Hobby tier Supabase, Vercel, n8n self-host | `TEST-FIN-001` | Gate G |
