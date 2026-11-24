# 37 — Observability, Evaluation, and AI Quality

`PROPOSED`. Two subjects that are usually separate and should not be: whether the system is *running*, and whether it is *right*.

---

## 1. Two observability problems

| Problem | Question | Tooling |
|---|---|---|
| **Systems observability** | Is it up, fast, and erroring? | Logs, traces, metrics, alerts |
| **AI quality observability** | Is it producing good output? | Traces, eval sets, human feedback |

A product with only the first will be reliably wrong. A product with only the second will be right and unavailable.

---

## 2. Systems observability

### 2.1 Structured logging

Every request and workflow step emits JSON:

```json
{
  "level": "info",
  "ts": "2026-11-17T09:12:44.301Z",
  "correlationId": "01H8X...",
  "orgId": "org_...",
  "actorId": "usr_...",
  "route": "POST /api/audits",
  "status": 202,
  "durationMs": 84,
  "msg": "audit queued"
}
```

Rules:
- No PII in logs. Email addresses are hashed if needed for correlation.
- No secrets, ever.
- `correlationId` propagates from the Worker through the workflow to activities.

### 2.2 Tracing

OpenTelemetry spans:

```
http.request
  └─ service.run_audit
       ├─ repo.create_audit
       ├─ workflow.start
       └─ (workflow) activity.fetch_page × N
                     └─ activity.call_model
                          └─ llm.complete (gateway)
```

This is what makes "why was this audit slow" answerable in seconds.

### 2.3 Metrics

| Metric | Type | Purpose |
|---|---|---|
| `http_requests_total{route,status}` | counter | Traffic and error rate |
| `http_duration_ms{route}` | histogram | Latency |
| `workflow_runs_total{workflow,status}` | counter | Throughput, failure |
| `workflow_duration_ms{workflow}` | histogram | Slow workflows |
| `agent_runs_total{agent,status}` | counter | Agent health |
| `llm_tokens_total{class,provider}` | counter | Volume |
| `llm_cost_minor_total{class,provider}` | counter | Spend |
| `llm_schema_failures_total{agent}` | counter | Output quality signal |
| `connector_sends_total{provider,status}` | counter | Delivery |
| `consent_blocks_total{reason}` | counter | Gate activity — also a compliance metric |
| `ledger_mismatch_total` | gauge | Must be zero |
| `queue_depth` | gauge | Backlog |

The `consent_blocks_total` metric is worth highlighting: the number of sends *refused* is a positive signal, not an error. A product where that counter is always zero is probably not checking.

### 2.4 Alerts

| Alert | Condition | Severity |
|---|---|---|
| High error rate | > 2% 5xx over 5 min | Page |
| Readiness failing | Catalyst probe fails 2× | Page |
| Ledger mismatch | any | Page |
| Spend anomaly | > 200% of trailing 7-day average per hour | Page |
| Platform spend cap hit | any | Page |
| Schema failure spike | > 5% for an agent over 1 hour | Ticket |
| Queue backlog | > 100 for 15 min | Ticket |
| Suppression webhook failing | any 5xx | Ticket |
| Consent block rate drop | > 50% week over week | Ticket (suspicious — suggests a gate bypass) |

That last alert is unusual and deliberate: if the rate of refused sends suddenly drops, the most likely explanation is that a gate stopped working, not that customers became more compliant.

---

## 3. AI quality observability

### 3.1 Langfuse

Research R7 (17 Nov 2026): MIT core, self-hostable, with tracing, prompt management, evaluation, and datasets. Enterprise features (SCIM, audit log, retention policies) are separately licensed and not required.

**Deployment:** self-hosted alongside the workflow service. Components: Postgres, ClickHouse, Redis, object storage.

**Why self-hosted:** traces contain prompts and outputs derived from customer data. Sending them to a third-party SaaS adds a processor to the DPDP inventory (`39`). Self-hosting keeps them in infrastructure the company controls.

### 3.2 What is traced

| Field | Stored |
|---|---|
| Trace ID | Yes |
| `orgId`, `runId`, `agentKey`, `version` | Yes |
| Model, prompt template version | Yes |
| Redacted prompt | Yes |
| Redacted output | Yes |
| Tokens, cost, latency | Yes |
| Schema validation result | Yes |
| Human decision (approved/edited/rejected) | Yes |
| Raw PII | **Never** |

### 3.3 The redaction requirement

Traces are stored for 90 days (`28` §7). A trace containing a customer's email address is personal data with a 90-day retention claim that must be honoured by a purge job, in a system that is not the system of record.

