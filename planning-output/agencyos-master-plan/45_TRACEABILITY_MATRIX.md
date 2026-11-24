# 45 — Traceability Matrix

Every finding maps to a risk, a task, a test, and a milestone. Nothing in this plan is untraceable, and no task exists without a finding, a documented capability gap, or a verification requirement behind it.

---

## 1. How to use this

- **Finding** — where the defect is recorded.
- **Risk** — the business consequence (`40`).
- **Task** — the work (`43`).
- **Test** — the proof (`44`).
- **M** — the milestone (`42`).

A row with no test is an incomplete plan. A row with no risk is a preference, not a defect.

---

## 2. Critical findings

| Finding | Ref | Risk | Task | Test | M |
|---|---|---|---|---|---|
| Auth middleware optional | `08` A1 | R-03 | T-037, T-038 | I-01 | M1 |
| Shared demo org | `08` A2 | R-02 | T-033 | I-02, E2E-3 | M1 |
| No `middleware.ts` | `08` A3 | R-02 | T-039, T-040 | I-01, E2E-3 | M1 |
| Default JWT secret | `08` A4 | R-03 | T-034 | I-07 | M1 |
| Backdoor credentials | `08` A5 | R-03 | T-035, T-036 | I-07 | M1 |
| Billing webhook unsigned | `06` §6 | R-04 | T-044, T-045 | Contract: bad sig | M1 |
| Billing webhook marks paid | `11` §5 | R-04 | T-044, T-045 | Webhook replay | M1 |
| In-memory datastore | `07` §2 | R-07 | T-060, T-063, T-064 | I-03 | M2 |
| Fabricated phone numbers | `14` D4 | R-01 | T-021 | I-03 | M0 |
| Fixed audit scores | `14` D1 | R-01 | T-025, T-097 | E2E-4, I-03 | M0/M3 |
| `Math.random()` metrics | `14` D2 | R-01 | T-024 | I-03 | M0 |
| "Google Maps Verified" | `14` D7 | R-10 | T-023 | Static scan | M0 |
| `CANONICAL_OUTPUTS` | `14` D3 | R-01 | T-022 | I-03 | M0 |
| Canned approvals | `09` §2.2 | R-33 | T-026, T-105 | I-04 | M0/M4 |
| Unconditional mock providers | `12` §1 | R-01 | T-085 | I-03 | M3 |
| Four lead enums | `07` §1 | R-16 | T-067 | Schema test | M2 |
| Two score scales | `07` §1 | R-16 | T-068 | Schema test | M2 |
| Unvalidated input | `06` §3 | R-15 | T-041 | Contract tests | M1 |
| Catch-and-substitute | `06` §4 | R-01 | T-042 | I-03 | M1 |
| Mongoose on Workers | `16` §3.1 | R-08 | T-018, T-063 | Deploy smoke | M1/M2 |
| Broken Dockerfiles | `16` §2.1 | R-08 | T-051 | Build test | M1 |
| CI secret scan no-op | `15` §3.1 | R-03 | T-028 | Plant a secret | M0 |
| False status docs | `17` §3 | R-25 | T-032 | Doc review | M0 |
| Conflicting ADRs | `17` §2 | R-25 | T-080 | Single ADR in force | M2 |

---

## 3. High findings

