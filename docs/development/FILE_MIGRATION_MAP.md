# AgencyOS File Migration & Retention Map

**Date:** 29 October 2026  
**Status:** Canonical File Mapping  
**Objective:** Maintain complete traceability of all repository additions, moves, and retained paths.

---

## 1. Architectural Strategy: Preserved Core with Extended Modules

AgencyOS uses a single-repo full-stack Next.js 15 App Router architecture. To guarantee zero regressions in route discovery, TypeScript compilation, server component rendering, and API route handlers, the core application files are intentionally preserved in `src/`. External modules (`database/`, `workflows/`, `assets/`, `infra/`, `.github/`, and `docs/`) provide portable, standardized operational layers around this core.

---

## 2. Detailed Mapping Table

| File / Directory | Action | Reason | Affected References | Validation Performed |
|---|---|---|---|---|
| `src/app/` | **Retained** | Next.js 15 App Router route definitions (29 routes) | All frontend routes & backend APIs | `npm run build` (29 routes compiled) |
| `src/features/` | **Retained** | Domain-driven UI components & business views | `dashboard`, `leads`, `projects`, `landing` | `npm run typecheck` & `npm run test` |
| `src/models/` | **Retained** | Mongoose ORM schemas for MongoDB/PostgreSQL | All database queries & seed scripts | `validations.test.ts` (pass) |
| `src/lib/` | **Retained** | Database singleton, auth, providers, utilities | Application-wide shared functions | `auth.test.ts` (pass) |
| `assets/readme/agencyos-banner.svg` | **Created** | Professional SVG visual banner for root README | `README.md` | Markdown image render check |
| `database/README.md` | **Created** | Dedicated database setup and schema guide | `docs/database/DATABASE_SCHEMA.md` | Link verification |
| `database/schema/` | **Created** | Portable JSON/TS entity definitions for external consumers | External data tools | Schema syntax check |
| `database/seeds/` | **Created** | Portable seed fixtures for Indian SMBs | Database seeding scripts | Structure check |
| `workflows/n8n/README.md` | **Created** | Documentation for n8n workflow integration | `docs/workflows/N8N_WORKFLOW_CATALOG.md` | Link check |
| `workflows/n8n/research/` | **Created** | Workflow specs for business discovery & audit | Outreach & research pipelines | Spec validation |
| `infra/docker/Dockerfile` | **Created** | Multi-stage production container definition | CI/CD & local deployment | Dockerfile syntax audit |
| `infra/docker-compose.yml` | **Created** | Multi-container orchestration (AgencyOS + MongoDB) | Local setup docs | Compose YAML check |
| `.github/workflows/ci.yml` | **Created** | Automated CI pipeline (lint, typecheck, test, build) | Repository pull requests | Action YAML validation |
| `.github/pull_request_template.md` | **Created** | Quality checklist for team and AI contributions | Pull request workflow | Template format check |
| `.github/ISSUE_TEMPLATE/` | **Created** | Standardized bug report & feature request forms | GitHub Issues | Markdown format check |
| `CONTRIBUTING.md` | **Created** | Engineering guidelines and coding standards | Root repository | Markdown check |
| `SECURITY.md` | **Created** | Responsible disclosure and safety policies | Root repository | Policy check |
| `LICENSE` | **Created** | MIT Open Source license | Root repository | Legal standard check |
| `docs/product/*` | **Created/Reconciled** | 5 authoritative product requirement documents | PRD, vision, roadmap, workflows | Internal link verification |
| `docs/architecture/*` | **Created/Reconciled** | 4 system and integration architecture documents | Architecture decision records | Mermaid diagram rendering |
| `docs/api/API_REFERENCE.md` | **Created** | Full REST contract for 15 endpoints | API specification | Route handler matching |
| `docs/ai-agents/AGENT_CATALOG.md` | **Created** | 5 agent specifications, prompts, and tools | AI agents module | Model parameter check |
| `docs/workflows/N8N_WORKFLOW_CATALOG.md` | **Created** | Workflow specifications, triggers, and retries | Workflows directory | Ingest schema matching |
| `docs/security/*` | **Created** | Threat model, checklist, and regulatory compliance | Security policy | DPDP & TOS compliance check |
| `docs/operations/*` | **Created** | Monitoring, backup, recovery, and incident guides | Operations directory | Runbook review |
| `docs/testing/TEST_STRATEGY.md` | **Created** | Comprehensive test pyramid & release gate guide | Vitest & Playwright suites | Test runner verification |
| `README.md` | **Redesigned** | Master B2B SaaS presentation README | Entire repository | Full markdown & visual audit |

---

## 3. Retained Paths Rationale

- **`src/app/(dashboard)/` and `src/app/api/`:** Maintained in unified App Router rather than split into `apps/web` and `apps/api` to prevent monorepo tooling overhead and avoid breaking Next.js 15 Server Action / Route Handler paradigms.
- **`public/assets/`:** Maintained at project root as expected by Next.js static asset optimization (`next/image`).
- **`tests/`:** Maintained at project root as expected by `vitest.config.ts` and `playwright.config.ts`.

