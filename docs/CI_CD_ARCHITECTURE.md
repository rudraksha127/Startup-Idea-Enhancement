# CI/CD Architecture — AgencyOS
**Last Updated:** 2026-10-30

## Overview

AgencyOS uses GitHub Actions for automated CI/CD. All changes must pass the automated pipeline before merging to `main` or `staging`.

## Workflow: `.github/workflows/ci.yml`

### Trigger Events
| Event | Branches | Effect |
|-------|----------|--------|
| `push` | `main`, `staging` | Full pipeline runs |
| `pull_request` | `main`, `staging` | Full pipeline runs; blocks merge on failure |

### Concurrency
One pipeline per branch at a time. New pushes cancel in-progress runs on the same branch (`cancel-in-progress: true`).

### Job Graph

```
┌──────────────┐   ┌──────────────┐
│  typecheck   │   │   security   │  ← runs in parallel, independent
│ (blocks all) │   │  (advisory)  │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐   ┌──────────────┐
│    test      │   │    lint      │  ← test needs typecheck; lint independent
│ (blocking)   │   │  (advisory)  │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│    build     │  ← needs tests to pass
│ (blocking)   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   summary    │  ← fails overall if any blocking gate fails
└──────────────┘
```

### Jobs Detail

#### 1. `typecheck` (BLOCKING)
- Runs: `npm run typecheck` (Next.js frontend)
- Runs: `npm run typecheck:api` (Express backend)
- Failure blocks: `test`, `build`, `summary`

#### 2. `test` (BLOCKING)
- Runs: `npm run test` (Vitest — 29 tests across 6 files)
- Requires: `typecheck` pass
- Env: `JWT_SECRET`, `MONGODB_URI` set to CI-safe values
- Uploads test artifacts (7-day retention)

#### 3. `build` (BLOCKING)
- Runs: `npm run build` (Next.js production build — 34 routes)
- Runs: `npm run build:api` (Express TypeScript compile)
- Requires: `test` pass
- Uploads `.next/` build artifact (3-day retention)

#### 4. `security` (ADVISORY — non-blocking merge)
- `npm audit --audit-level=high` — flags high/critical CVEs
- Grep scan for hardcoded secrets in `.ts`, `.tsx`, `.js` files
- Validates no `.env` files committed to Git

#### 5. `lint` (ADVISORY — non-blocking merge)
- `npm run lint` (ESLint with Next.js config)

#### 6. `summary`
- Reports status of all jobs
- Fails overall if any BLOCKING gate failed

## Environment Variables in CI

| Variable | Job | Value |
|----------|-----|-------|
| `NEXT_TELEMETRY_DISABLED` | build | `1` |
| `JWT_SECRET` | test, build | CI-safe placeholder (never production key) |
| `MONGODB_URI` | test, build | localhost URI (DB not actually running in test) |
| `NEXT_PUBLIC_API_BASE_URL` | build | From `vars.NEXT_PUBLIC_API_BASE_URL` repo variable |

## Required GitHub Repository Settings

Configure these in `Settings → Branches → Branch protection rules` for `main`:

```
☑ Require a pull request before merging
☑ Require status checks to pass before merging
    Required checks:
      - TypeScript Typecheck
      - Unit & Integration Tests
      - Production Build
☑ Require branches to be up to date before merging
☑ Do not allow bypassing the above settings
```

## Artifacts

| Artifact | Retention | Contents |
|----------|-----------|----------|
| `test-results` | 7 days | Coverage reports |
| `nextjs-build` | 3 days | `.next/` production build |

## Future Additions

| Workflow | Priority | Description |
|----------|----------|-------------|
| `deploy-staging.yml` | HIGH | On push to `staging` → Cloudflare Pages deploy |
| `deploy-production.yml` | HIGH | On push to `main` → Zoho AppSail + CF Pages deploy |
| `e2e.yml` | MEDIUM | Playwright E2E on staging after deploy |
| `dependency-update.yml` | LOW | Weekly Dependabot PRs |
| `codeql.yml` | MEDIUM | CodeQL static security analysis |

