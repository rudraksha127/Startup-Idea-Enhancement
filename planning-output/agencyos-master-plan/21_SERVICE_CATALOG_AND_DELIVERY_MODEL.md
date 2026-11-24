# 21 — Service Catalog and Delivery Model

`PROPOSED`. This defines what the business sells and how the software supports delivery. Prices are absent by design — `24` gives the cost model that bounds them.

---

## 1. Service lines

Six lines, ordered by readiness. Each is a product surface, a delivery process, and a set of artefacts.

### SL-1 — Presence Audit

**What the customer buys:** an evidence-backed assessment of a business's web presence, with prioritised fixes.

**Deterministic checks** (no model):
- HTTPS present and valid; HTTP→HTTPS redirect
- Title tag present, length within bounds
- Meta description present, length within bounds
- Mobile viewport declared
- Structured data (`LocalBusiness` / `Organization`) present and valid
- Canonical tag correctness
- Page weight and request count thresholds
- Render-blocking resource count
- Broken internal links (sampled)
- `robots.txt` and `sitemap.xml` presence and validity
- Core Web Vitals proxy from available field/lab data
- NAP (name/address/phone) consistency between site and business listing

**Model role:** write the narrative and prioritised recommendations around the computed findings. Never compute the score.

**Deliverable:** a report with a score, a per-check table with evidence, and a ranked fix list. Regenerable identically from stored evidence.

**Autonomy:** scoring autonomous (deterministic). Narrative drafting supervised until eval thresholds met.

**Current state:** replaced by a fixed score set (`14` D1). **This is the wedge; it must be real first.**

---

### SL-2 — Prospect Qualification

**What the customer buys:** a ranked list of businesses worth approaching, with the reason for each rank.

**Method:** audit score + observable signals (site age indicators, missing booking flow, no mobile optimisation, inconsistent listings) + fit criteria the customer defines.

**Model role:** summarise the reason in one sentence. Ranking is a formula over stored signals.

**Deliverable:** a ranked table with per-row evidence links.

**Autonomy:** ranking autonomous; explanation supervised.

**Legal note:** qualification reads public web pages. No contact, no consent needed for the read. Storage of any Places-derived fields is bounded by `39`.

---

### SL-3 — Compliant Outreach

**What the customer buys:** drafted, consented, approved contact with prospects, with full record of what was sent and why.

**Preconditions enforced by the system (all four, or the send fails):**

1. A `ConsentRecord` covering this channel and this contact.
2. An `Approval` record from a permitted actor.
3. A verified sending identity for the organisation.
4. Available budget/credit for this send.

**Model role:** draft the message from audit evidence. Never decide the recipient, never decide to send.

**Deliverable:** per-contact message history with provider message ID and delivery state.

**Autonomy:** drafting supervised. Sending requires approval until eval thresholds are met for that specific template + segment combination.

**Current state:** absent. `DEFAULT_CAMPAIGNS` are constants (`14` D8); no consent model.

---

### SL-4 — Campaign Management

**What the customer buys:** an organised sequence across many prospects with state tracking.

**Core object:** `Campaign` with `Leads`, sequence steps, per-step send conditions, and a state machine.

**Deliverable:** campaign dashboard with per-step conversion, plus a per-week summary.

**Autonomy:** execution of approved sequences; approval at the sequence level, not per message, once a sequence is approved and consent is verified per contact.

**Dependency:** requires SL-3's consent and approval machinery. Cannot ship first.

---

### SL-5 — Client Reporting

**What the customer buys:** a monthly/periodic report proving what was done, generated from records.

**Principle:** a report is a **query over the ledger, the run log, and the audit store** — never a re-generation by a model.

**Model role:** optional narrative summary with citations to the underlying records.

**Deliverable:** exportable report; identical when regenerated for the same period and data.

**Autonomy:** generation autonomous; narrative supervised.

**Current state:** absent; dashboards show fallback data.

---

### SL-6 — Delivery Workspace (websites, content)

**What the customer buys:** the actual deliverables sold alongside the audit (a landing page, content updates).

