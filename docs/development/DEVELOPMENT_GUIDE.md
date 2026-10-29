# AgencyOS Developer Guide

---

## 1. Codebase Conventions

- **Next.js 15 App Router:**
  - `src/app/(marketing)`: Unauthenticated public pages (e.g. landing page).
  - `src/app/(auth)`: Auth pages (`/login`, `/register`).
  - `src/app/(dashboard)`: Authenticated agency operating system views sharing `layout.tsx` and `app-sidebar.tsx`.
  - `src/app/api`: Server-side REST route handlers.
- **TypeScript Strictness:**
  - `noImplicitAny: true`
  - Explicit return types for utility functions.
  - No `@ts-ignore` without accompanying rationale.
- **Styling Standards:**
  - Use Tailwind CSS utility classes.
  - Strictly use design tokens: `#F8F6F0` (canvas), `#171918` (text), `#3568E8` (primary blue), `#10B981` (green).

---

## 2. Standard Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js dev server on port 3000 |
| `npm run typecheck` | Validates TypeScript types across entire project (`tsc --noEmit`) |
| `npm run test` | Executes Vitest unit & component test suite |
| `npm run test:e2e` | Executes Playwright end-to-end browser tests |
| `npm run build` | Compiles production Next.js build (29 routes) |
| `npm run seed` | Seeds database with sanitized demo records |
| `npm run lint` | Runs Next.js ESLint rules |

---

## 3. Git Workflow & Branching

- `main`: Production-ready release branch.
- `staging`: Integration testing branch.
- Feature branches: `feat/TASK-XXX-title` (linked to `docs/planning/BACKLOG.md`).
- Bugfix branches: `fix/TASK-XXX-title`.