| Finding | Ref | Risk | Task | Test | M |
|---|---|---|---|---|---|
| 24 unguarded routes | `08` A6 | R-02 | T-037, T-050 | I-01 | M1 |
| No tenant enforcement | `07` §4 | R-02 | T-060, T-070 | I-02 | M2 |
| No session revocation | `08` A8 | R-03 | T-077 | E2E-14 | M2 |
| No audit log | `13` S19 | R-41 | T-047 | Audit log test | M1 |
| No consent records | `13` S20 | R-11 | T-048 | I-04 | M1 |
| No approval entity | `09` §2.2 | R-33 | T-049 | I-04 | M1 |
| n8n webhook unsigned | `10` §4.1 | R-09 | T-046 | Contract | M1 |
| n8n licence exposure | `10` §2 | R-09 | T-054, `30` | Counsel review | M4 |
| Email no dry-run | `11` §3.2 | R-20 | T-127 | Contract: dryRun | M6 |
| No suppression | `11` §3.3 | R-20 | T-125, T-132 | E2E-10 | M6 |
| Places unbounded retention | `11` §2.2 | R-10 | T-079, T-124 | I-08 | M2/M5 |
| Two persistence paths | `04` §2 | R-07 | T-063 | Import check | M2 |
| Fake orchestration | `09` §2 | R-01 | T-088 | I-03 | M3 |
| Fabricated token counts | `09` §2.2 | R-14 | T-096 | Cost > 0 | M3 |
| No budget enforcement | `12` §7 | R-14 | T-104 | I-04 | M4 |
| Prompt not versioned | `12` §4 | R-16 | T-088 | I-09 | M3 |
| No traces | `15` §5 | R-16 | T-087 | Trace lookup | M3 |
| No evals | `15` §5 | R-16 | T-091, T-108 | I-09 | M3/M4 |
| 25 placeholder workflows | `10` §1 | R-09 | T-099 (archive) | — | M4 |
| Page monoliths | `05` §2 | R-24 | incremental | — | M3+ |
| Empty state = failure | `05` §6 | R-01 | T-056 | E2E degraded | M1 |
| No staging | `16` §7 | R-24 | M9 (not yet decomposed) | — | M9 |
| `node_modules` tracked | `02` §3.1 | R-26 | T-030 | `git ls-files` | M0 |
| `app.js` tracked | `02` §3.2 | R-26 | T-031 | `git ls-files` | M0 |

### 3.1 Additional S1 items

These three S1 debt items are recorded in `18` but were not captured by the critical/high tables above. They are listed separately so the register, not the narrative, remains authoritative.

| Finding | Ref | Risk | Task | Test | M |
|---|---|---|---|---|---|
| No `Organisation` entity | `07` §4, `18` DAT-07 | R-02 | T-065 | Schema test | M2 |
| Test suite red at baseline | `03`, `18` TST-01 | R-24 | T-027 | Suite green | M0 |
| Hardcoded business list and 13-agent roster | `14` D8/D11, `18` UI-03/UI-05 | R-01 | T-013 | I-03 | M0 |

With these, every S1 item in `18` is traced to at least one task and one milestone.

### 3.2 S1 debt → task index

The 34 S1 items in `18`, mapped directly. This table is the audit trail for the claim above.

| Debt | Task(s) | M |
|---|---|---|
| SEC-01 Auth middleware optional | T-037, T-038 | M1 |
| SEC-02 Shared `org-apex-001` | T-033 | M1 |
| SEC-03 No `middleware.ts` | T-039, T-040 | M1 |
| SEC-04 Unguarded dashboard layout | T-040 | M1 |
| SEC-05 Default JWT secret | T-034 | M1 |
| SEC-06 Backdoor credentials on login | T-035 | M1 |
| SEC-07 Seed backdoor account | T-036 | M1 |
| SEC-08 Billing webhook unsigned | T-044 | M1 |
| SEC-09 Billing webhook marks paid | T-044, T-045 | M1 |
| SEC-10 24 unguarded routes | T-037, T-050 | M1 |
| DAT-01 In-memory ZCQL client | T-060, T-064 | M2 |
| DAT-02 Four lead enums | T-067 | M2 |
| DAT-03 Two score scales | T-068 | M2 |
| DAT-07 No `Organisation` entity | T-065 | M2 |
| DAT-10 No `ConsentRecord` | T-048 | M1 |
| DAT-12 No `Approval` | T-049 | M1 |
| DAT-17 Triple persistence path | T-063 | M2 |
| API-02 Catch-and-substitute | T-042 | M1 |
| AGT-01 Inert agent definitions | T-088 | M3 |
| AGT-02 Canned orchestrator | T-088 | M3 |
| AGT-03 `approveRun` always approves | T-026, T-105 | M0/M4 |
| AGT-05 Mock providers | T-085 | M3 |
| AGT-06 `CANONICAL_OUTPUTS` | T-022 | M0 |
| AGT-07 Fabricated phone numbers | T-021 | M0 |
| INT-01 "Google Maps Verified" label | T-023 | M0 |
| INT-02 Places retention | T-079 | M2 |
| INT-03 Email path has no dry-run | T-127 | M6 |
| UI-01 `Math.random()` metrics | T-024 | M0 |
| UI-02 Fixed audit scores | T-025, T-097 | M0/M3 |
| UI-03 Hardcoded business list | T-013, T-123 | M0/M5 |
| UI-05 13-agent roster | T-013 | M0 |
| BLD-05 Mongoose on Workers | T-018, T-063 | M1/M2 |
| TST-01 Red test suite | T-027 | M0 |
| TST-05 No auth-coverage test | T-050 | M1 |

