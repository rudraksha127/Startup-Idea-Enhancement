# 10 — n8n and Workflow Automation Audit

**Scope:** `n8n/` (34 files), npm `n8n:*` scripts, `/api/n8n/**` routes.
**All findings `SOURCE-VERIFIED` unless labelled otherwise.**

---

## 1. What exists

| Artefact | Count | Nature |
|---|---|---|
| `n8n/workflows/**` | 25 JSON workflows | Generated from a template |
| `n8n/scripts/generate-workflows.ts` | 1 | Generator |
| `n8n/scripts/validate/validate-workflows.ts` | 1 | Validation |
| `n8n/scripts/import/import-workflows.ts` | 1 | Import |
| `n8n/scripts/deploy/deploy-workflows.ts` | 1 | Deploy |
| `/api/n8n/webhook`, `/trigger`, `/status` | 3 routes | App ↔ n8n bridge |

### 1.1 Workflow anatomy

Each generated workflow contains **four nodes** and placeholder prompt text. A four-node workflow typically comprises a trigger, one HTTP or function node, one model node, and one output node — enough to *look* like an automation, not enough to *be* one.

There is no error branch, no retry policy, no idempotency handling, no credential reference strategy, no sub-workflow composition, and no rate-limit awareness.

### 1.2 Execution evidence

**None.** No execution log, no successful-run artefact, no test that imports and runs a workflow. n8n itself was not contacted during this audit. Status: `BLOCKED` for "does any workflow run".

---

## 2. The licensing constraint — the finding most likely to be missed

Research R3 (17 Nov 2026): n8n is distributed under the **Sustainable Use License**, which is **not** an OSI-approved open-source licence. Its terms permit internal business use and certain non-commercial distribution, but hosting n8n so that third parties can build and run workflows on it — which is the shape of a multi-tenant Agency-as-a-Service product — requires a commercial agreement with n8n.

### 2.1 Why this matters for the business model

If AgencyOS ships agent workflows as n8n workflows executed on n8n infrastructure that AgencyOS operates **for its customers**, the product is not merely "using n8n internally". It is providing n8n as a service.

Three legitimate positions:

| Position | Feasible? | Implication |
|---|---|---|
| n8n as internal-only glue (AgencyOS staff operate it) | Yes | No customer ever touches n8n; no licence concern |
| n8n as the customer-facing automation engine | **No** without commercial licence | Product dependency on a vendor contract |
| n8n self-hosted by each customer | Yes | Shifts ops burden to customer; incompatible with SaaS |

`INFERRED` legal reading. **Requires qualified counsel before any commercial commitment.** Recorded as risk `R-31` in `40`.

### 2.2 Recommendation (`PROPOSED`)

Do **not** make n8n the product's execution engine. Use it, if at all, as internal operational glue for the agency's own back office. The product's durable execution belongs in a runtime that the company controls and can license freely — see `30`.

---

## 3. The generator pattern

`n8n/scripts/generate-workflows.ts` produces workflows programmatically. This is a reasonable idea executed at the wrong abstraction.

**Good:** workflows as code, reviewable in git, reproducible across environments.

**Bad as implemented:**

1. The generator emits near-identical 4-node skeletons. Variation is in prompt text only, so 25 workflows are effectively one workflow with 25 strings.
2. Generated JSON is committed, so the generator and its output can drift silently. Nothing asserts they match.
3. Validation checks structure, not semantics — a valid workflow with a placeholder prompt passes.
4. Deploy scripts can push to a live n8n instance (`n8n:deploy`). Nothing observed gates this on environment or approval.

**Correction (`PROPOSED`):** if n8n survives in any role, the generated JSON becomes a build artefact (not committed), and CI regenerates and diffs it. Deploy requires an explicit environment flag and is never a default script.

---

## 4. The bridge routes

### 4.1 `/api/n8n/webhook`

Inbound from n8n. **No signature verification or shared-secret check observed** (`SOURCE-VERIFIED` absence). On error, an "offline fallback" returns a plausible response (`SOURCE-VERIFIED` string at line 40).

**Impact:** anyone who knows the URL can post arbitrary payloads that the application treats as workflow results. Combined with unguarded routes (`08`), this is an unauthenticated write path into the application's data model.

### 4.2 `/api/n8n/trigger`

Outbound trigger. Unverified whether it requires authentication or whether it will fire on a production n8n instance. `BLOCKED`.

### 4.3 `/api/n8n/status`

Reports n8n reachability. Likely an unauthenticated configuration probe.

**Correction (`PROPOSED`):** HMAC-signed webhooks with timestamp and replay window; per-environment secrets; trigger requires an authenticated operator session plus an approval record when the workflow has external effects; status is authenticated and returns a boolean.

---

## 5. What the workflow layer was meant to do

Reading the workflow names and prompts (`SOURCE-VERIFIED`), the intended automations cluster as:

- Website auditing (fetch page, analyse, produce report)
- Lead enrichment and qualification
- Outreach drafting and sequencing
- Reporting and digest generation
- CRM sync

Every one of these is a **durable, multi-step, externally-effecting** job. They need:

- Persistence across restarts (a deploy must not lose a 40-step audit)
- Retry with backoff on transient failures
- Idempotency so a retried step does not double-send an email
- Human approval gates before external effects
- Per-run cost and rate budgets
- Full trace of every step

n8n provides some of this; none of it is configured. More fundamentally, these requirements are the definition of **durable execution**, which is a different product category (`30`).

---

## 6. Decision required

`PROPOSED` three-way decision, resolved in `30` with reasoning, recorded here as the input:

| Option | Description |
|---|---|
| **A. n8n internal only** | Agency staff use n8n for back-office automations. Product execution is code. |
| **B. n8n as engine + commercial licence** | Product workflows are n8n workflows; pay n8n. |
| **C. Replace with durable execution (Temporal)** | Product workflows are code-level durable functions. n8n removed or kept internal. |

**This plan recommends C, with A as an acceptable interim.** Reasoning: the product's core value is reliability of long-running business processes; that is precisely the guarantee durable execution provides and n8n does not. Plus the licence position is cleaner.

---

## 7. Verdict

| Dimension | Assessment |
|---|---|
| Workflow count | 25 |
| Workflow substance | 4 nodes, placeholder prompts |
| Execution evidence | None (`BLOCKED`) |
| Error/retry/idempotency | Absent |
| Licence position for SaaS | **Requires commercial agreement** |
| Inbound webhook security | **None observed** |
| Deploy safety | Ungated script exists |
| Strategic fit | Poor as product engine; acceptable as internal glue |

The n8n layer is the clearest example in the repository of **quantity substituted for capability**: 25 workflows that look like coverage and provide none. Its most important output for this plan is the licensing finding, which constrains the entire AaaS architecture.
