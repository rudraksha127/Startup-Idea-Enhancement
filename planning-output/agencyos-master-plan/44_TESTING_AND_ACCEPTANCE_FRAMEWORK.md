# 44 — Testing and Acceptance Framework

`PROPOSED`. The gate that determines whether anything in this plan worked.

---

## 1. The premise

The current suite has 72 tests, one failing, and zero tests for the properties that matter: authentication, tenancy, consent, provenance, idempotency. It passes pure functions and fails the product.

This framework inverts that: **the highest-value tests are the ones that assert the product cannot lie or leak.**

---

## 2. Test pyramid, revised

| Layer | Count target | Speed | Runs on |
|---|---|---|---|
| **Invariant tests** (new category) | ~60 | ms | Every commit |
| Unit | ~300 | ms | Every commit |
| Contract | ~40 | s | Every commit |
| Integration | ~80 | s | Every commit |
| E2E | ~15 journeys | min | Every PR |
| Evals (AI) | ~150 cases | min | Every prompt change |
| Security | ~25 | min | Every PR |
| Load | 4 scenarios | min | Weekly |

### 2.1 The new category: invariant tests

Tests that assert a property of the whole system, not a function. They are the ones that would have prevented every critical finding in `18`.

| # | Invariant | Would have prevented |
|---|---|---|
| I-01 | No non-public route returns non-401 without a session | SEC-01, SEC-03, SEC-10 |
| I-02 | No repository method returns a foreign-org record | SEC-11 |
| I-03 | No response contains a value with source `synthetic` in a production build | UI-01…UI-06 |
| I-04 | No external send occurs without consent + approval | INT-03, AGT-03 |
| I-05 | No ledger entry can be updated or deleted | — |
| I-06 | Duplicate idempotency key produces one effect | — |
| I-07 | No secret literal appears in the built bundle | SEC-05 |
| I-08 | No Places field exists past `expiresAt` | INT-02 |
| I-09 | A prompt change cannot activate without passing evals | — |
| I-10 | An agent cannot invoke a tool outside its allowlist | R-15, R-33 |

**These ten tests are the acceptance criteria for the whole plan.** If they pass, the product is trustworthy. If they are absent, nothing else matters.

---

## 3. Invariant test specifications

### I-01 — Route authentication

```
enumerate every exported route handler
for each:
  if route in PUBLIC_ALLOWLIST: expect(request without session).status !== 500
  else: expect(request without session).status === 401
assert PUBLIC_ALLOWLIST.length === 4  (plus verified webhooks)
```

Implementation note: enumerate from the filesystem, not a hand-written list, or the test will drift.

### I-02 — Tenant isolation

```
for each repository method:
  create record with orgId = A
  call method with context for orgId = B
  expect result to be null / 404 / empty
  expect tenant A's record to remain completely unchanged after any mutation attempted by tenant B
  expect no exception that reveals existence
```

Also: assert that passing an explicit `orgId` in a query object throws.

### I-03 — Provenance

```
for each API response schema:
  expect _meta.source ∈ {'db','computed','provider'}
  expect _meta.source !== 'synthetic' when NODE_ENV === 'production'
  expect returned payload to derive from actual database records or provider responses (rejecting fabricated fixed constants)
```

Plus a static scan: `CANONICAL_OUTPUTS`, `REALISTIC_BUSINESSES`, `DEFAULT_CAMPAIGNS`, `CANONICAL_13_UI_AGENTS` must not appear in the production bundle.

### I-04 — Gate enforcement

```
for each connector extern action:
  without consent     → 403 consent_missing, no provider call
  without approval    → 403 approval_missing, no provider call
  suppressed address  → 403 suppressed
  budget exhausted    → 403 budget_exhausted
  autonomy suggest_only → 403 autonomy_insufficient
  kill switch off     → 403 capability_disabled
assert provider client was never invoked in any of the above
```

### I-05 — Ledger immutability

```
assert repository exposes no update/delete for LedgerEntry
attempt direct SDK update → expect rejection or no effect
attempt direct SDK delete → expect rejection or no effect
```