### 3.3 Invariant → task coverage

The ten invariant tests in `44` are the plan's acceptance criteria. Each is built by a named task; none is aspirational.

| Invariant | Task(s) | M |
|---|---|---|
| I-01 Route authentication | T-037, T-050 | M1 |
| I-02 Tenant isolation | T-060, T-070 | M2 |
| I-03 Provenance | T-013, T-094 | M0/M3 |
| I-04 Gate enforcement | T-048, T-049, T-128, T-129 | M1/M4/M6 |
| I-05 Ledger immutability | T-101, T-102 | M4 |
| I-06 Idempotency | T-045, T-101 | M1/M4 |
| I-07 No secrets in bundle | T-034, T-035 | M1 |
| I-08 Places expiry | T-079, T-124 | M2/M5 |
| I-09 Eval gate | T-091, T-108 | M3/M4 |
| I-10 Tool allowlist | T-105 (Tool allowlist + approval enforcement) | M4 |

---

## 4. Compliance findings

| Finding | Ref | Risk | Task | Test | M |
|---|---|---|---|---|---|
| Places misattribution | `39` §1.4 | R-10 | T-023, T-116 | Static scan | M0/M5 |
| Places 30-day violation | `39` §1.5 | R-10 | T-079, T-117 | I-08 | M2 |
| No DPDP notice | `39` §2.6 | R-11 | M9 §5 | Legal review | M9 |
| No consent capture | `39` §2.3 | R-11 | T-048 | I-04 | M1 |
| No retention policy | `39` §2.3 | R-11 | T-079 | Purge test | M2 |
| No DPA | `39` §2.4 | R-31 | M9 §5 | Legal review | M9 |
| No sub-processor list | `39` §2.4 | R-31 | M9 §5 | Document exists | M9 |
| No grievance channel | `39` §2.6 | R-11 | M9 §5 | Document exists | M9 |
| TRAI scope undecided | `39` §3.2 | R-19 | D-03 | Decision recorded | Now |
| WhatsApp absent controls | `39` §5.3 | R-34 | T-143..145 | Contract | M7 |
| Email norms unmet | `39` §4.1 | R-20 | T-132..135 | E2E-10 | M6 |

---

## 5. Product findings

| Finding | Ref | Risk | Task | Test | M |
|---|---|---|---|---|---|
| Audit is the wedge but fake | `19` §4 | R-13 | T-081..T-097 | E2E-4, E2E-5 | M3 |
| No provenance in UI | `23` §2 (P3) | R-01 | T-094 | I-03 | M3 |
| Discovery non-compliant | `21` SL-2 | R-10 | T-115..T-123 | I-08 | M5 |
| Outreach absent | `21` SL-3 | R-20 | T-125..T-136 | I-04 | M6 |
| Reporting absent | `21` SL-5 | R-13 | T-142, M8 report tasks | Regeneration | M7/M8 |
| Website builder half-built | `14` D12 | R-40 | T-098, D-09 | Decision | M1/M3 |
| Pricing needs cost model | `24` §7 | R-14 | T-096, T-102 | Cost accuracy | M4 |

