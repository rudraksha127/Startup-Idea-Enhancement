# AgencyOS Repository Audit

**Date:** 29 October 2026  
**Auditor:** Principal Software Architect & DevOps Engineer  
**Status:** Canonical Repository Assessment  
**Commit/State:** Phase 6 SaaS Migration Complete  

---

## 1. Existing Architecture

AgencyOS is architectured as a unified, full-stack B2B SaaS web application using the **Next.js 15 App Router** paradigm. It implements a layered architecture:
- **Presentation Layer (`src/app/`, `src/features/`, `src/components/`):** React 19 Server and Client Components styled with Tailwind CSS, Lucide icons, and Recharts. Organized into route groups:
  - `(marketing)`: Public unauthenticated landing page (`/`).
  - `(auth)`: Login (`/login`) and Registration (`/register`).
  - `(dashboard)`: 11 authenticated modules (`/dashboard`, `/leads`, `/map-explorer`, `/ai-agents`, `/outreach`, `/clients`, `/projects`, `/templates`, `/analytics`, `/billing`, `/settings`) with a persistent navigation shell (`app-sidebar.tsx`).
- **API & Backend Layer (`src/app/api/`):** 15 Edge and Node-compatible Next.js Route Handlers implementing authenticated REST endpoints with strict Zod payload validation and standardized JSON error structures.
- **Domain & Data Access Layer (`src/models/`, `src/lib/db/`):** Mongoose (PostgreSQL/MongoDB compatible schemas) with singleton connection caching in `src/lib/db/mongodb.ts`. Enforces multi-tenant organizational isolation (`orgId`).
- **Security & Authorization Layer (`src/lib/auth/`):** JSON Web Token (JWT) stateless auth using `bcryptjs` for password hashing and secure HTTP cookies.

---

## 2. Detected Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `15.1.4` | Full-stack React framework |
| **Language** | TypeScript (Strict mode) | `5.7.2` | Type-safety, noImplicitAny, strictNullChecks |
| **UI Library** | React & React DOM | `19.0.0` | Concurrent rendering & Server Components |
| **Styling** | Tailwind CSS & PostCSS | `3.4.17` | Utility-first responsive design tokens |
| **Data Viz** | Recharts | `2.15.0` | Line, Bar, Pie, Area, and Donut charts |
| **Icons** | Lucide React | `0.468.0` | B2B SaaS iconography |
| **Database ORM** | Mongoose | `8.9.3` | Object-document modeling & schema constraints |
| **Validation** | Zod | `3.24.1` | Deterministic schema validation for API requests |
| **Authentication** | JWT (`jsonwebtoken`) & `bcryptjs` | `9.0.7` / `2.4.6` | Stateless token auth & secure salted hashing |
| **Unit Testing** | Vitest & JSDOM | `2.1.8` / `25.0.1` | Fast Vite-based unit and component test runner |
| **E2E Testing** | Playwright Test | `1.49.1` | Browser end-to-end integration automation |
| **Data Ingest** | PapaParse | `5.4.1` | CSV parsing and serialization |

---

## 3. Current Directory Structure

```text
AgencyOS/
├── .env.example                       # Canonical template for environment configuration
├── .env.local                         # Local test environment overrides
├── .gitignore                         # Git exclusion rules
├── AGENTS.md                          # Mandatory agent guidelines and invariants
├── CHANGELOG.md                       # Release and version history
├── package.json                       # Manifest with dependencies and npm run scripts
├── playwright.config.ts               # End-to-end test configuration
├── postcss.config.mjs                 # PostCSS plugin definitions
├── PROJECT_MASTER_BRIEF.md            # Comprehensive original product brief
├── README.md                          # Main project documentation
├── tailwind.config.ts                 # Design tokens, colors (#F8F6F0, #171918, #3568E8)
├── tsconfig.json                      # Strict TypeScript compiler options
├── vitest.config.ts                   # Unit and component test setup
├── docs/                              # Project documentation
│   ├── architecture/                  # API specifications, database design, system architecture, ADRs
│   ├── engineering/                   # Coding standards, security, test strategy
│   ├── execution/                     # Real-time status tracker (CURRENT_STATUS.md)
│   ├── expert-reviews/                # Security, engineering, and executive pre-mortems
│   ├── operations/                    # Deployment, environment, local setup
│   ├── planning/                      # Backlog, risks, roadmap
│   ├── product/                       # PRD, requirements traceability, user flows
│   └── release/                       # Production readiness checklist
├── public/                            # Static media and mock assets
│   └── assets/                        # Hero images, business photos, templates
├── research/                          # Market research on Indore & Indian SMBs
├── src/                               # Application source code
│   ├── app/                           # App router pages, layouts, and API routes
│   │   ├── (auth)/                    # /login and /register
│   │   ├── (dashboard)/               # 11 dashboard views
│   │   ├── (marketing)/               # / landing page
│   │   ├── api/                       # 15 backend route handlers
│   │   ├── globals.css                # Tailwind base styles and CSS variables
│   │   └── layout.tsx                 # Root HTML shell
│   ├── components/                    # Cross-cutting UI components (e.g. app-sidebar)
│   ├── features/                      # Domain feature modules (dashboard, leads, projects)
│   ├── lib/                           # Core utilities (auth, db, seed, validations)
│   └── models/                        # Mongoose schemas (User, Lead, Project, AgentConfig, etc.)
└── tests/                             # Automated test suites
    ├── e2e/                           # Playwright specs (agencyos.spec.ts)
    └── unit/                          # Vitest specs (auth, components, validations)
```