**Status:** the current `/website-builder` page has no backend (`14` D12).

**Recommendation:** **defer** and decide explicitly (`46` D-09). A half-built builder is worse than no builder, and this line is the least differentiated part of the offer.

---

## 2. Delivery model per service line

| Line | Human touchpoints | Software does | Human does |
|---|---|---|---|
| SL-1 Audit | Review before send | Crawl, check, score, draft narrative | Review tone, add context, approve |
| SL-2 Qualification | Set fit criteria | Score, rank, evidence | Choose thresholds, sanity-check list |
| SL-3 Outreach | Approve each message (initially) | Draft, queue, send, track | Approve, handle replies personally |
| SL-4 Campaign | Design sequence | Execute approved steps, track state | Design, approve sequence, intervene on replies |
| SL-5 Reporting | Nothing (once configured) | Generate from records | Read, forward to client |
| SL-6 Delivery | Everything | Nothing yet | Everything |

The design intent: **software compresses the middle of the work, humans hold both ends** (what to do, and whether it was good).

---

## 3. Service level definitions

`PROPOSED` internal targets, not customer-facing commitments until M9.

| Service | Trigger | Target completion | Failure mode |
|---|---|---|---|
| Audit | Request | Under 60 seconds p95 for a 20-page site; hard timeout 120 seconds | Explicit failure with reason; never a partial score presented as complete |
| Qualification batch | Request | Under 5 minutes per 100 records | Partial results labelled partial |
| Message send | Approval | Queued within 60 seconds | Retry with backoff; after 3 failures, surface to operator |
| Report | Scheduled | Generated by 06:00 local | Loud alert; no silent empty report |

**Principle:** every service either completes or fails visibly. There is no third state in which it returns something plausible.

---

## 4. What makes the delivery model defensible

Three properties a competitor would have to build, not merely copy:

1. **Evidence chain.** Every number traces to a stored check result. Regeneration is deterministic. This is an engineering property that takes months to retrofit.
2. **Consent architecture.** A send physically cannot happen without a consent record. This is a compliance asset that becomes a sales asset.
3. **Earned autonomy record.** Measured reliability per capability. This is a data asset that compounds.

---

## 5. Packaging

Three packages, defined by **capability mix**, not by volume:

| Package | Includes | Target |
|---|---|---|
| **Audit** | SL-1, SL-2 (limited list size), SL-5 | Solo operator testing the product |
| **Pipeline** | Audit + SL-3 + SL-4 | Operator running active outreach |
| **Workspace** | Pipeline + multiple seats, roles, per-client separation | Small agency |

No package includes SL-6 until the decision in `46` D-09.

**Anti-pattern avoided:** no "unlimited agents" tier. Agent count is not a unit of value; completed work is.

---

## 6. Operational dependencies

| Capability | Depends on |
|---|---|
| SL-1 | Crawler, check library, rubric, report renderer |
| SL-2 | SL-1 output, fit-criteria config |
| SL-3 | Consent store, approval engine, connector with dry-run, sending identity |
| SL-4 | SL-3, campaign state machine, scheduling |
| SL-5 | Ledger, run log, audit store, report renderer |
| SL-6 | Decision, then a builder engine |

Note that SL-5 depends on SL-1's evidence store existing. Reports cannot be honest before audits are.

---

## 7. Catalogue-to-roadmap mapping

| Service | Milestone |
|---|---|
| SL-1 Audit | M3 (checks, narrative, report) |
| SL-2 Qualification | M5 |
| SL-3 Outreach | M6 |
| SL-4 Campaigns | M7 |
| SL-5 Reporting | M8 |
| SL-6 Delivery | Deferred — decision required |

SL-1's narrative and report renderer ship inside M3, not M4: a score without a report is not sellable, and the audit is the wedge. M4 supplies durability, budgets, and gates around it. SL-5 is distinct from the M3 report: it is the recurring client report generated from the ledger and run log, which cannot exist before those records do.

`42` sequences these against the substrate work in M1–M2, which is the precondition for all of them.
