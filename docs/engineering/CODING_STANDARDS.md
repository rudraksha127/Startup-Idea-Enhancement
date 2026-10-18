# Coding Standards & Engineering Conventions — Autonomous Agency OS

---

## 1. Core Principles & Conventions

1. **TypeScript Strictness:** Strict mode enabled in `tsconfig.json`. Explicit typing for all function arguments, return values, and exported constants. `any` is strictly prohibited in production code.
2. **Schema-Driven Validation:** Every external input (API routes, webhook payloads, search queries) must be parsed through a Zod schema before business logic executes.
3. **Immutability & Pure Functions:** Core calculation functions (e.g., `calculateLeadFitScore(metrics)`) must be deterministic, pure functions with zero side effects.
4. **Error Handling & Resilience:**
   - Use typed Result patterns or descriptive custom errors.
   - Never swallow errors silently in `catch` blocks.
   - External network calls must define explicit timeouts (default: 8000ms).

---

## 2. Directory Structure Conventions (Next.js 15)

```
src/
├── app/                               # Next.js App Router (Pages, Layouts, API Route Handlers)
│   ├── (auth)/                        # Login & Password Recovery routes
│   ├── (dashboard)/                   # Authenticated Operator views (Kanban, Audits, Clients)
│   │   ├── pipeline/
│   │   ├── audits/
│   │   └── settings/
│   └── api/                           # Secure REST & Webhook endpoints
│       ├── prospects/
│       ├── audits/
│       └── webhooks/
├── components/                        # Reusable UI components (Shadcn/UI, Layouts)
│   ├── ui/
│   ├── pipeline/
│   └── audits/
├── lib/                               # Core business logic and shared utilities
│   ├── db/                            # Supabase client, queries, and type definitions
│   ├── scoring/                       # Deterministic Lead Fit Score algorithms
│   ├── audit/                         # PageSpeed & DOM analysis helpers
│   └── validation/                    # Zod schemas for all models and payloads
└── types/                             # Database and application TypeScript interfaces
```

---

## 3. Git Commit Message Standards

Follow the Conventional Commits specification:
- `feat(TASK-XXX): add programmatic PDF audit generator`
- `fix(TASK-XXX): handle null WhatsApp CTA on landing page inspection`
- `test(TASK-XXX): add unit tests for suppression list matcher`
- `docs: update database schema with amc_subscriptions table`