---

## 4. Entry Points and Execution Commands

- **Web Development Server:** `npm run dev` (Runs Next.js at `http://localhost:3000`)
- **Production Build:** `npm run build` (Compiles all 29 static and dynamic routes)
- **Production Server:** `npm start` (Serves compiled Next.js output)
- **Type Checking:** `npm run typecheck` (`tsc --noEmit` in strict mode)
- **Unit & Integration Tests:** `npm run test` (Executes 11 Vitest unit tests)
- **E2E Browser Tests:** `npm run test:e2e` (Executes Playwright tests against running server)
- **Database Seeding:** `npm run seed` (`tsx src/lib/seed/seed-data.ts`)

---

## 5. Database and Migration Setup

- **Database Engine:** MongoDB 6.0+ (Mongoose ODM). Can also be served by Azure Cosmos DB for MongoDB or AWS DocumentDB.
- **Connection Management:** Cached client singleton with pooling (`src/lib/db/mongodb.ts`).
- **Core Entities (`src/models/`):**
  1. `Organization`: Multi-tenant boundary with subscription status and credit allocations.
  2. `User`: Account records, bcrypt password hashes, roles (`founder`, `developer`, `growth_specialist`).
  3. `Lead`: Discovered business opportunities, 6 performance scores, outreach status, contact info.
  4. `LeadNote`: Internal team comments and AI research summaries.
  5. `Project`: Website development deliverables, milestones, budgets, assignees.
  6. `AgentConfig`: Autonomous agent prompts, execution schedules, model choices, temperature, and tokens.
  7. `OutreachMessage`: Multi-step email and WhatsApp sequence messages.
- **Seeding Pipeline:** `src/lib/seed/seed-data.ts` loads 27 verified Indian SMB leads (Indore, Jaipur, Delhi), 4 agents, 3 projects, and an admin user into MongoDB.

---

## 6. External Services and Integrations

- **AI Model Providers:** Pluggable gateway in `src/lib/providers/ai-service.ts`:
  - Primary: Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`)
  - Secondary/Fallback: OpenAI (`gpt-4o`, `gpt-4o-mini`)
  - Fallback Mode: Deterministic mock engine when keys are omitted.
- **Email Dispatch:** Resend API integration (`src/lib/providers/email-service.ts`) with default `dry_run = true`.
- **Map & Geocoding:** Google Maps / Places API provider (`src/lib/providers/maps-service.ts`) adhering strictly to Section 3.2.3 of Google Maps TOS.
- **Workflow Automation:** Ready for n8n webhook ingest (`/api/leads`, `/api/agents`).

---

## 7. Existing Tests and Build Checks

- **TypeScript Compiler (`tsc`):** Strict mode enabled (`noImplicitAny: true`, `strictNullChecks: true`). 0 errors.
- **Unit Tests (`vitest`):**
  - `validations.test.ts`: Zod schema validation for leads, users, and projects (5 tests).
  - `auth.test.ts`: JWT token generation, verification, and bcrypt hashing (3 tests).
  - `components.test.tsx`: Render tests for metric cards and UI components (3 tests).
  - Result: **11/11 tests pass in ~1.9s.**
- **Production Build (`next build`):**
  - 29 routes total (10 public/marketing/auth/dashboard pages + 15 API routes + error handling).
  - Result: **Compiled successfully in ~3.5s.**

---

## 8. Current Deployment Configuration

- **Host Target:** Vercel, Railway, AWS ECS, or Docker container.
- **Containerization:** Ready for standard Alpine Node 20 Docker image.
- **Stateless Design:** No local filesystem session state; auth relies on JWT tokens and database persistence.
- **Environment Management:** Driven by `.env.example` and validated via Zod schema.

---

## 9. Technical Debt and Structural Inconsistencies

1. **Folder Separation:** The project is a unified Next.js 15 App Router app. Earlier documentation referenced a standalone `apps/web` and `apps/api` monorepo or Supabase PostgreSQL, whereas the actual working code uses Next.js Route Handlers and Mongoose.
2. **Missing Standard Directories:**
   - No `database/` directory for raw schema definitions, seed dumps, and documentation.
   - No `workflows/n8n/` directory for exportable workflow JSON templates.
   - No `assets/readme/` folder for visual README assets (SVG banner, architecture diagrams).
   - No `.github/` workflows for CI/CD automation.
3. **Documentation Fragmentation:** Documentation in `docs/` is extensive but contains pre-migration references to Supabase that should be reconciled with the implemented Next.js + MongoDB architecture.

---

## 10. Risks, Constraints and Missing Information

- **Safe Restructuring Invariant:** Splitting the app into a multi-package monorepo (`apps/web` + `apps/api`) at this time carries high regression risk and breaks working Next.js App Router route handlers. The safe, low-risk approach is to retain the unified `src/` Next.js 15 core while establishing external support directories (`database/`, `workflows/n8n/`, `assets/readme/`, `.github/`, `infra/`).
- **Data Safety:** Never export live MongoDB collections or secrets into git.
- **Source Restrictions:** Adherence to TRAI and DPDP 2023 regulations remains mandatory.

