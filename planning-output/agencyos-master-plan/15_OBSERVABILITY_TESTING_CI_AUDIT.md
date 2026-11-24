# 15 — Observability, Testing, and CI Audit

---

## 1. Testing inventory

| Layer | Framework | Files | Tests | Status |
|---|---|---|---|---|
| Unit | Vitest | majority of 16 | ~72 total | **71 pass, 1 fail** (`TEST-VERIFIED`) |
| Component | Vitest + Testing Library | `tests/unit/components.test.tsx` | — | **failing** |
| Integration | Vitest + supertest | present | — | passing (per suite result) |
| E2E | Playwright | `tests/playwright.config.ts` | — | **never run** (`BLOCKED`) |
| Contract | — | — | — | **absent** |
| Load | — | — | — | **absent** |
| Security | — | — | — | **absent** |
| Accessibility | — | — | — | **absent** |

72 tests for 42 API routes, 13 agents, 4 model universes, and 18 pages is roughly **1.7 tests per route** and zero tests per business invariant. The suite tests what is easy to test, not what matters.

---

## 2. The failing test

```
tests/unit/components.test.tsx:36
  Unable to find an element with the text: "Qualified Leads"
```

Interpretation, both branches:

- **If the label was renamed:** the assertion is stale, the test needs updating, and the suite has been red for an unknown number of commits.
- **If the component regressed:** a user-visible element is missing.

Either branch is a documentation failure, because `docs/execution/CURRENT_STATUS.md` claims 72/72 passing. That claim was written once and never re-verified. This is the most important lesson in the audit: **a status document that is not generated from CI output will drift into fiction.**

---

## 3. CI gates as configured

| Job | Blocking? | Effective? |
|---|---|---|
| `typecheck` | **Yes** | Yes — genuinely catches type errors |
| `test` | **Yes** | Yes — genuinely catches test failures (currently red) |
| `build` | **Yes** | Yes — genuinely catches build failures |
| `security` (npm audit) | No (`continue-on-error`) | No |
| `security` (secret grep) | No + **scans nonexistent dirs** | **Structurally cannot work** |
| `lint` | No | No |
| E2E | **Not present** | No |
| `summary` | Blocks on typecheck/test/build only | Consistent with above |

### 3.1 The secret-scan no-op

```bash
grep -r --include="*.ts" ... -E "(password|secret|api_key|...)\s*=\s*['\"][^'\"]{8,}" \
  --exclude-dir=node_modules ... src/ apps/ 2>/dev/null | grep -v "test\|spec\|..." 
```

`src/` and `apps/` do not exist at the repository root. All errors are discarded. The pipeline reaches the `else` branch and prints:

```
✓ No hardcoded secrets detected
```

Meanwhile `frontend/src/lib/auth/jwt.ts` contains a default JWT secret and `frontend/src/lib/seed/seed-data.ts` contains `password123`.

**This step is worse than absent**: it manufactures assurance. A reviewer reading the CI log concludes secrets were scanned. They were not.

### 3.2 Branch protection

`INFERRED`: because a red test suite is present on `main`, either branch protection is absent, or an administrator bypass was used, or CI is not running on this repository's PRs. The first is most likely. This should be confirmed and corrected in M0 (`43` T-004).

---

## 4. Observability

### 4.1 What exists

- `console.warn` / `console.log` statements scattered through routes.
- A `/api/health` endpoint of unverified depth.
- No structured logging, no log aggregation config, no request IDs, no tracing, no metrics, no alerting, no dashboards, no error reporting service.

`SOURCE-VERIFIED` absence.

### 4.2 Consequence

If the product were live:

- A failed Catalyst write would be a `console.warn` in a Cloudflare Worker log, invisible unless someone searched.
- No one could answer "how many agent runs failed today?" or "what is p95 lead-create latency?" or "which org is hitting rate limits?"
- Incident response would begin with "add logging", during the incident.

### 4.3 Minimum viable observability (`PROPOSED`, M2)

