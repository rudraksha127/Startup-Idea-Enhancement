# AI Coding Agent & Contributor Guidelines — Autonomous Agency OS

**Document type:** Canonical instructions for AI coding agents and human engineers  
**Project:** Autonomous Agency OS  
**Status:** Active  
**Last updated:** 18 October 2026  

---

## 1. Operating Rules for AI Agents

1. **Understand Before Modifying:** Always inspect existing code, schemas, and documentation before proposing or applying changes. Never assume an implementation exists merely because it is documented in a specification.
2. **Preserve Deterministic Boundaries:** Source eligibility, suppression lists, credit/spend budgets, authentication, permission checks, approval gates, and state transitions must **never** depend purely on LLM heuristics. Always use deterministic validation (Zod, database constraints, strict conditionals).
3. **Evidence-Based Progress:** Never mark a feature, test, migration, or check complete without actual verification output. An untested feature is `UNTESTED`; a failing integration is `FAIL`; an uninspected module is `UNVERIFIED`.
4. **Zero Tolerance for Known Critical Release Blockers:** Do not knowingly bypass or ignore failing security checks, credential leaks, or broken authorization tests to meet a schedule.
5. **No Uncontrolled External Actions:** Never send live emails, trigger live WhatsApp messages, execute live ad spend, or deploy to production systems without explicit founder authorization and active gate clearance. Default all outbound connectors to `dry_run = true` or mock modes in non-production environments.
6. **Strict Source Policy:** Never implement scraping for Google Maps / Google Places data. Adhere to Section 3.2.3 of Google Maps TOS, the Indian Digital Personal Data Protection (DPDP) Act 2023, and TRAI TCCCPR rules.
7. **Secrets & Credentials Safety:** Never write API keys, passwords, database credentials, or secret tokens into code, tests, or documentation. Read environment variables exclusively via `.env.example` templates and validated schema parsers.
8. **Small, Reversible Changes:** Deliver tasks in small, independently testable units. Avoid sprawling multi-file refactors unless explicitly mandated by an architectural milestone.

---

## 2. Technology Stack & Framework Conventions

- **Frontend & Admin Dashboard:** Next.js 15 (App Router), TypeScript (strict mode), Tailwind CSS, Lucide Icons, Shadcn/UI primitives.
- **Backend & Database:** Supabase (PostgreSQL 16), Row Level Security (RLS) on all tables, Supabase Auth, Edge Functions (TypeScript/Deno).
- **Workflow Orchestration:** n8n (self-hosted or managed) for scheduled jobs, multi-step asynchronous web auditing, and webhook ingest.
- **Data Validation:** Zod for all external inputs, webhook payloads, and API parameters.
- **LLM Gateway:** Pluggable multi-provider gateway (OpenAI / Anthropic / Google Gemini) with structured JSON outputs, cost logging, and token limits.
- **Testing:** Vitest for unit/integration tests, Playwright for end-to-end browser workflows.

---

## 3. Git & Branching Conventions

- `main`: Production-ready, passing all release gates.
- `staging`: Integration and pre-release testing.
- `feat/TASK-XXX-title`: Discrete implementation branch linked to a unique task ID in `docs/planning/BACKLOG.md`.
- `fix/TASK-XXX-title`: Bugfix branch linked to an issue or failing test case.

---

## 4. Documentation Governance

Whenever code, database schema, API contracts, or workflows change:
1. Update `docs/architecture/DATABASE_DESIGN.md` if tables, columns, or RLS policies change.
2. Update `docs/architecture/API_SPECIFICATION.md` if endpoint contracts change.
3. Update `docs/planning/BACKLOG.md` and `docs/execution/CURRENT_STATUS.md` to reflect verified task progress.
4. Record significant architectural modifications in a new Architecture Decision Record (`docs/architecture/decisions/ADR-XXX.md`).
