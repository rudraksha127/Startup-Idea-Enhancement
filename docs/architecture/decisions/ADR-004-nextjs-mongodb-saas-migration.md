# ADR-004: Next.js 15 App Router & MongoDB (Mongoose) Full-Stack SaaS Migration

**Date:** 29 October 2026  
**Status:** ACCEPTED & IMPLEMENTED  
**Deciders:** Lead Full-Stack Architect, Founder  

---

## Context

The initial prototype of AgencyOS existed as static HTML, CSS, and client-side JavaScript (`prototype/agencyos_site/`). To turn this prototype into an enterprise-ready, modular, responsive full-stack SaaS application while retaining complete visual identity, typography, and UX parity, we migrated to modern Next.js 15 App Router with a MongoDB backend.

## Decision

1. **Frontend Architecture:** Next.js 15 (App Router), React 19, TypeScript in strict mode (`tsc --noEmit`), Tailwind CSS, Lucide React icons, and Recharts for interactive analytics.
2. **Backend Architecture:** Next.js Route Handlers (`src/app/api/`) by default, eliminating the need for a separate Express server container for MVP while maintaining complete API modularity.
3. **Database Layer:** MongoDB with Mongoose ODM, utilizing a cached singleton connection (`src/lib/db/mongodb.ts`), compound and text indexes, and multi-tenancy scoped by `organizationId`.
4. **Authentication:** JWT sessions stored in secure HTTP-only cookies (`agencyos_session`) with bcrypt password hashing.
5. **Data Validation:** Zod schemas applied deterministically across API request bodies, query params, and mutation payloads.
6. **External Provider Abstraction:** Pluggable provider architecture with mock discovery, mock email delivery, and mock AI research providers to guarantee local execution without requiring live API keys.
7. **Quality Gates:** Vitest with React Testing Library for unit/component tests, and Playwright for end-to-end browser automation workflows.

## Consequences

- **Pros:**
  - High velocity: Server Components and Route Handlers coexist in one unified codebase.
  - Zero mock-drift: All 27 prototype leads with rich intelligence data are seeded into real MongoDB collections.
  - Full testability: Unit tests run in under 3 seconds; Playwright E2E suite verifies complete user journeys in ~22 seconds.
  - Production readiness: Next.js build compiles 29 static and dynamic routes with zero warnings.
- **Cons:**
  - MongoDB connection caching requires care in serverless environments (mitigated via cached connection pattern).