| Signal | Implementation |
|---|---|
| Request log | Structured JSON: `correlationId`, `route`, `status`, `durationMs`, `orgId`, `userId` |
| Error tracking | Sentry or equivalent, with release tag |
| Trace | OpenTelemetry spans for route → service → repository → provider |
| Metrics | Successful/failed writes, agent run duration, token spend, queue depth |
| Alerts | Error rate > 2% for 5 min; Catalyst readiness failing; spend > 70% of daily cap |
| Dashboards | One operations dashboard: traffic, errors, latency, spend, queue |

Cost: low. Value: converts undiagnosable failures into tickets.

---

## 5. AI-specific quality infrastructure

Absent entirely (`SOURCE-VERIFIED` absence):

| Requirement | Why it matters |
|---|---|
| Prompt/version registry | Without it, a behaviour change cannot be attributed to a prompt change |
| Golden evaluation set per agent | Without it, prompt edits ship untested |
| Regression gate on prompt change | Without it, quality degrades silently |
| Trace of every model call | Without it, a bad output cannot be debugged |
| Cost attribution per run | Without it, pricing is guesswork |
| Hallucination checks on factual outputs | Without it, the product's core risk is unmeasured |
| Human correction capture | Without it, there is no improvement signal |

`37` specifies this layer. Note that it is **M3**, not M1 — it requires real agent runs to instrument.

---

## 6. What the tests should assert (gap analysis)

The suite's blind spots, in priority order:

1. **Route authentication coverage** — every non-public route returns 401 without a token.
2. **Tenant isolation** — a user from org A cannot read a record from org B through any repository method.
3. **Schema validation** — malformed bodies return 400 with field errors.
4. **Provenance** — every response's numbers trace to a record (`14` §4.4).
5. **Idempotency** — replaying a webhook or a tool call does not duplicate an effect.
6. **Ledger invariants** — debits equal credits at all times; no negative balance without an explicit overdraft entry.
7. **State machines** — invalid transitions are rejected (lead status, agent run, invoice).
8. **Consent gating** — a send without consent returns 403.
9. **Approval gating** — an agent action requiring approval cannot execute without an approval record.
10. **Failure semantics** — a repository error produces a 5xx, never a 2xx with substitute data.

These ten categories are the acceptance spine of `44`.

---

## 7. Release gate proposal (`PROPOSED`)

A merge to `main` requires all of:

| Gate | Threshold |
|---|---|
| Typecheck (both) | 0 errors |
| Unit + integration | 100% pass, 0 skipped |
| Coverage | ≥ 70% lines on `backend/src`, `frontend/src/app/api` |
| Contract tests | All pass |
| E2E smoke (12 critical journeys) | All pass |
| Secret scan | 0 findings, scanning the **correct** paths |
| Dependency audit | 0 high/critical |
| Lint | 0 errors |
| Provenance test | 0 synthetic sources in production build |
| Auth coverage test | 100% of non-public routes |

Deploy to production additionally requires: readiness green for 10 minutes, a rollback plan, and — for schema changes — a recorded runbook.

---

## 8. Test economics

An honest note on cost: achieving the gate above on the current codebase is roughly **3–4 weeks of test-writing** if done from zero. The plan sequences it:

- M1: auth coverage, tenant isolation, validation, provenance (the four that prevent the worst failures). ~8 days.
- M2: contract tests as the API is rebuilt. ~5 days, absorbed into feature work.
- M3: evals and AI quality. ~5 days.
- M4+: maintained incrementally.

Writing all tests first would block delivery for a month. Writing the four critical ones first prevents the failures that would otherwise recur.

---

## 9. Verdict

| Dimension | Assessment |
|---|---|
| Unit tests | Exist; failing; thin |
| Integration tests | Exist; unverified depth |
| E2E | Configured, never run |
| Security testing | None |
| Contract testing | None |
| Coverage measurement | None |
| Structured logging | None |
| Tracing/metrics/alerting | None |
| AI evaluation | None |
| CI security gates | **Non-functional** |
| Documentation of status | **False** |

The verification story is the inverse of the product story: the code is well-typed and builds, and there is no mechanism that would tell you whether it works. Closing that is the cheapest reliability investment available, and it starts with making three no-op CI steps actually block.
