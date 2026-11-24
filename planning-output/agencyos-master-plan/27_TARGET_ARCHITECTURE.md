# 27 — Target Architecture

`PROPOSED`. This is the system to build. It supersedes ADR-004 and ADR-005 (see `17` §2.5) and is written to be transcribed into ADR-006.

---

## 1. Architectural principles

Seven rules. Every subsequent decision derives from them.

1. **One writer per fact.** Each fact has exactly one authoritative store and one code path that writes it. No fallbacks that substitute data.
2. **Fail loudly.** A dependency failure produces an error with a correlation ID, never a plausible substitute.
3. **Deterministic before generative.** If a value can be computed, compute it. Models write prose, never scores, prices, or gate decisions.
4. **Authorisation is structural.** Tenancy is injected by the repository, not remembered by the caller.
5. **Effects are gated.** Anything leaving the system (message, payment, external write) requires consent, approval, and budget — enforced server-side.
6. **Durable by default.** Work that can span more than one request runs in a durable engine, not in a function that can be evicted.
7. **Every action is attributable.** Who did what, when, with which version, is recorded.

---

## 2. Target topology

```
┌──────────────────────────────────────────────────────────────┐
│  Browser                                                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼──────────────────────────────────┐
│  Cloudflare Worker  (OpenNext)                                │
│  ├── middleware.ts        → session verify, org resolve,      │
│  │                          rate limit, security headers      │
│  ├── Server Components   → data via server actions/repo       │
│  ├── Route Handlers      → thin: validate → service → respond │
│  └── no business logic in the presentation layer             │
└───────┬───────────────────────────────┬──────────────────────┘
        │ HTTPS (Catalyst API)          │ HTTPS (internal)
┌───────▼───────────────┐     ┌─────────▼──────────────────────┐
│  Zoho Catalyst        │     │  Workflow Service (Node)        │
│  ├── Data Store/ZCQL  │     │  ├── Temporal worker            │
│  ├── Functions        │     │  ├── activities: crawl, model,  │
│  └── Cache            │     │  │   send, score                │
│                       │     │  └── stays Node (not Worker)    │
└───────────────────────┘     └─────────┬──────────────────────┘
        ▲                               │
        │                               ├──► LLM Gateway (LiteLLM)
        │                               ├──► Connectors (email/WA)
        │                               └──► Observability (OTel/Langfuse)
        │
┌───────┴───────────────────────────────────────────────────────┐
│  Object storage (reports, exports, evidence snapshots)         │
└───────────────────────────────────────────────────────────────┘
```

### 2.1 Why a separate workflow service

The Worker is stateless and short-lived. Audits, campaigns, and agent runs are long-lived and must survive eviction and deploys. A Worker cannot host a durable timer. Therefore:

- **Worker:** request/response, rendering, auth, reads, thin writes.
- **Workflow service:** anything with a timer, a retry, a multi-step sequence, or a wait-for-approval.

The boundary is: *if it can take longer than a request, it is not in the Worker.*

This also resolves the Mongoose-on-Workers problem (`16` §3.1): the Worker talks to Catalyst over HTTPS, and never opens a TCP socket.

---

## 3. Layer responsibilities

| Layer | Responsibility | Must not |
|---|---|---|
| **Presentation** (Server/Client Components) | Render state, collect intent | Compute business values, call providers, hold business rules |
| **Route handler / Server action** | Validate input, authorise, call one service, shape response | Contain business logic, catch-and-substitute |
| **Service** (domain) | Orchestrate a use case, enforce invariants | Talk to a database directly |
| **Repository** | Persist and read one aggregate; inject `orgId` | Contain business rules |
| **Connector** | Talk to one external provider | Decide whether to act |
| **Workflow** | Sequence activities durably | Contain business rules (they belong in services/activities) |

---

## 4. Request lifecycle (canonical)

```
1. middleware.ts
   ├─ verify session cookie  → 401 / redirect
   ├─ resolve active org     → throw if absent (no default)
   ├─ rate limit by org+route
   └─ attach security headers

2. Route handler
   ├─ parse body with Zod    → 400 with field errors
   ├─ capability check       → 403
   ├─ build command          → typed
   └─ call service

3. Service
   ├─ load aggregates via repository
   ├─ enforce invariants
   ├─ if external effect:
   │    ├─ check consent
   │    ├─ check approval
   │    ├─ check budget
   │    └─ enqueue durable workflow  → 202 Accepted
   └─ else: persist and return

4. Repository
   ├─ inject orgId from context (caller cannot supply)
   ├─ read/write Catalyst
   └─ on error: throw typed error, never substitute

5. Response
   └─ { data?, error?, meta: { correlationId, source, generatedAt } }
```

Note step 3's `202 Accepted` for externally-effectful operations. A send is not "done" when the request returns; it is *queued*, and its state is observable. This is a fundamental correction to the current synchronous-and-fake pattern.

---

## 5. The anti-fallback rule

The single most important architectural rule, and the one most likely to be violated by habit:

> **No layer may return substitute data for a failed operation.**

Permitted responses to failure:

| Situation | Response |
|---|---|
| Validation failed | `400` + field errors |
| Unauthenticated | `401` |
| Unauthorised | `403` + reason code |
| Not found | `404` |
| Conflict (idempotency, state) | `409` |
| Dependency unavailable | `503` + `Retry-After` + correlation ID |
| Unexpected | `500` + correlation ID, alert fired |

Forbidden: `200` with empty array, `200` with sample data, `200` with last-known-good unless explicitly labelled stale **and** the client requested tolerance.

