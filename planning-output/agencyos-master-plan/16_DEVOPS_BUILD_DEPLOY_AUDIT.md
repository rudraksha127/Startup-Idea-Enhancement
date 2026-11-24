# 16 — DevOps, Build, and Deployment Audit

---

## 1. What actually deploys

`TEST-VERIFIED`: `npm run build` → `node scripts/build-cloudflare.mjs` → `@opennextjs/cloudflare` → `.open-next/` at the repository root.

`wrangler.json` declares `main: .open-next/worker.js`. `npm run deploy` = build + `wrangler deploy`.

**Therefore the deployment target is a Cloudflare Worker running the Next.js app.** This is correct and current: Cloudflare's guidance (R4, 17 Nov 2026) recommends Workers with OpenNext/vinext over Pages for Next.js workloads.

---

## 2. The four-way build inconsistency

| Path | Command | Output | Used by |
|---|---|---|---|
| A | `npm run build` | `.open-next/worker.js` | CI, `deploy` |
| B | `npm run build:frontend` | `.next/` | nothing |
| C | `npm run start` | serves `.next/` via `next start` | documentation, local habit |
| D | `Dockerfile` | copies `/app/frontend/.next/standalone` | nothing works |

### 2.1 Path D is broken, twice

`SOURCE-VERIFIED`: the root `Dockerfile` and `frontend/Dockerfile` are identical. Both copy `/app/frontend/.next/standalone`.

Two failures:

1. The active build (A) does not produce `.next/standalone`. OpenNext produces `.open-next/`.
2. Even build B (`next build`) produces `.next/standalone` **only if** `output: 'standalone'` is set in `next.config`. Whether it is set is unverified, but build A is what CI runs, so the Dockerfiles cannot work in the pipeline that exists.

**Consequence:** anyone attempting a container deployment follows a documented, committed, broken path. Time is lost and confidence drops.

### 2.2 Path C is incompatible with the artefact

`npm run start` runs `next start frontend`, which serves `.next/`. The deployment artefact is `.open-next/worker.js`. A developer using `npm start` after `npm run build` is running a *different build* than production.

This is a classic divergence mechanism: local behaviour and production behaviour come from different compilers.

**Correction (`PROPOSED`):**

- Delete both Dockerfiles, or replace with one that runs `wrangler dev` / `opennextjs-cloudflare preview` for parity. If container deployment is a real requirement, write a Dockerfile that runs the OpenNext worker under `workerd`, and test it in CI.
- Make `npm run preview` the documented local production-parity command (it already exists and is correct: `opennextjs-cloudflare build && opennextjs-cloudflare preview`).
- Remove or rename `start` to prevent misuse, or point it at `wrangler dev`.

---

## 3. Environment configuration

| Environment | Evidence |
|---|---|
| Local `.env.local`, `backend/.env`, `frontend/.env.local` | Present, untracked |
| Production `.env.production`, `backend/.env.production` | Present, untracked |
| Cloudflare Worker secrets | `BLOCKED` — cannot verify without account access |
| Catalyst project config | `BLOCKED` |

### 3.1 The Worker/Node boundary problem

Next.js code running on Cloudflare Workers **cannot use Node APIs** that are unavailable in `workerd`. The repository depends on:

- `mongoose` (requires TCP sockets to MongoDB — **not available in Workers**)
- `jsonwebtoken` (uses Node `crypto`; partially polyfilled but a known friction point)
- `bcryptjs` (pure JS, works, but slow)
- `zcatalyst-sdk-node` (Node-oriented SDK — Worker compatibility **unverified**)

`INFERRED` and important: **the build succeeding does not prove these work at runtime on Workers.** OpenNext bundles them; whether they execute is a separate question. Mongoose over TCP is the clearest concern — a Worker cannot open a raw TCP connection to MongoDB Atlas by default (Hyperdrive or an HTTP data API would be required).

### 3.2 The architectural contradiction this exposes

The code contains three persistence assumptions:

- Mongoose → needs a TCP socket → **incompatible with Workers**.
- `zcatalyst-sdk-node` → Node SDK → **compatibility unverified**.
- Express backend → a separate Node service → fine, but only reachable over HTTP.

So either:

- (a) the app deploys to Workers and the Mongoose paths fail at runtime, or
- (b) the app is actually run in Node somewhere else and the Worker config is aspirational.

