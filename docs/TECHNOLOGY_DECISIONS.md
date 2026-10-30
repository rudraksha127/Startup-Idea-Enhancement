# AgencyOS — Technology Decisions & Architectural Rationales

**Document Version:** 1.0.0  
**Status:** Canonical ADR Compendium  
**Published:** 30 October 2026  

---

## 1. Context & Architecture Overview

AgencyOS is an AI-powered SaaS operating system designed to run high-volume agency workflows. Technical decisions were driven by five criteria:
1. **Developer Productivity & Maintainability:** Unified TypeScript type safety across frontend and backend.
2. **Deterministic Reliability:** Deterministic validation (Zod, Mongoose) isolating LLM outputs.
3. **Execution Performance:** Sub-second API response times and rapid static page generation.
4. **Compliance & Security:** DPDP Act 2023, Google Maps Platform TOS, and OWASP Top 10 hardening.
5. **Operational Simplicity:** Low-overhead self-hosting or managed deployment via Docker / Cloudflare / Vercel.

---

## 2. Key Architecture Decision Records (ADRs)

### ADR-001: Next.js 15 (App Router) for Dashboard & Public UI
* **Decision:** Use Next.js 15 with React 19 for the frontend application.
* **Alternatives Evaluated:** Vite + React SPA, Remix / React Router v7, Nuxt.js.
* **Why Chosen:** Next.js App Router provides built-in React Server Components (RSC), optimized static page generation (SSG) for public marketing routes, streaming SSR for dashboard charts, and native route handlers.
* **Trade-Offs & Limitations:** Strict hydration requirements and async request header handling (`await headers()`) require disciplined component architecture.
* **Connection to AgencyOS:** Allows the founder to inspect marketing templates, lead radars, and financial analytics with zero client-side bundle bloat.

### ADR-002: Express 5 for Central REST API Backend
* **Decision:** Use Express 5.3+ for the central modular REST API backend under `backend/`.
* **Alternatives Evaluated:** Fastify, NestJS, Pure Next.js API Routes.
* **Why Chosen:** Express 5 provides native asynchronous error handling without cumbersome `try/catch` wrappers. Separating the backend from Next.js allows independent scaling, deployment to containerized runtimes (Zoho Catalyst, Docker, AWS ECS), and isolation of long-running agent workflows from Next.js serverless timeouts.
* **Trade-Offs & Limitations:** Requires explicit CORS and middleware configuration compared to monolith frameworks like NestJS.
* **Connection to AgencyOS:** 16+ plug-and-play modular domains (`/api/v1/*`) with dedicated controllers, routes, and services.

### ADR-003: MongoDB with Mongoose for Data Persistence
* **Decision:** Use MongoDB 8.0+ with Mongoose 8.9+ as the primary transactional and document store.
* **Alternatives Evaluated:** PostgreSQL (with Prisma), Supabase, DynamoDB.
* **Why Chosen:** Agency leads and website audits contain highly variable, deeply nested semi-structured data (Lighthouse metrics, detected CMS plugins, SEO audit issues, outreach interaction histories). MongoDB document model natively represents these polymorphic structures without complex relational join tables. Compound unique indexes provide strict multi-tenant boundaries.
* **Trade-Offs & Limitations:** Multi-document ACID transactions require careful session handling. Mitigated by keeping critical transitions (Lead-to-Client conversion) bounded.
* **Connection to AgencyOS:** Stores organizations, users, leads, audit data, invoices, projects, and agent execution logs.

### ADR-004: n8n for Visual Workflow Automation & Orchestration
* **Decision:** Use n8n as the workflow orchestration and webhook integration backbone.
* **Alternatives Evaluated:** Temporal, Apache Airflow, BullMQ custom workers, Zapier / Make.
* **Why Chosen:** n8n enables visual representation of complex multi-step agency processes (market research $\rightarrow$ prospect discovery $\rightarrow$ audit $\rightarrow$ notification). It supports self-hosting via Docker with zero per-execution vendor fees, provides 400+ pre-built integration nodes, and allows version-controlled JSON workflow export.
* **Trade-Offs & Limitations:** High-concurrency worker deployments require Redis queue mode.
* **Connection to AgencyOS:** Powers all 13 canonical agent workflows, 7 sub-workflows, and system scheduled sweeps.

### ADR-005: Zod for Universal Runtime Schema Validation
* **Decision:** Standardize on Zod 3.24+ for all input, webhook, and external API validation.
* **Alternatives Evaluated:** Joi, Yup, TypeBox, class-validator.
* **Why Chosen:** TypeScript-first type inference eliminates type/schema duplication. Zod parses untrusted LLM outputs and external webhooks into type-safe objects, throwing clean deterministic errors on schema drift.
* **Trade-Offs & Limitations:** Slight bundle overhead compared to TypeBox; negligible on backend and modern Node runtimes.
* **Connection to AgencyOS:** Guards all external inbound endpoints (`/api/v1/auth`, `/api/v1/leads`, `/api/v1/billing/webhook`, `/api/v1/n8n/webhook`).

### ADR-006: Vitest for Unit, Integration, and Contract Testing
* **Decision:** Use Vitest 2.1+ as the primary automated test runner.
* **Alternatives Evaluated:** Jest, Mocha, Node Test Runner.
* **Why Chosen:** Instant ESM support, shared Vite transform pipeline, seamless JSDOM component rendering, and sub-second test execution across 70+ test cases.
* **Trade-Offs & Limitations:** CJS compatibility warnings in older tools; fully mitigated by ESM-native repository structure.
* **Connection to AgencyOS:** Enforces GRAVITAS Reliability Invariants across all 72 automated test cases.

### ADR-007: Tailwind CSS for Agency Design System
* **Decision:** Use Tailwind CSS 3.4 with custom typography and agency color tokens.
* **Alternatives Evaluated:** Shadcn/UI primitives, CSS Modules, Styled Components.
* **Why Chosen:** Zero-runtime utility classes, dark/light theme support via `next-themes`, and custom agency design tokens (`paper`, `ink`, `agency-green`, `agency-accent`) matching the luxury editorial agency aesthetic.
* **Trade-Offs & Limitations:** Long class attribute strings; mitigated by reusable UI components (`frontend/src/components/ui/`).
* **Connection to AgencyOS:** Consistent pixel-perfect UI across all 11 dashboard features.
