# 02 — Repository Baseline and Inventory

**Baseline commit:** `d1be2124df6075df9c6e4dac353d3b105497ae3c`
**Commit subject:** `feat(dashboard): complete fresh start audit, zero synthetic baseline, real KPI logic & interaction register`
**Branch:** `main`
**Working tree at audit start:** clean (`git status --porcelain` empty) — `TEST-VERIFIED`
**Submodules:** none — `SOURCE-VERIFIED`

The commit subject is itself evidence. It claims a "zero synthetic baseline" and "real KPI logic". `14_SYNTHETIC_DATA_INTEGRITY_AUDIT.md` shows this claim is false on multiple surfaces. The commit message and the code disagree, and the code is authoritative.

---

## 1. Repository shape

Monorepo with a root `package.json`, no workspace tooling. Two applications, one database layer, one automation layer, one shared-package folder that is duplicated.

```
/
├── frontend/          Next.js 16 App Router application
├── backend/           Express 5 API + Catalyst persistence + agent modules
├── database/          Mongoose models, schema definitions, scripts
├── packages/          shared-types, utilities  AND  contracts, utils  (duplicated)
├── n8n/               workflow generators, 25 workflow JSONs, deploy scripts
├── tests/             Vitest unit/integration + Playwright config
├── scripts/           build-cloudflare.mjs and friends
├── docs/              architecture, planning, execution, ADRs
├── infra/             deployment scaffolding
├── .github/           CI workflow
├── wrangler.json      Cloudflare Worker config  (main: .open-next/worker.js)
└── Dockerfile         (broken — see 16)
```

---

## 2. File counts at baseline

| Area | Files |
|---|---|
| Frontend | 146 |
| Backend | 209 |
| Docs | 136 |
| n8n | 34 |
| Database | 27 |
| Tests | 20 |
| Packages | 12 |
| Infra | 12 |
| **Total tracked** | **2,034** |

`SOURCE-VERIFIED` via `git ls-files`.

---

## 3. Tracked artefacts that should not be tracked

Two items are committed that materially affect repository hygiene and clone weight. Both are `SOURCE-VERIFIED`.

### 3.1 `backend/node_modules` — 1,514 files tracked

Dependencies are committed inside the backend. Consequences:

- Clone and CI install time inflated.
- `npm ci` at root does not govern these; two dependency graphs can silently diverge.
- A vulnerable transitive dependency can persist indefinitely because nothing audits the committed copy.
- Security scanning (`npm audit`) covers the root lockfile only, so the committed tree is effectively unscanned.

### 3.2 `backend/app.js` — a ~43,000-line esbuild bundle, tracked

A generated bundle is committed alongside its own source. Consequences:

- Every backend change produces a large, unreviewable diff.
- Code review cannot distinguish source change from bundle regeneration.
- `grep`-based analysis and secret scanning produce false positives against minified vendor code.
- Two copies of the same logic can drift, and there is no build step asserting they match.

**Recommendation (`PROPOSED`):** remove both from tracking in M1 with `.gitignore` entries, and add a CI assertion that generated output is not committed. This is a low-risk, high-value hygiene fix and should not be bundled with functional work.

---

## 4. Environment files present but untracked

Present on disk, correctly untracked: root `.env.local`, `.env.production`, `backend/.env`, `backend/.env.production`, `frontend/.env.local`. Only `.env.example` templates are committed.

Configured providers whose key names appear in the templates: Gemini, OpenAI, Resend, Stripe, NVIDIA NIM, OpenRouter, Google Maps, JWT secret, MongoDB URI.

**No values were read or reproduced.** The presence of live provider keys alongside a codebase whose providers return mocks unconditionally is a notable finding in itself: the company is paying for or holding credentials to services the product does not call (`INFERRED`).

---

## 5. Dependency posture

Root dependencies relevant to architecture decisions (`SOURCE-VERIFIED` from `package.json`):

