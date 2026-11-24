# 46 — Final Recommendations and Open Decisions

---

## Part 1 — The recommendation

### 1.1 In one paragraph

Adopt **Option A: consolidate, then earn autonomy**. Spend one week removing everything false (M0), two weeks making the system safe (M1), three weeks establishing one authoritative store and real tenancy (M2), then three weeks building the first genuinely useful capability — an audit that is actually an audit (M3). From M3, run design-partner audits under written terms; ship nothing self-serve, and take no payment data, before M9. Do not add any technology from `41` before M3, and do not let a single new surface display a number no system produced.

### 1.2 What to keep

| Asset | Why |
|---|---|
| Visual identity (off-white, charcoal, emerald) | Genuine quality; no change recommended |
| 42-route / 15-page information architecture | Encodes the product shape better than any doc |
| Type safety (both typechecks pass) | Enables fast refactoring |
| OpenNext → Cloudflare Worker build | Works, and matches current platform guidance |
| Catalyst SDK integration point | The right target, once made authoritative |
| Domain vocabulary (leads, audits, campaigns, approvals, credits) | The nouns are correct |
| `AGENTS.md` operating rules | Sound; adopt and enforce |
| `docs/architecture/API_SPECIFICATION.md` | Useful input to contracts |

### 1.3 What to fix

| Item | Effort | Why now |
|---|---|---|
| Auth (5 defects) | 3 days | Blocks any external exposure |
| Webhook signatures | 1 day | Financial integrity |
| CI gates | 2 hours | Currently manufactures false assurance |
| Failing test + status docs | 3 hours | Credibility |
| Input validation | 2 days | Prevents an entire defect class |

### 1.4 What to refactor

| Item | Approach |
|---|---|
| Five page monoliths | Extract **only when** rebuilding that page's data layer |
| Dashboard layout | Client → Server Component (required for auth) |
| Navigation | 15 flat items → 5 groups (one hierarchy level, same styling) |
| `packages/*` duplication | Delete one set |
| n8n workflows | Delete the 25 placeholders |

### 1.5 What to migrate

| From | To | Note |
|---|---|---|
| MongoDB runtime path | Catalyst only | Schema establishment, not migration — there is no data |
| In-memory Catalyst client | Deleted | Silent data loss |
| Synchronous external actions | Durable workflows | M4 |
| Fabricated token counts | `CostRecord` | M3 |
| Hardcoded JWT | Server sessions + rotation | M2 |

### 1.6 What to remove

`CANONICAL_OUTPUTS` · `REALISTIC_BUSINESSES` · `DEFAULT_CAMPAIGNS` · `CANONICAL_13_UI_AGENTS` · `org-apex-001` · default JWT secret · `password123` seed · both Dockerfiles · `backend/node_modules` (tracked) · `backend/app.js` (tracked) · the "Google Maps Verified" label · `Math.random()` metrics · fixed audit scores · 25 n8n placeholders.

### 1.7 What to integrate

In order: **LiteLLM** (M3) → **Langfuse** (M3) → **Temporal** (M4) → optional **LangGraph** (M6, if branching) → optional **Qdrant** (M8, if triggered).

### 1.8 What to build

Audit engine (M3) · durable substrate (M4) · compliant discovery (M5) · consented outreach (M6) · earned autonomy (M7) · reporting (M8) · billing (M9).

### 1.9 What to postpone

WhatsApp (M7, conditional) · CRM sync (M8) · SSO and ReBAC (M10) · enterprise isolation (M10) · platform/multi-agency (M12) · website builder (undecided).

### 1.10 Recommended first milestone

**M0 - Subtraction. One week. Twelve work items, fifteen tracked tasks; eight are deletions or hard-disables.**

Exit criterion: no surface displays a number or record that no system produced.

This is the recommendation because it is the only milestone that costs almost nothing, requires no new technology, requires no decisions from anyone, and removes the majority of the company's legal and reputational exposure. It also has a psychological cost the founder must accept: **the product will look less complete at the end of M0 than it does today.** That is the point.

---

## Part 2 — Open decisions

Fourteen decisions that require the founder. Each has a recommendation, but none can be made by engineering.

### D-01 — Option A (consolidate) or Option B (demo-first)?

**Recommendation:** A.
**Why it is the founder's call:** B produces revenue sooner and is not automatically wrong. But B requires disclosing the synthetic surfaces to every prospect, and a single discovery of fabricated phone numbers is likely terminal.
**If deferred:** no work can start, because M0 assumes A.