### I-06 — Idempotency

```
append same key twice → one row
send same message twice → one provider call
replay webhook 10× → one state transition
```

### I-07 — No secrets in bundle

```
build the production bundle
grep for: known-placeholder values, the default JWT secret string,
          'password123', 'founder@agencyos.com'
expect zero matches outside source maps
```

### I-08 — Places expiry

```
create a prospect from Places with fetchedAt = now − 31 days
run the purge job
expect Places-derived fields to be null
expect placeId to remain
```

### I-09 — Eval gate

```
change a prompt version
attempt to activate
expect activation to fail unless eval run id is present and passing
```

### I-10 — Tool allowlist

```
define an agent with tools: ['read_audit']
have it output an action calling 'send_message'
expect policy to reject with tool_not_allowed
expect no connector invocation
```

---

## 4. Contract tests

Per connector (`33` §10):

| Test | Assertion |
|---|---|
| `dryRun` no network | Provider client throws if called |
| `dryRun` records outbox | Row exists with `suppressed_dry_run` |
| Bad signature | `400`, no state change |
| Duplicate key | Second call returns first result |
| Kill switch | `403 capability_disabled` |
| Health check | Returns within 2s, no side effect |

Per API route:

| Test | Assertion |
|---|---|
| Valid body | Correct status + shape |
| Invalid body | `400` + field-level errors |
| Unauthorised | `401` |
| Forbidden capability | `403` |
| Dependency down | `503` + correlation ID (never `200`) |

---

## 5. E2E journeys (15)

Each is a real browser flow against a staging environment with `dry_run` connectors.

| # | Journey | Assertion |
|---|---|---|
| 1 | Register → verify → land in dashboard | Org created, no default org |
| 2 | Invite a second user → accept → limited view | Role enforced |
| 3 | Anonymous visit to a dashboard URL | Redirected to login |
| 4 | Run an audit on a fixture site | Score derived from stored checks |
| 5 | Open audit evidence for a score | Every check visible with evidence |
| 6 | Regenerate a report | Identical output |
| 7 | Create a prospect with a source | Source recorded and displayed |
| 8 | Attempt to send without consent | Refused with actionable message |
| 9 | Capture consent → approve → dry-run send | Outbox entry, no real send |
| 10 | Unsubscribe | Immediate global suppression |
| 11 | Exceed budget | Run fails before the model call |
| 12 | Kill switch a connector | Sends refused, UI explains |
| 13 | Export leads | Export contains only own-org data |
| 14 | Kill session | Next request fails |
| 15 | Ledger mismatch injection | Alert fires, no auto-correction |

Journey 8 and 10 are the ones a security reviewer will ask about. Journey 4 is the one a customer will judge.

---

## 6. Security test suite

| Test | Assertion |
|---|---|
| SSRF: private IP | Crawler refuses `127.0.0.1`, `169.254.169.254`, `10.x` |
| SSRF: redirect to private | Refused at the redirect hop |
| SSRF: scheme | `file://` refused |
| Prompt injection | Fixture page does not cause a tool call |
| Parameter tampering | `orgId` in body/query is ignored or rejected |
| Mass assignment | Extra fields rejected by schema |
| Operator injection | `$gt`/`$ne` in body rejected |
| Rate limit | 6th login attempt in a minute returns `429` |
| CSP | Header present, no `unsafe-inline` in `script-src` |
| Session fixation | New session ID after login |
| Refresh token reuse | Detected, family revoked |
| Webhook replay | Timestamp outside window rejected |

---

## 7. Performance and load

| Scenario | Target | Measured at |
|---|---|---|
| Audit of a 20-page site | < 60s p95 | M3 |
| Dashboard load | < 1.5s p95 | M2 |
| Lead list, 1,000 records | < 800ms p95 | M2 |
| Batch send, 200 messages | < 5 min, no duplicates | M6 |
| Concurrent audits, 20 | No failure, linear-ish scaling | M5 |

Load tests run weekly against staging, not in CI.

---

## 8. Release gates

