# 22 — Capability Map

One table per domain: capability → current state → target → milestone → blocking debt.

**State vocabulary:** `ABSENT` · `FAKE` (renders but does not function) · `PARTIAL` · `REAL` · `BROKEN`.

---

## 1. Identity and access

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Sign up / sign in | `PARTIAL` (backdoor) | Credential + OAuth | M1 | SEC-05..07 |
| Session management | `BROKEN` (7-day JWT, no revoke) | Rotating refresh + server session | M2 | SEC-12 |
| Route protection | `ABSENT` | Middleware + server guard | M1 | SEC-03, SEC-04 |
| Organisation entity | `ABSENT` (string constant) | First-class entity | M2 | DAT-07 |
| Membership and roles | `ABSENT` | 5-role model | M2 | DAT-08 |
| Tenant isolation | `ABSENT` | Repository-enforced `orgId` | M2 | SEC-11 |
| Audit log | `ABSENT` | Append-only privileged-action log | M1 | DAT-09 |
| MFA | `ABSENT` | TOTP for owner/admin | M6 | SEC-13 |
| SSO | `ABSENT` | Deferred | M10 | — |

---

## 2. Data and persistence

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Authoritative store | `BROKEN` (3 paths) | Catalyst only | M2 | DAT-01, DAT-17 |
| Schema source of truth | `ABSENT` | Committed manifest + drift check | M2 | DAT-06 |
| Single lead model | `BROKEN` (4 enums) | One enum, one score scale | M2 | DAT-02, DAT-03 |
| Generated types | `ABSENT` | From manifest | M2 | DAT-04 |
| Soft delete / retention | `ABSENT` | `deletedAt` + retention policy | M2 | DAT-15 |
| Consent records | `ABSENT` | Per-channel, scoped, withdrawable | M1 | DAT-10 |
| Validation at boundaries | `ABSENT` | Zod at every route | M1 | API-01 |
| Idempotency | `ABSENT` | Keys on all mutations | M2 | API-06 |

---

## 3. Audit and qualification

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Site crawler | `ABSENT` | Deterministic fetch + parse | M3 | — |
| Check library | `ABSENT` | ~12 checks with evidence | M3 | — |
| Scoring rubric | `FAKE` (fixed scores) | Published formula over checks | M3 | UI-02 |
| Audit persistence | `ABSENT` | `Audit` + `AuditCheck` records | M3 | DAT-06 |
| Audit narrative | `FAKE` (canned) | Model over real findings | M3 | AGT-05 |
| Report rendering | `ABSENT` | Server-rendered, exportable | M3 | — |
| Report regeneration | `ABSENT` | Byte-identical for same data | M3 | — |
| Periodic client report | `ABSENT` | Query over ledger, run log, audit store | M8 | DAT-13 |
| Qualification scoring | `FAKE` | Formula over signals | M5 | SL-1 |
| Ranked prospect list | `FAKE` ("2,847") | Real, paginated, evidenced | M5 | UI-03 |

---

## 4. Agents

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Agent definitions in DB | `ABSENT` (array) | Versioned records | M3 | DAT-11 |
| Model invocation | `ABSENT` (mocks) | Via gateway | M3 | AGT-05 |
| Structured output | `ABSENT` | JSON Schema + validation | M3 | AGT-09 |
| Run persistence | `ABSENT` | `AgentRun` with trace | M3 | DAT-11 |
| Tool layer | `ABSENT` | Typed contracts + permissions | M3 | AGT-10 |
| Budget enforcement | `ABSENT` | Pre-call hard caps | M4 | AGT-11 |
| Approval gates | `FAKE` (always approves) | Server-enforced, recorded | M4 | DAT-12, AGT-03 |
| Traces | `ABSENT` | Langfuse | M3 | AGT-12 |
| Eval sets | `ABSENT` | Golden set per agent | M4 | AGT-13 |
| Earned autonomy | `ABSENT` | Per-capability promotion | M7 | all above |

---

## 5. Outreach and campaigns

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Message drafting | `FAKE` | Model over audit evidence | M6 | AGT-05 |
| Consent gating | `ABSENT` | Hard block on missing consent | M2 | DAT-10 |
| Approval gating | `ABSENT` | Hard block on missing approval | M4 | DAT-12 |
| Email connector | `PARTIAL` (no dry-run) | Full contract + suppression | M6 | INT-03, INT-04 |
| WhatsApp connector | `ABSENT` | Template + window + consent | M7 | INT-05 |
| Send audit trail | `ABSENT` | Provider ID + state | M6 | — |
| Reply handling | `PARTIAL` | Inbox + state machine | M6 | — |
| Campaign state machine | `ABSENT` | Explicit transitions | M7 | SL-3 |
| Sequence execution | `FAKE` (`DEFAULT_CAMPAIGNS`) | Durable workflow | M7 | UI-04, `30` |
| Suppression list | `ABSENT` | Global + per-org | M6 | INT-04 |

---