### D-02 — Is the product a lead-generation tool or an audit-and-delivery tool?

**Recommendation:** audit-and-delivery first, with lead generation as an adjacent capability once compliant sourcing exists.
**Why it matters:** the compliance analysis (`39` §1.6) shows the lead database cannot be a permanent copy of Places content. That constrains the lead-gen value proposition materially.
**If answered "lead-gen first":** `19`, `20`, `21` require rewriting, and the roadmap reorders.

### D-03 — Exclude SMS and voice permanently?

**Recommendation:** yes, for at least two years.
**Why:** DLT registration, header/template approval, designated number series, traceability chains, and complaint handling are weeks of external process per channel, for channels that are not the product's differentiation.
**If answered "include":** add a compliance workstream before any engineering.

### D-04 — Is WhatsApp in scope at all?

**Recommendation:** conditional at M7, only if customers request it.
**Why:** highest compliance surface, per-message cost from Oct 2026, quality-rating risk, days-long verification.

### D-05 — Credit peg: what is one credit worth?

**Recommendation:** derive from measured cost at M4, not before.
**Why not now:** token counts are currently fabricated. Any peg chosen today is a guess that will be wrong.

### D-06 — Included allowance per package?

Same reasoning as D-05. Requires M4 cost data.

### D-07 — Target gross margin and per-line floors?

**Recommendation:** set a floor and enforce it per service line, not blended (`24` §4).
**Why it is the founder's call:** it determines which service lines are viable and therefore what the product is.

### D-08 — Pass-through provider fees at cost or with margin?

**Recommendation:** at cost, separately itemised.
**Why:** margin on pass-through fees is invisible to customers and, when discovered, reads as a hidden charge.

### D-09 — Website builder: build or remove?

**Recommendation:** decide in M1 to remove it from navigation; delete the page in M3 when the audit surface is rebuilt.
**Why:** a half-built builder with no backend is a dead surface that damages credibility. The navigation decision costs an hour; deleting the route costs another.

### D-10 — Retention periods?

**Recommendation:** adopt `28` §7 as written; legally-required periods are not negotiable.

### D-11 — Which two LLM providers are active at launch?

**Recommendation:** one frontier, one fast/cheap, chosen on measured quality per token at M3. Revoke the other two credentials.
**Why the founder:** it is a cost and dependency decision.

### D-12 — Qdrant trigger thresholds?

**Recommendation:** adopt `32` §3 triggers (p95 > 300ms or > 100k vectors per tenant).

### D-13 — Who is the grievance officer and data protection contact?

**Recommendation:** founder initially, named publicly at M9.
**Why required:** DPDP grievance mechanism and customer security reviews will ask.

### D-14 — Nomination and children's-data posture?

**Recommendation:** refuse children's data by policy (B2B product); defer nomination to M10.

---

## Part 3 — What must be true before Stage B

| # | Condition | Status |
|---|---|---|
| 1 | D-01 answered | **Open** |
| 2 | D-02 answered | **Open** |
| 3 | D-03 answered | **Open** |
| 4 | M0 scope accepted as subtractive | **Open** |
| 5 | Confirmation that no production data exists (T-002) | **Open** |
| 6 | Awareness that the product looks worse after M0 | **Open** |
| 7 | Explicit instruction to proceed | **Open** |

Conditions 1–3 are decisions. 4–7 are acknowledgements and an authorisation. All seven are cheap and all seven are blocking.

---

## Part 4 — What this plan does not claim

Stated so nothing here is over-read:

- **No market validation.** No customer was interviewed, no demand was measured, no TAM appears anywhere.
- **No competitive analysis.** No competitor was researched.
- **No financial projection.** No revenue, cost, or runway figure is asserted.
- **No security certification.** No penetration test was performed.
- **No legal advice.** Every compliance conclusion is `INFERRED` and requires counsel.
- **No live integration testing.** No email, WhatsApp, Stripe, or Maps call was made.
- **No E2E verification.** Playwright was not run.
- **No performance data.** No load test was performed.

Where this plan states a fact, it is labelled. Where it states an opinion, it is marked `PROPOSED` or `INFERRED`.

---

## Part 5 — The single sentence

> **The interface is worth keeping; the interior is not yet real; make it real before making it bigger.**

---

## Part 6 — Approval

Stage B does not begin on the basis of this document. It begins when the founder records:

1. A choice on D-01, D-02, D-03.
2. Acceptance of M0's subtractive nature.
3. An explicit instruction to proceed.

Until then, this corpus is a plan, and the repository remains exactly as audited at commit `d1be212`.
