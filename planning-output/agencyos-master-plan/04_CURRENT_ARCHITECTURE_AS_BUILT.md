# 04 — Current Architecture As Built

This document describes what the repository **actually deploys**, not what any document says it deploys. Where the two disagree, the code wins and the disagreement is recorded.

---

## 1. The observed topology

```
Browser
  │
  ▼
Cloudflare Worker  (wrangler.json → main: .open-next/worker.js)
  │  built by scripts/build-cloudflare.mjs (@opennextjs/cloudflare)
  │
  ├── Next.js 16 App Router  ── 18 pages, 42 API routes
  │      │
  │      ├── Mongoose  ──────────────► MongoDB Atlas (MONGODB_URI)
  │      ├── fetch → Express API ────► backend (separate service)
  │      └── fetch → Zoho Catalyst ──► ZCQL via zcatalyst-sdk-node
  │
  └── (no middleware.ts — zero request interception)

Express 5 API  (backend/, 209 files)
  │
  ├── zcatalyst-sdk-node  ── ZCQL  ──► Catalyst Data Store
  ├── (in-memory fake client as fallback)
  └── agent modules (13 stub definitions)

n8n  (34 files: generators, 25 workflow JSONs, deploy scripts)
  └── 4-node template workflows, placeholder prompts
```

`SOURCE-VERIFIED` for the Worker target, `TEST-VERIFIED` for the build, `SOURCE-VERIFIED` for the dual persistence, `SOURCE-VERIFIED` for the missing middleware.

---

## 2. The three-layer persistence problem

The application has **three** data paths that can answer the same question, and the order in which they are tried is inconsistent between routes.

| Path | Technology | Who writes | Who reads |
|---|---|---|---|
| A | MongoDB via Mongoose | Frontend API routes, seed scripts | Frontend routes, `database/` scripts |
| B | Express API → Catalyst ZCQL | Backend modules | Frontend routes that `fetch` the API |
| C | In-memory fake | Fallback when B fails | Any caller that reached the fallback |

### 2.1 The fallback chain, in the code

`frontend/src/app/api/leads/route.ts` — `SOURCE-VERIFIED`:

1. Try the AppSail/Express API.
2. On failure, try MongoDB.
3. On failure, return an empty set.

`backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` — `SOURCE-VERIFIED`:

An in-memory ZCQL implementation that accepts writes and returns them for the life of the process, **without signalling that it is not the real datastore**.

### 2.2 Why this is the most dangerous pattern in the codebase

The fallbacks are not error states; they are *successful-looking* states.

- A user creates a lead. The Catalyst call fails. The in-memory client accepts the write. The API returns `201 Created`. The user sees the lead. **The lead does not exist.**
- On the next request, if the process recycled, the lead is gone. If MongoDB was reachable second in the chain, it may exist there instead. The user now has two data stores with divergent contents and no reconciliation.
- Nothing in the response distinguishes "stored" from "accepted into a volatile buffer".

This is a **durability lie**, and it is the mechanism by which every downstream integrity problem becomes undetectable. `INFERRED` but with high confidence: the silent fallback is the root cause that allowed fabricated data patterns to proliferate, because developers could not tell which layer answered.

### 2.3 Correction direction (`PROPOSED`)

One authoritative writer. Catalyst Data Store. No silent fallback. If Catalyst is unreachable, the request fails with a typed error and a correlation ID. The frontend renders an explicit degraded state. This is specified in `28`.

---

## 3. The four documentation realities

The repository contains four incompatible descriptions of its own architecture.

| Source | Claims | Matches code? |
|---|---|---|
| `docs/architecture/DATABASE_DESIGN.md` | PostgreSQL 16 / Supabase, RLS on all tables | **No** |
| `ADR-004-nextjs-mongodb-saas-migration.md` | Next.js + MongoDB migration | **Partially** — Mongo is present, but not authoritative |
| `ADR-005-cloudflare-pages-zoho-express-topology.md` | Cloudflare **Pages** + Zoho Express | **No** — deploys a Worker |
| `wrangler.json` + `scripts/build-cloudflare.mjs` | OpenNext Worker | **Yes** — this is reality |