| Package | Version | Architectural significance |
|---|---|---|
| `next` | ^16.4.6 | App Router; note the repo's own docs describe Next.js 15 |
| `react` | ^19.3.1 | React 19 |
| `express` | ^5.3.0 | Express 5 (breaking changes vs 4; middleware semantics differ) |
| `mongoose` | ^8.9.3 | Second persistence stack alongside Catalyst |
| `zcatalyst-sdk-node` | ^3.4.0 | Intended authoritative persistence |
| `jsonwebtoken` | ^9.0.2 | Custom auth, no library-level session management |
| `bcryptjs` | ^2.4.3 | Pure-JS hashing — slow; acceptable at low volume, a cost at scale |
| `zod` | ^3.24.1 | Validation available but inconsistently applied |
| `@opennextjs/cloudflare` | ^1.20.17 | Actual deployment target |
| `wrangler` | ^4.162.0 | Worker deployment |
| `vitest` | ^2.1.8 | Unit/integration |
| `@playwright/test` | ^1.49.1 | E2E, ungated |

**Observation (`INFERRED`):** `zod` is a direct dependency, yet the majority of API routes accept unvalidated JSON bodies. The tool for the fix is already installed.

---

## 6. Script surface

`package.json` scripts define the real build contract:

- `build` → `node scripts/build-cloudflare.mjs` (OpenNext). **This is what CI runs and what produces the deployable artefact.**
- `build:frontend` → plain `next build frontend`. Emits `.next/`. Not used by CI.
- `deploy` → build + `wrangler deploy`.
- `start` → `next start frontend`. **Inconsistent with the OpenNext Worker artefact**; `next start` cannot serve `.open-next/worker.js`.
- `test:e2e` → `playwright test -c tests/playwright.config.ts`. **Never invoked by CI.**

Two build paths (`build` vs `build:frontend`) and two run paths (`deploy` vs `start`) exist for one application. This is the mechanism by which the Dockerfiles came to be wrong (`16`).

---

## 7. CI configuration summary

Six jobs: `typecheck`, `test`, `build`, `security`, `lint`, `summary`. The `summary` job blocks merge only on `typecheck`, `test`, or `build` failure.

Consequences (`SOURCE-VERIFIED`):

- `security` failures never block. Both of its substantive steps carry `continue-on-error: true`.
- The secret-scan step greps `src/` and `apps/` — **neither directory exists at the repository root**. The scan is a no-op that prints a success message.
- `lint` never blocks.
- E2E is absent entirely.
- `npm audit` is advisory only.

The net effect: the only hard gates are type-checking and unit tests. A commit that introduces a hardcoded credential, breaks lint, or ships an XSS would pass CI.

---

## 8. Inventory of trust-critical files

These are the files whose correctness determines whether the product can be sold. They are the priority reading set for any new engineer.

| File | Why it is trust-critical |
|---|---|
| `backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` | Silent in-memory fallback for the authoritative datastore |
| `backend/src/middleware/auth.ts` | Authentication optionality |
| `backend/src/common/resolve-org.ts` | Shared demo org binding |
| `backend/src/modules/agents/agent-orchestrator.ts` | Fake orchestration and canned approvals |
| `backend/src/modules/agents/definitions/index.ts` | 13 stub agents |
| `frontend/src/lib/auth/jwt.ts` | Hardcoded default signing secret |
| `frontend/src/app/(auth)/login/page.tsx` | Advertised backdoor credentials |
| `frontend/src/app/api/billing/webhook/route.ts` | Unauthenticated invoice mutation |
| `frontend/src/app/api/leads/route.ts` | Triple fallback to empty |
| `frontend/src/app/api/leads/[leadId]/audit/route.ts` | Fixed audit scores |
| `frontend/src/app/api/agents/[id]/run/route.ts` | Fabricated outputs and phone numbers |
| `frontend/src/app/(dashboard)/audits/page.tsx` | `Math.random()` metrics |
| `frontend/src/app/(dashboard)/map-explorer/page.tsx` | Hardcoded business list with false count |
| `frontend/src/app/api/maps/places/route.ts` | Fake "Google Maps Verified" registry |
| `frontend/src/lib/providers/index.ts` | Unconditional mock providers |
| `wrangler.json` + `scripts/build-cloudflare.mjs` | Actual deployment contract |

---

## 9. Baseline reproducibility note

The working tree was clean at audit start. Running `npm run build` writes `.open-next/` at the root; running tests writes coverage artefacts. Neither modifies tracked source. **At the end of this audit the tracked tree is unmodified**, which is the Stage A requirement.
