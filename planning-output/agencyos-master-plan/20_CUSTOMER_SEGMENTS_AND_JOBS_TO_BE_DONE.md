# 20 — Customer Segments and Jobs To Be Done

`PROPOSED` throughout. No market sizing, no demand estimates, no segment revenue figures — none were researched and none are asserted.

---

## 1. Segment definitions

Four candidate segments, assessed on fit with the substrate this plan builds.

### S1 — Solo growth operator / freelancer (primary wedge)

**Who:** one person selling lead generation, local SEO, or website services to small businesses. Runs 3–15 clients. Does everything: prospecting, auditing, outreach, delivery, reporting.

**Current tools:** spreadsheets, a CRM they underuse, a scraping tool of dubious legality, Gmail, Canva.

**Pain, in their words:** "I spend Sunday nights writing audit reports." "I don't know which of these 400 leads is worth calling." "My client asked for proof the campaign worked and I sent a screenshot."

**Fit with the product:** very high. The audit wedge is their most time-consuming deliverable, and traceability is exactly what their clients demand.

**Why they churn:** if the product requires setup effort exceeding the time saved in week one. Onboarding must produce a real audit of a real domain in under five minutes.

### S2 — Small agency, 3–15 people (primary expansion)

**Who:** a team with a founder plus 2–10 delivery staff. Multiple concurrent clients. Standardised service packages.

**Pain:** work is duplicated per client; no shared record of what was promised; the founder is the only person who knows the state of every account.

**Fit:** very high on the record-of-work thesis. This segment buys *coordination*, not just automation.

**Why they churn:** if roles and permissions are absent (they need to give juniors limited access), or if they cannot see per-client profitability.

### S3 — Marketing department inside an SMB (secondary)

**Who:** a 1–3 person in-house marketing function at a 20–200 person company.

**Fit:** moderate. They want outcomes, not a production line. They will not learn a workflow builder.

**Consequence:** if pursued, the product needs a "done for you" surface with almost no configuration. Defer to M10+.

### S4 — Large agency / enterprise (out of scope)

**Fit:** low for now. Requires SSO, procurement, security review, SLAs, data residency, and a sales motion the company does not have. Serving them prematurely produces a product optimised for a buyer who is not buying yet.

---

## 2. Anti-ICPs

Explicitly not the customer, so the team can say no:

| Anti-ICP | Why not |
|---|---|
| Anyone wanting bulk cold-email at volume | Requires violating consent norms; destroys sending reputation; conflicts with the consent architecture. |
| Anyone wanting scraped contact lists | `AGENTS.md` §6 and `39`. |
| Enterprise procurement-led buyers | Sales cycle incompatible with current stage. |
| Agencies selling purely on price | They will not pay for traceability; they will pay for volume, which this product refuses to provide. |
| Teams wanting a generic automation canvas | They should use n8n/Zapier/Make directly. |

---

## 3. Jobs to be done

Format: *When ___ , I want to ___ , so I can ___ .* Each job maps to a capability in `22` and a milestone in `42`.

### J1 — Find prospects I can legitimately contact
*When I have a target niche and area, I want to assemble a list of businesses with a recorded source and a lawful contact basis, so I can approach them without risking my domain or my client's reputation.*
→ Capability: Prospect sourcing (compliant). Milestone M5.

### J2 — Know which prospects are worth approaching
*When I have a list, I want each business scored on observable weaknesses with the evidence attached, so I can prioritise the ones I can actually help.*
→ Capability: Audit + qualification. Milestone M3.

### J3 — Produce a deliverable a client will pay for
*When a prospect or client asks "what's wrong with my site", I want a report where every score links to a measured check, so I can charge for it and defend it.*
→ Capability: Audit report. Milestone M3.

### J4 — Approach without harming my reputation
*When I contact a prospect, I want the system to refuse if I lack consent or approval, so I never send something I cannot justify.*
→ Capability: Consent + approval gating. Milestone M1 (consent) / M4 (approval).