`BLOCKED` to determine which, because no live deployment was inspected. **This is the single highest-priority unknown in the deployment picture** and is task T-018 in `43`.

### 3.3 Resolution direction (`PROPOSED`)

This contradiction independently supports the plan's architectural recommendation (`28`):

- Catalyst is reached over HTTPS via its API → **Worker-compatible**.
- MongoDB is removed from the runtime path → the TCP problem disappears.
- Express is retained only for workloads that genuinely need a long-lived Node process (durable workers), reached over HTTP.

That is a coherent Worker-first architecture. The current one is not; it is a Node architecture wearing a Worker config.

---

## 4. Secrets in the deployment

The Worker needs secrets for JWT signing, Catalyst credentials, provider keys, and webhook secrets. `wrangler secret put` is the correct mechanism; whether it is used is `BLOCKED`.

**Risk (`INFERRED`):** if secrets are instead injected as `[vars]` in `wrangler.json` or as build-time env vars, they are baked into the bundle and readable from the deployed artefact. `wrangler.json` should contain no secret material. This must be verified before any production deploy (task T-019).

---

## 5. Observability in the deployment

Cloudflare Workers provide logs and analytics. No configuration for Logpush, Tail Workers, or Workers Analytics Engine was observed (`SOURCE-VERIFIED` absence).

Without a Tail Worker or Logpush destination, logs are ephemeral and only visible in the dashboard during the retention window. For an operations product handling money and customer data, that is insufficient.

---

## 6. Rollback

No rollback procedure documented or automated (`SOURCE-VERIFIED` absence). Cloudflare supports versioned deployments and instant rollback; the repository does not use them.

**Correction (`PROPOSED`):** every deploy is versioned, tagged with the commit SHA, and rollback is a single documented command. A deploy that cannot be rolled back in under two minutes is not a deploy, it is a gamble.

---

## 7. Environments

Currently: local + "production". No staging.

**Consequence:** every change is tested either locally (with local data and possibly mocks) or in production. There is no environment where an integration can be exercised against real providers with `dry_run` on.

**Correction (`PROPOSED`):** three environments.

| Environment | Purpose | Data | Connectors |
|---|---|---|---|
| `local` | Development | Seeded local | `dry_run` forced |
| `staging` | Pre-release verification | Synthetic tenant set | `dry_run` forced, one sandbox provider account |
| `production` | Customers | Real | Live, gated |

Staging is a prerequisite for M9 (commercial launch), not M1. But the *configuration mechanism* for `dry_run` must exist in M1 because every connector depends on it.

---

## 8. Database operations

`database/scripts/manage.ts` provides `indexes`, `migrate`, `seed`, `health` — all targeting MongoDB.

For Catalyst there is no script (`SOURCE-VERIFIED` absence). Schema changes are console operations with no record.

**Correction (`PROPOSED`):** `catalyst/schema.manifest.json` committed; `schema:diff` compares live vs manifest and fails CI on drift; `schema:apply` is a documented manual runbook with a change record. Cannot be automated because ZCQL has no DDL (R2).

---

## 9. The `backend/app.js` bundle

A 43,000-line esbuild bundle is committed. It is not produced by any script in `package.json` (no `build:bundle` script observed), so its provenance is unclear (`INFERRED`: built manually at some point).

**Risks:**

- Divergence from source with no detection.
- Secret scanning and code review produce noise against minified output.
- Repository weight and diff noise.

**Correction:** delete from tracking; if a bundle is needed, produce it in CI and publish as a release artefact.

---

## 10. Deployment readiness assessment

| Requirement | Status |
|---|---|
| Reproducible build | **Yes** (`TEST-VERIFIED`) |
| Target platform correct | **Yes** (Workers) |
| Runtime compatibility proven | **No** (`BLOCKED` — Mongoose on Workers) |
| Container path | **Broken** |
| Local/prod parity | **Broken** (`start` vs `deploy`) |
| Staging environment | **Absent** |
| Secrets management | **Unverified** |
| Rollback | **Absent** |
| Observability | **Absent** |
| Schema versioning | **Absent** |

**Verdict:** the build pipeline is the most functional part of the repository, and it deploys an application whose runtime assumptions may not hold on the platform it targets. That contradiction must be resolved before any production traffic — and its resolution happens to be the same change the data architecture requires.