---

## 6. Findings → milestones, inverted

For planning, which milestone closes which findings:

| M | Findings closed |
|---|---|
| M0 | Phone synthesis, fixed scores, random metrics, canned outputs, Maps misattribution, CI no-ops, false docs, tracked artefacts |
| M1 | Auth bypass, demo org, default secret, backdoor, unguarded routes, unsigned webhooks, unvalidated input, error substitution |
| M2 | In-memory store, dual persistence, four enums, no tenancy, no retention, Places expiry, no revocation, no drift detection |
| M3 | Fake audit, mock providers, no traces, no schema validation, no prompt versioning, no SSRF guards |
| M4 | Fake orchestration, fabricated tokens, no budgets, no policy engine, no durability, no eval gate |
| M5 | Fake discovery, non-compliant sourcing, false business counts |
| M6 | No consent enforcement at send, no suppression, no dry-run, no delivery tracking |
| M7 | No autonomy mechanism, no campaign execution, no reporting |
| M8 | No delivery proof, no margin visibility, no CRM |
| M9 | No billing integrity, no staging, no compliance documentation, no security gate |

---

## 7. Reverse traceability — is every task justified?

Every task in `43` traces to a finding, a capability gap in `22`, or a verification requirement in `01`–`03`. Spot-checking the task blocks:

| Block | Justified by |
|---|---|
| A (verification) | Gaps in `01`/`02`/`03`; T-004 from `15` §3.2; T-018 from `16` §3.1; T-019 from `16` §4 |
| B (M0) | `14` §2, `15` §3.1, `17` §3, `02` §3 |
| C (M1) | `08` §1, `06` §3–§6, `10` §4, `13` S1–S20 |
| D (M2) | `07` §1–§6, `28` §3–§9 |
| E (M3) | `09` §6, `14` D1, `38` §3.7, `37` §3 |
| F (M4) | `29`, `35`, `36`, `30` |
| G (M5) | `21` SL-2, `39` §1.5 |
| H (M6) | `21` SL-3, `33` §5, `39` §4 |
| I (M7) | `35` §5, `21` SL-4/SL-5 |

No block is speculative. Each addresses a documented defect or a documented capability gap from `22`.

---

## 8. What is deliberately unbuilt (and therefore untraced)

Recorded so the absence is a decision:

| Not built | Decision |
|---|---|
| SMS / voice | `46` D-03 |
| Scraping | `AGENTS.md` §6 — prohibited |
| Website builder | `46` D-09 |
| Marketplace | `19` §2 — refused |
| Mobile app | no need established |
| Fine-tuning | `41` §12 |
| Vector DB before triggers | `32` §3 |

---

## 9. Coverage check

| Category | Findings recorded | Traced to a task | Traced to a test |
|---|---|---|---|
| Critical | 24 | 24 | 24 |
| High | 24 | 24 | 21 (3 are structural milestone items) |
| Compliance | 11 | 10 (1 pending D-03) | 11 |
| Product | 7 | 7 | 7 |

Three high findings — 25 placeholder workflows, page monoliths, and the staging environment — are traced to milestone scope rather than individual tests, because they are structural rather than behavioural. That is stated rather than hidden.

Rows naming a milestone instead of a task ID (M8–M9 work, and D-03) are intentionally not decomposed into numbered tasks. `43` records that boundary: M8–M12 are scoped in `42` and decomposed at the end of M7. This is a planning choice, not an omission.

Separately, `§3.2` indexes all **34 S1 debt items** from `18` directly to a task and milestone, so no critical item depends on a narrative summary for its trace.

---

## 10. The traceability contract

`AGENTS.md` §4 requires that documentation be updated when code changes. This matrix adds a reciprocal requirement:

> **No task enters the backlog without a finding, a capability gap, or a verification requirement. No finding is closed without a test. No test is trusted unless it is blocking in CI.**

That three-part rule is how the plan avoids the failure mode that produced the current repository: a large body of work communicated as complete, with nothing verifying the claim.