## 6. Money

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Credit account | `ABSENT` | Per-org balance | M4 | DAT-13 |
| Ledger | `ABSENT` | Append-only double-entry | M4 | DAT-13 |
| Cost capture per run | `FAKE` (tokens) | Real token + currency | M4 | AGT-04 |
| Budget caps | `ABSENT` | Per-run / per-org / platform | M4 | AGT-11 |
| Invoicing | `BROKEN` (unsigned webhook) | Provider-reconciled | M9 | SEC-08, SEC-09 |
| Subscription lifecycle | `ABSENT` | Plan, proration, dunning | M9 | — |
| Margin visibility | `ABSENT` | Per-client cost vs revenue | M9 | ledger |

---

## 7. Workflow and automation

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Durable execution | `ABSENT` | Temporal (see `30`) | M4 | WF-03 |
| Scheduled jobs | `ABSENT` | Cron + durable timers | M4 | — |
| Retry / backoff | `ABSENT` | Policy per activity | M4 | — |
| Long-running audit | `ABSENT` | Survives deploy | M4 | — |
| n8n internal glue | `PARTIAL` | Internal-only, licensed review | M4 | WF-03 |
| Human approval step | `FAKE` | Durable wait-for-signal | M4 | DAT-12 |

---

## 8. Observability

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Structured logs | `ABSENT` | JSON + correlation ID | M2 | API-03 |
| Error tracking | `ABSENT` | Sentry-class | M2 | — |
| Tracing | `ABSENT` | OpenTelemetry | M3 | — |
| Metrics | `ABSENT` | Writes, runs, spend, queue | M3 | — |
| Alerts | `ABSENT` | Error rate, readiness, spend | M3 | — |
| LLM traces | `ABSENT` | Langfuse | M3 | AGT-12 |
| Eval dashboard | `ABSENT` | Per-agent quality | M4 | evals |

---

## 9. Platform and compliance

| Capability | Current | Target | Milestone | Blocks on |
|---|---|---|---|---|
| Staging environment | `ABSENT` | Third environment | M9 | BLD-07 |
| Rollback | `ABSENT` | Versioned, <2 min | M2 | BLD-08 |
| Secret manager | `ABSENT` | Platform secrets + vault | M2 | BLD-10 |
| Schema drift check | `ABSENT` | CI gate | M2 | DAT-06 |
| DPDP notice/consent | `ABSENT` | In-product flows | M2 (consent), M9 (full) | — |
| Data principal rights | `ABSENT` | Export/erase workflows | M9 | — |
| Retention automation | `ABSENT` | Scheduled purge incl. Places 30-day | M2 | INT-02 |
| Breach process | `ABSENT` | Runbook + 72h path | M9 | — |
| Places TOS compliance | `BROKEN` (misattribution) | Place-ID-only persistence | M2 | INT-01, INT-02 |
| Build & deploy | `REAL` (OpenNext → Worker) | Preserved and verified each release | M0+ | — |

---

## 10. Capability readiness summary

| Domain | Capabilities tracked | `ABSENT`/`FAKE`/`BROKEN` | `PARTIAL` | `REAL` |
|---|---|---|---|---|
| Identity & access | 9 | 8 | 1 | 0 |
| Data & persistence | 8 | 8 | 0 | 0 |
| Audit & qualification | 10 | 10 | 0 | 0 |
| Agents | 10 | 10 | 0 | 0 |
| Outreach | 10 | 8 | 2 | 0 |
| Money | 7 | 7 | 0 | 0 |
| Workflow | 6 | 5 | 1 | 0 |
| Observability | 7 | 7 | 0 | 0 |
| Platform & compliance | 10 | 9 | 0 | 1 |
| **Total** | **77** | **72** | **4** | **1** |

One capability out of 77 is real: the application builds and deploys. That number is the most honest summary of the product in this corpus, and it is the number M1–M4 exists to change.

SL-6 (website builder) is intentionally not counted as a capability until `46` D-09 is answered; its only current surface is a dead page.

---

## 11. How to read this map as a plan

The map is not a wish list. Each row has a milestone and a blocking debt item, and the milestones are ordered by dependency, not by appeal. The dependency chain that matters:

```
route protection ──► tenancy ──► authoritative store ──► audit records ──► report
                                                              │
                                                              ▼
                                          consent ──► approval ──► outreach ──► campaign
                                                     │
                                                     ▼
                                              ledger ──► margin
```

Nothing on the right can be built before what is on its left. That is the whole argument of `42`.

---

## 12. Service-line coverage

Every service line in `21` maps to named capabilities above and to a milestone in `42`. SL-6 is the one deliberate exception, because it is not yet a capability.

| Service line | Capabilities in this map | Milestone |
|---|---|---|
| SL-1 Presence Audit | Crawler, check library, rubric, audit persistence, narrative, report rendering, regeneration | M3 |
| SL-2 Prospect Qualification | Qualification scoring, ranked prospect list | M5 |
| SL-3 Compliant Outreach | Message drafting, consent gating, approval gating, email connector, suppression, reply handling | M1 (consent), M4 (approval), M6 (send) |
| SL-4 Campaign Management | Campaign state machine, sequence execution | M7 |
| SL-5 Client Reporting | Periodic client report over ledger + run log + audit store | M8 |
| SL-6 Delivery Workspace | Website builder surface only | Deferred — `46` D-09 |

This table is the product-completeness check: no service line is sold without a capability, and no capability is built without a milestone.