### J5 — Follow up without losing track
*When a prospect replies, I want the conversation state, next action, and history in one place, so nothing goes cold because I forgot.*
→ Capability: Outreach state machine. Milestone M6.

### J6 — Prove the work happened
*When a client asks what I did this month, I want a report generated from stored records, so I can answer in minutes and it is always the same answer.*
→ Capability: Reporting from records. Milestone M8.

### J7 — Know what this costs me
*When I run campaigns, I want per-client and per-campaign cost, so I know which clients are profitable.*
→ Capability: Credit ledger + cost attribution. Milestone M4.

### J8 — Let someone else help
*When I hire, I want to give them limited access without exposing every client, so I can delegate without losing control.*
→ Capability: Roles and permissions. Milestone M2.

### J9 — Stop doing the repetitive part myself
*When a task is repeatable and proven, I want the system to do it without asking me each time, so I can spend my hours on the parts that need judgement.*
→ Capability: Earned autonomy. Milestone M7+.

---

## 4. Job priority

Ranked by (frequency × pain × fit with substrate):

| Rank | Job | Rationale |
|---|---|---|
| 1 | J3 — Deliverable a client will pay for | Directly monetisable; deterministic; fixes the worst current fake |
| 2 | J2 — Know which prospects matter | Feeds J3; no external effects; pure value |
| 3 | J6 — Prove the work happened | The retention driver; impossible today |
| 4 | J1 — Compliant sourcing | Necessary but constrained by `39`; do after the audit can consume it |
| 5 | J4 — Approach safely | Required before any outreach feature ships |
| 6 | J7 — Know the cost | Required before pricing (`24`) is defensible |
| 7 | J5 — Follow up | High value, high complexity, needs J4 first |
| 8 | J8 — Delegate | Needed by S2, not by S1 |
| 9 | J9 — Automate the proven | The end state, not the start |

Note the ordering: **the audit comes before sourcing.** This is counter-intuitive (most tools start with lead lists) and deliberate. An audit is verifiable, needs no consent, and produces the evidence that makes sourcing and outreach valuable. Starting with sourcing produces a list nobody can act on and a compliance problem.

---

## 5. Segment-specific success criteria

### For S1 (solo operator)
- Time from signup to first real audit: **under 5 minutes**.
- Time to produce a client-ready report: **under 10 minutes**.
- Weekly active use without prompting.

### For S2 (small agency)
- Two or more people working in the same workspace without stepping on each other.
- Per-client separation visible at all times.
- Founder can answer "what is the state of client X" without asking anyone.

### For S3 (in-house, deferred)
- Not measured until M10.

---

## 6. Willingness-to-pay logic (framework, not a price)

No price is asserted here; `24` gives the cost model that bounds it.

The value argument, in order of strength:

1. **Time replaced.** An audit that takes 45 minutes manually and 2 minutes here is a direct saving the customer can compute themselves.
2. **Deliverable sold.** If the customer charges for audits, the product produces the thing they sell. Willingness to pay tracks their own price, not a SaaS benchmark.
3. **Risk avoided.** A refused send that would have violated consent protects the customer's domain. Hard to price, easy to explain after one near-miss.
4. **Coordination.** For S2, the reduction in "ask the founder" interruptions.

**Weakest argument:** "AI". Do not lead with it. It invites comparison with free tools and commoditises the value.

---

## 7. What would falsify the segment choice

Honest falsification criteria, so the strategy is testable:

1. If S1 operators will not pay for audits because they give them away free to win work, the wedge must shift to J1 (sourcing) — which reopens the compliance difficulty.
2. If S2 agencies will not adopt because roles and permissions are missing, J8 must move earlier than M2.
3. If the audit is not reproducible enough to defend in front of a client, the determinant core must be simplified before any agent work.
4. If compliant sourcing (`39`) proves unable to produce a usable list, the product must position as an **audit and delivery** tool, not a lead-generation tool, and `19` must be rewritten accordingly.

Each is a decision point in `46`.