Gates are introduced with the milestone that creates the capability. The tables below are the **steady-state target**, not the M0 gate. A gate that depends on a feature that does not exist yet is written as a failing test (a specification), but it does not block merges until its milestone.

| Gate | Becomes blocking |
|---|---|
| Typecheck, unit suite, secret scan, provenance scan | M0 |
| Route-authentication invariant (I-01) | M1 |
| Tenant-isolation invariant (I-02), schema drift | M2 |
| Audit determinism, eval checks, provenance UI | M3 |
| Ledger, idempotency, policy, tool allowlist | M4 |
| Consent/suppression end-to-end, dry-run contracts | M6 |
| Full E2E suite | M6 |
| Penetration test, compliance documents | M9 |

### 8.1 Merge to `main`

| Gate | Threshold |
|---|---|
| Typecheck | 0 errors |
| Invariant tests | **All pass** |
| Unit + integration | 100%, 0 skipped |
| Coverage | ≥ 70% on `backend/src`, `app/api` |
| Contract tests | All pass |
| E2E | 15/15 |
| Security tests | All pass |
| Secret scan | 0 findings, correct paths |
| Dependency audit | 0 high/critical |
| Lint | 0 errors |
| Provenance scan | 0 synthetic sources in prod bundle |

### 8.2 Deploy to production

| Gate | Requirement |
|---|---|
| Merge gates | All passing |
| Staging soak | 24h with no error-rate increase |
| Readiness | Green for 10 minutes |
| Rollback | Tested within the last 30 days |
| Migration | Runbook approved, reversible, or a tagged revert point |
| Changes to gates/ledger/schema | Founder review required |

### 8.3 Customer-facing launch (M9)

| Gate | Requirement |
|---|---|
| Security | Penetration test complete, findings resolved |
| Compliance | DPA, privacy notice, sub-processor list, grievance channel |
| Financial | Invoice reconciliation proven |
| Incident | Runbook rehearsed |
| Backup | Restore verified in the last 90 days |
| Legal | Counsel sign-off on DPDP position |

---

## 9. Test data policy

| Rule | Reason |
|---|---|
| No production data in tests | DPDP; also reproducibility |
| Fixtures for every entity | Deterministic |
| A seeded "golden" org with known records | Assertions are exact |
| A fixture site that never changes | Audit determinism |
| A fixture page containing a prompt-injection string | Security regression |
| A fixture page with known SEO properties | Check correctness |

**No test may call a real provider.** Connectors are mocked at the HTTP boundary, and a test asserts no outbound call to a provider domain occurs during the suite.

---

## 10. What "done" means

A task is done when:

1. It has a test that fails without it.
2. The test is in CI and blocking.
3. The relevant invariant test still passes.
4. Documentation that describes it is updated in the same commit.
5. If it touches a gate, ledger, or schema: founder review recorded.

`AGENTS.md` §3 requires evidence-based progress. This is the definition of evidence.

---

## 11. Coverage philosophy

70% is a floor, not a goal. The distribution matters more than the number:

| Area | Target coverage |
|---|---|
| Policy engine | **100% branch** |
| Ledger | **100% branch** |
| Consent/suppression | **100% branch** |
| Repository tenancy | **100% method coverage** |
| Route handlers | 80% |
| UI components | 40% |
| Crawler | 70% |
| Formatting utilities | 50% (or delete them) |

A codebase at 70% with 100% on gates and money is far safer than one at 90% with 60% on the ledger.

---

## 12. The first five tests to write

Before any feature work, in this order:

1. **I-01** route authentication — takes hours, prevents the worst class of leak.
2. **I-03** provenance — prevents re-introducing fabrication.
3. **I-04** gate enforcement — will fail until gates exist; write it first, watch it fail, then make it pass.
4. **I-02** tenant isolation — requires the repository; write with T-060.
5. **I-07** no secrets in bundle — catches the default secret class permanently.

Writing I-04 before the gates exist is the point: a failing test that describes the required behaviour is a specification, and this project's problem has never been a lack of specifications.