**Simpler and safer: redact at write time.** The gateway redacts before tracing (`31` §6), so the trace never contains PII and the retention question is much smaller.

---

## 4. Evaluation

### 4.1 Eval sets

Per agent, a labelled set:

```
EvalCase {
  id, agentKey, input (JSON),
  expected: { schemaValid: true, mustCite: [...]?, mustNotContain: [...]? },
  rubric: { criteria: [{ name, weight, description }] },
  labelledBy, labelledAt
}
```

| Agent | Cases (target) | What is checked |
|---|---|---|
| `audit.narrative` | 30 | Cites real check IDs; no invented findings; no claims of checks not run |
| `qualify.explain` | 20 | Reason matches the score's dominant signal |
| `engage.draft` | 30 | No fabricated facts; cites the audit; appropriate tone |
| `engage.triage` | 50 | Correct intent label |
| `report.summary` | 20 | Every number matches the source record |

### 4.2 Scoring

Two layers:

1. **Deterministic checks** — schema valid, citations exist, forbidden strings absent, numbers match source. Cheap, exact, run on every commit.
2. **Model-as-judge** — for qualities like tone and helpfulness, using a frontier model with a rubric. Run on a sample, not every change, because it costs money and is itself noisy.

**Rule:** a change cannot be promoted on judge scores alone. Deterministic checks are gating; judge scores are advisory.

### 4.3 The regression gate

```
on prompt/model/schema change:
  1. run deterministic checks on the full eval set   → must be 100%
  2. run judge on a 20% sample                       → must not drop > 2 points
  3. compare cost per case                           → must not exceed +25%
  if any fail: block activation
```

This makes a prompt change as governable as a code change.

### 4.4 The quality dashboard

Per agent:

- runs, schema-valid rate, human rejection rate, material edit rate
- cost per successful run
- latency p50/p95
- eval score trend
- autonomy level and days at that level

This dashboard is what the promotion decision (`35` §5) reads from. It is also what the *customer* sees when the product claims reliability.

---

## 5. Human feedback capture

The most valuable signal is what humans do to model output.

| Signal | Captured when | Stored |
|---|---|---|
| Approved unchanged | Approval | `RunStep` + `Approval` |
| Approved with edit | Approval with diff | Both versions + a similarity score |
| Rejected | Approval rejection | Reason code + note |
| Edited after send | Rare; indicates a gate failure | Alert |

### 5.1 Why the edit diff matters

A high edit rate on an agent means the prompt is wrong, the context is insufficient, or the model class is too cheap. Without the diff, the team knows *that* edits happen but not *what* is missing.

**Implementation:** store `originalBody` and `finalBody`; compute a normalised edit distance; aggregate weekly. Do not store per-character diffs in the primary store — a similarity score plus both bodies is enough.

---

## 6. Incident observability

What must be answerable during an incident, in under five minutes:

1. What is broken? (alert + trace)
2. Since when? (metrics)
3. Who is affected? (orgId filter on errors)
4. What did they experience? (correlation IDs for reported failures)
5. What did we do about it? (audit log of kill switches)

If any of the five requires writing code, the observability layer has failed.

---

## 7. Cost of observability

Stated honestly, because it is often the reason it is skipped:

| Component | Approximate shape |
|---|---|
| Langfuse self-hosted | Postgres + ClickHouse + Redis + object storage; one small cluster |
| OTel collector | One small service |
| Log storage | Volume-dependent; 30-day retention |
| Eval runs | Real model cost, bounded by sampling |

The alternative — debugging a multi-step agent run from `console.warn` — costs more in engineering hours in the first month than the whole stack costs in a year.

---

## 8. Sequencing

| Milestone | Deliverable |
|---|---|
| M1 | Structured logging with correlation IDs |
| M2 | Error tracking; readiness probe; three alerts |
| M3 | OTel tracing; Langfuse for the first real agent; deterministic eval checks |
| M4 | Judge-based evals; regression gate; quality dashboard |
| M5+ | Continuous expansion of eval sets; alert tuning |

---

## 9. Exit criteria

**M3:**
1. Every request has a correlation ID end-to-end.
2. The first real agent emits redacted traces.
3. Deterministic eval checks run in CI and block on failure.
4. Three alerts are live (error rate, readiness, spend).

**M4:**
5. Quality dashboard shows real numbers for every agent.
6. Regression gate blocks a prompt change that degrades output.
7. `consent_blocks_total` is non-zero in a test scenario (proving gates are evaluated).
8. A trace can be found by `correlationId` in under 30 seconds.