`SOURCE-VERIFIED`. The consequence is that an engineer following the docs would build a Supabase application with RLS, deploy to Pages, and never discover the Worker until deploy time.

**Resolution (`PROPOSED`):** a single `ADR-006` supersedes 004 and 005, records Workers + Catalyst as the target, and marks the Supabase document as historical. Detailed in `17` and `27`.

---

## 4. Request path with no interception layer

There is **no `middleware.ts`** anywhere in the application (`SOURCE-VERIFIED`). The dashboard layout `frontend/src/app/(dashboard)/layout.tsx` is a `"use client"` component with no auth guard.

Consequences:

1. Every dashboard route renders for an anonymous visitor.
2. Page-level data fetching happens client-side, so the *data* calls are what remain gated — and those are only partially gated (see `08`).
3. There is no single place to enforce tenancy, rate-limiting, or redirect logic.

The absence of middleware is not a stylistic gap. In Next.js App Router it is the canonical enforcement point for authentication, and its absence means authentication was never architected — only added per-route, inconsistently.

---

## 5. The agent layer as built

`SOURCE-VERIFIED`:

- `backend/src/modules/agents/definitions/index.ts` — 13 agent definitions, each a hardcoded object with a name, description, and prompt string. **No LLM is invoked anywhere in the file.**
- `backend/src/modules/agents/agent-orchestrator.ts` — orchestration is a function that returns canned structures; `approveRun` returns a fixed "approved" result regardless of input; token counts are fabricated constants.
- `frontend/src/lib/providers/index.ts` — every provider factory returns a mock implementation unconditionally, with no environment check.
- `frontend/src/app/api/agents/[id]/run/route.ts` — returns one of a hardcoded set of `CANONICAL_OUTPUTS` keyed by agent id, and synthesises phone numbers for "discovered" leads.

There is no queue, no worker, no retry, no budget, no trace, no tool layer, and no idempotency key. The `backend/workers/README.md` documents BullMQ/Catalyst workers that **do not exist** (`DOCUMENTED-ONLY`).

---

## 6. The n8n layer as built

`SOURCE-VERIFIED`:

- `n8n/scripts/generate-workflows.ts` produces workflows from a template.
- `n8n/workflows/**` contains 25 JSON workflows, each with **four nodes** and placeholder prompt text.
- Validation and deploy scripts exist and are wired to npm scripts.
- No workflow is evidenced to have executed successfully (`BLOCKED` — n8n was not contacted).

**Licence exposure (`SOURCE-VERIFIED` via R3):** n8n is under the Sustainable Use License, not an OSI licence. Hosting n8n so third parties can build and run workflows on it requires a commercial agreement. This constrains n8n's role in a multi-tenant AaaS product, discussed in `10` and `30`.

---

## 7. What the architecture is actually good at

Stated plainly, because a plan that only lists defects is not an honest audit:

1. **The build is real.** OpenNext → Worker works. `TEST-VERIFIED`.
2. **The route surface is complete enough to be a specification.** 42 routes and 15 dashboard pages describe the intended product shape better than any planning document in the repo.
3. **Catalyst SDK wiring exists.** `zcatalyst-sdk-node` is installed and used; the integration point is real even though the fake fallback undermines it.
4. **Type discipline holds.** Both typechecks pass, so the codebase can be refactored aggressively without a long stabilisation period.
5. **The design system is coherent.** See `23`.

---

## 8. Architectural verdict

> AgencyOS is a **presentation layer with three competing backends and no enforcement layer**.

The correct response is not a rewrite. It is:

1. Choose one backend (Catalyst) and delete the others (`28`).
2. Add the missing enforcement layer (`34`).
3. Replace the agent stubs with a real runtime (`29`).
4. Remove every surface that answers a question without asking a system (`14`).

The interface, the route map, and the build pipeline survive. That is roughly 40% of the value of what exists, and it is the 40% that is hardest to recreate.