UI counterpart (`23` §4): `EmptyState`, `DegradedState`, `ErrorState` — three distinct renderings.

---

## 6. Module boundaries

```
/backend/src
  /modules
    /identity        user, org, membership, session
    /prospecting     prospect, profile, batch, source
    /assessment      audit, check, rubric, narrative
    /engagement      campaign, message, consent, suppression
    /commerce        credit, ledger, invoice, cost
    /execution       agent, run, step, approval
    /governance      auditlog, integration, flag, retention
  /platform
    /persistence     repository interfaces + catalyst impl
    /validation      zod schemas, shared contracts
    /errors          typed error taxonomy
    /telemetry       logger, tracer, metrics
    /policy          gates: consent, approval, budget, capability
  /workflows         temporal workflow + activity definitions
  /connectors        email, whatsapp, maps, crm
```

Rules:
- A module may import `platform/*` and its own internals.
- A module may **not** import another module's internals. Cross-context access is via a published read model or an event.
- `workflows` may import module *services*, never repositories.
- `connectors` may not import modules.

Enforce with a lint rule (`eslint-plugin-boundaries` or equivalent) and a CI check. Architectural rules that are not mechanically enforced decay in weeks.

---

## 7. Deployment topology

| Component | Target | Rationale |
|---|---|---|
| Next.js | Cloudflare Worker (OpenNext) | Current platform guidance (R4); already working |
| Workflow service | Node container (Zoho AppSail or equivalent) | Needs long-lived process for Temporal worker |
| Database | Zoho Catalyst Data Store | Business system of record |
| Object storage | Catalyst Stratus or Cloudflare R2 | Reports, exports, evidence |
| Cache | Catalyst Cache | Session-independent ephemeral data |
| Secrets | Cloudflare secrets + platform vault | No secrets in code or config |
| Observability | OTel → collector; Langfuse for LLM | Vendor-neutral traces |

**Preserved constraints:** Cloudflare and Zoho Catalyst remain the deployment targets. No static export. No hosting change.

---

## 8. What is deleted

Architectural clarity requires stating what leaves.

| Removed | Reason |
|---|---|
| Mongoose from the runtime path | Not Worker-compatible; second source of truth |
| In-memory ZCQL client | Silent data loss |
| Express generic API surface | Superseded by route handlers + workflow service |
| `backend/app.js` bundle | Generated artefact |
| `backend/node_modules` tracked | Hygiene |
| Dual Dockerfiles | Broken |
| `CANONICAL_OUTPUTS`, `REALISTIC_BUSINESSES`, `DEFAULT_CAMPAIGNS`, `CANONICAL_13_UI_AGENTS` | Fabrication |
| `org-apex-001`, default JWT secret, seed backdoor | Security |
| n8n as product engine | Licence (`10`) |

---

## 9. Migration path (shape only; sequencing in `42`)

The migration is **strangler-shaped but front-loaded**, because there is nothing to preserve operationally.

```
Phase 1 (M1)  Add the enforcement layer in front of the existing app.
              Auth, validation, headers, rate limits. App still fake, but safe.

Phase 2 (M2)  Establish the authoritative schema. Repositories bound to Catalyst.
              Delete Mongo from the runtime path. Delete in-memory client.

Phase 3 (M3)  Build the first real vertical: audit. Crawler, checks, evidence,
              score, persistence. This replaces the fake audit.

Phase 4 (M4)  Add durable execution, ledger, approvals, observability.
              The substrate that everything else needs.

Phase 5+      Add verticals: qualification, outreach, campaigns, reporting.
```

The ordering is not arbitrary: Phase 1 makes the app safe, Phase 2 makes it true, Phase 3 makes it *useful*, Phase 4 makes it *scalable*.

---

## 10. Non-goals of this architecture

Recorded so they are refused explicitly rather than drifting in:

- **No microservices.** Five contexts do not need five deployments.
- **No event bus.** Modules and a workflow engine are sufficient until proven otherwise.
- **No Kubernetes.** Two deployables do not justify it.
- **No GraphQL.** Typed REST + server components cover the surface.
- **No custom model serving.** Use providers via the gateway.
- **No data warehouse.** Catalyst + precomputed rollups until volume demands otherwise.
- **No multi-region.** Single region until a customer requires otherwise.

Each of these would add operational surface the team cannot yet afford to run.

---

## 11. Architecture decision record content (ADR-006)

To be committed in M1 (`DOC-02`):

> **ADR-006: Workers + Catalyst target architecture**
>
> **Status:** Accepted (pending founder sign-off)
> **Supersedes:** ADR-004, ADR-005
>
> **Decision:** The frontend deploys as a Cloudflare Worker via OpenNext. Zoho Catalyst Data Store is the authoritative business database. MongoDB is removed from the runtime path. A separate Node workflow service runs durable execution. Externally-effectful operations are asynchronous, gated by consent, approval, and budget, and recorded in an append-only audit log.
>
> **Consequences:** Mongoose and the in-memory Catalyst client are deleted. The generic Express API is reduced to workflow endpoints. Financial state is append-only because ZCQL has no multi-statement transactions. Every dependency failure is visible to users; no layer substitutes data.
>
> **Alternatives rejected:** Cloudflare Pages (superseded platform guidance); dual-write Mongo + Catalyst (two truths); synchronous external effects (no durability, no gating).

---

## 12. Verdict

The target is not a different product — it is the product the repository already describes, with its three missing properties added: **authority** (one store), **enforcement** (auth and gates), and **durability** (workflow engine). The visual layer, route map, and deployment platform survive unchanged.
