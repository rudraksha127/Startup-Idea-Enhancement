# AgencyOS Repository Reorganization Plan

**Date:** 29 October 2026  
**Status:** Approved & Staged Execution  
**Scope:** Structural Organization, Documentation Architecture, and Developer Experience (DX)  

---

## 1. Executive Summary & Architectural Invariant

The current AgencyOS implementation is a fully functioning, production-compiled **Next.js 15 App Router** application with 29 routes, 11/11 passing tests, and zero TypeScript errors.

### Core Non-Negotiable Invariant
> **Do not split a working application into multiple deployable services or monorepo packages unless required by architecture.**
> Next.js App Router integrates frontend server/client components with backend route handlers (`src/app/api/`) seamlessly. Moving files blindly into `apps/web` and `apps/api` would break Next.js route discovery, invalidate relative imports, break path aliases (`@/*`), and risk breaking production builds.

### Reorganization Strategy: "Clean Core with Extended Modules"
1. **Preserve Application Core (`src/`):** Maintain the unified Next.js 15 structure with `app/`, `components/`, `features/`, `lib/`, and `models/`.
2. **Establish External Support Directories:**
   - `database/`: Portable JSON/TS schemas, seed fixtures, collection indexes, and database README.
   - `workflows/n8n/`: Modular n8n workflow definitions across research, outreach, marketing, and operations.
   - `assets/readme/`: SVG banners, architecture diagrams, and screenshot references for documentation.
   - `infra/`: Docker, Docker Compose, and deployment configuration.
   - `.github/`: Issue templates, PR templates, and GitHub Actions CI workflow.
3. **Canonical Documentation Suite (`docs/`):** Consolidate, reconcile, and author authoritative product, architecture, security, operations, and development docs.
4. **Professional Root Presentation (`README.md`):** Redesign root README with SVG banner, interactive architecture diagrams, implementation status matrix, and complete local-to-production guides.

---

## 2. Target Directory Structure

```text
AgencyOS/
├── .github/                           # GitHub community & CI automation
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── ci.yml                     # Typecheck, test, and build CI
│   └── pull_request_template.md
│
├── assets/                            # Documentation & presentation assets
│   └── readme/
│       ├── agencyos-banner.svg        # Polished SVG banner
│       └── architecture-flow.svg      # Visual architecture overview
│
├── database/                          # Portable database specifications & seeds
│   ├── README.md                      # Database setup and schema documentation
│   ├── schema/                        # TypeScript & JSON schema definitions
│   └── seeds/                         # Sanitized mock seed datasets
│
├── infra/                             # Infrastructure as code & containerization
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── .dockerignore
│   └── docker-compose.yml             # Local MongoDB + AgencyOS orchestration
│
├── workflows/                         # Workflow automation templates
│   └── n8n/
│       ├── README.md                  # Workflow import and configuration guide
│       ├── research/                  # Business discovery & audit workflows
│       ├── outreach/                  # Multi-step sequence workflows
│       └── delivery/                  # Client onboarding & project setup
│
├── docs/                              # Comprehensive documentation library
│   ├── product/                       # Vision, requirements, feature inventory, workflows, roadmap
│   ├── architecture/                  # System, data flow, security, integration architecture
│   ├── database/                      # Schema specifications and data models
│   ├── api/                           # REST API reference and contracts
│   ├── ai-agents/                     # Autonomous agent catalog and prompts
│   ├── workflows/                     # n8n catalog and event triggers
│   ├── development/                   # Audit, reorganization plan, migration map, local setup
│   ├── security/                      # Threat models, checklist, DPDP & TOS compliance
│   ├── operations/                    # Monitoring, backup, recovery, incidents
│   ├── testing/                       # Test strategy and test matrix
│   └── decisions/                     # Architecture Decision Records (ADRs)
│
├── src/                               # Application source code (Next.js 15 App Router)
│   ├── app/                           # App router routes & API handlers
│   ├── components/                    # Cross-cutting UI components
│   ├── features/                      # Domain feature modules
│   ├── lib/                           # Core utilities, db, providers, auth
│   └── models/                        # Mongoose schemas
│
├── tests/                             # Automated tests
│   ├── unit/                          # Vitest unit & component specs
│   └── e2e/                           # Playwright browser specs
│
├── .env.example                       # Verified environment template
├── .gitignore                         # Comprehensive git exclusions
├── CONTRIBUTING.md                    # Engineering contribution guide
├── SECURITY.md                        # Responsible disclosure policy
├── CHANGELOG.md                       # Version history
├── LICENSE                            # MIT License
├── package.json                       # Scripts and dependencies
├── tailwind.config.ts                 # Design tokens
├── tsconfig.json                      # Strict TypeScript configuration
└── README.md                          # Master developer README
```

---

## 3. File Migration & Creation Mapping

| Source / Action | Target Location | Description & Safety Status |
|---|---|---|
| **Create** | `assets/readme/agencyos-banner.svg` | Modern branded SVG hero banner for README |
| **Create** | `database/README.md` | Database architecture and setup instructions |
| **Create** | `database/schema/` | Entity schemas mirror for external tools |
| **Create** | `database/seeds/` | Standalone seed fixtures (Indore SMBs) |
| **Create** | `workflows/n8n/README.md` | n8n orchestration guide |
| **Create** | `workflows/n8n/research/` | Lead research workflow specification |
| **Create** | `infra/docker/Dockerfile` | Production Node 20 Alpine Dockerfile |
| **Create** | `infra/docker-compose.yml` | Multi-container setup (AgencyOS + MongoDB) |
| **Create** | `.github/workflows/ci.yml` | GitHub Actions CI for `typecheck`, `test`, `build` |
| **Create** | `.github/pull_request_template.md` | Engineering PR checklist |
| **Create** | `CONTRIBUTING.md` | Contributor and style guidelines |
| **Create** | `SECURITY.md` | Vulnerability reporting and policy |
| **Create** | `LICENSE` | MIT Open Source license |
| **Author** | `docs/product/*` | 5 complete product documents |
| **Author** | `docs/architecture/*` | 4 complete technical architecture documents |
| **Author** | `docs/api/API_REFERENCE.md` | Full REST API reference for 15 endpoints |
| **Author** | `docs/ai-agents/AGENT_CATALOG.md` | 5 agent specifications |
| **Author** | `docs/workflows/N8N_WORKFLOW_CATALOG.md` | Workflow specifications |
| **Author** | `docs/development/*` | Setup, dev guide, audit, migration map |
| **Author** | `docs/security/*` | Threat model, checklist, compliance |
| **Author** | `docs/operations/*` | Monitoring, backup, recovery, incident response |
| **Author** | `docs/testing/TEST_STRATEGY.md` | Test strategy and release gates |
| **Author** | `docs/decisions/ARCHITECTURE_DECISIONS.md` | ADR index and rationale |
| **Redesign** | `README.md` | High-fidelity master project README |

---

## 4. Verification & Validation Steps

1. **Continuous Code Integrity:** No edits to working application runtime logic during documentation setup.
2. **Typecheck Gate:** Run `npm run typecheck` after every batch.
3. **Test Gate:** Run `npm run test` (Vitest) to ensure 100% passing tests.
4. **Build Gate:** Run `npm run build` to confirm Next.js compiles all 29 routes without errors.
5. **Link & Asset Verification:** Verify all relative markdown links and image references.

---

## 5. Rollback Strategy

All changes are additive documentation, assets, and standard repository scaffolding. In the unlikely event of any issue, git tracking allows instant, atomic rollback of any file using `git checkout` or `git reset` without affecting database state or application code.

