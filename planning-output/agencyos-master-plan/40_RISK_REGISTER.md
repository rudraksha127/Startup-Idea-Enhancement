# 40 — Risk Register

42 risks, scored. **Likelihood × Impact**, each 1–5. Score = L×I.

**Bands:** Critical ≥ 16 · High 12–15 · Medium 8–11 · Low ≤ 7.
**Owner:** F = founder, E = engineering, O = operations.

---

## 1. Critical risks (score ≥ 16)

| ID | Risk | L | I | Score | Owner | Mitigation | Kill criterion |
|---|---|---|---|---|---|---|---|
| R-01 | A customer discovers fabricated data or metrics and publicises it | 4 | 5 | **20** | F | Delete fabrication in M0 (`14`); provenance tests | Any synthetic value reaching a customer |
| R-02 | Cross-tenant data exposure via demo-org fallback | 4 | 5 | **20** | E | `34` tenancy design; delete `org-apex-001` | Any 200 response with another org's data |
| R-03 | Account takeover via published credentials or default secret | 4 | 5 | **20** | E | `08` remediation; startup assertions | Any successful auth with a documented credential |
| R-05 | Founder bandwidth insufficient for the plan | 4 | 4 | **16** | F | Milestones independently valuable and stoppable (`42`) | Two consecutive milestones missed with no scope cut |
| R-16 | Agent hallucinates a finding that reaches a client report | 4 | 4 | **16** | E | Citations required + validation; deterministic scores | Any uncited model claim in a delivered report |

### 1.1 Discussion

R-01 through R-03 share a property: **each is currently true, not merely possible.** The product already fabricates data, already leaks across tenants, and already has published credentials. They are scored as risks because they have not yet been *discovered by a customer*. That distinction is the whole of M0 and M1.

R-05 is the practical constraint. The plan mitigates it by making M3 independently valuable — an honest audit product can be sold to design partners before the agent layer exists.

R-16 is placed here rather than among the high risks because a single fabricated finding in a client-facing report reproduces the company's original failure mode at the worst possible moment.

---

## 2. High risks (score 12–15)

| ID | Risk | L | I | Score | Owner | Mitigation |
|---|---|---|---|---|---|---|
| R-04 | Financial manipulation via unsigned billing webhook | 3 | 5 | **15** | E | `36` reconciliation; signature verify |
| R-06 | Runway exhausted before M4 | 3 | 5 | **15** | F | Sequence so M3 (audit) is monetisable alone |
| R-07 | ZCQL uniqueness constraint cannot be enforced → ledger unsafe | 3 | 5 | **15** | E | Verify in M2 (T-061); fallback to deterministic row IDs (`36` §3.4) |
| R-15 | Prompt injection causes an unwanted external action | 3 | 5 | **15** | E | `31` §9 + allowlist enforcement + permanent test |
| R-30 | Audit crawler used for SSRF against internal network | 3 | 5 | **15** | E | `38` §3.7 controls before the crawler ships |
| R-33 | Approval bypass via a code path that skips the hub | 3 | 5 | **15** | E | Import-boundary lint; contract tests |
| R-08 | Mongoose incompatible with Workers → runtime failure in production | 3 | 4 | **12** | E | Resolve in M2 by removing Mongo (`28`) |
| R-09 | n8n licence breach from hosted workflow execution | 3 | 4 | **12** | F | `30` decision; counsel review before any customer-facing use |
| R-10 | Google TOS enforcement action (API suspension) | 3 | 4 | **12** | O | `39` §1.5; delete misattribution in M0 |
| R-12 | Consent model blocks so much outreach that the product has no value | 3 | 4 | **12** | F | Validate with real users at M6; if true, re-position as audit-only (`46` D-02) |
| R-13 | Audit quality insufficient to defend in front of a client | 3 | 4 | **12** | E | Deterministic checks + published rubric; reproducibility test |
| R-14 | Model cost per audit exceeds price | 3 | 4 | **12** | F | Cost capture in M3/M4; margin floor rule (`24` §4) |
| R-18 | Key person dependency on a single engineer | 4 | 3 | **12** | F | Documentation discipline (`17`); ADRs; no undocumented systems |
| R-19 | Scope creep into SMS/voice opens TRAI exposure | 3 | 4 | **12** | F | `39` §3.3 — exclude explicitly (`46` D-03) |
| R-20 | Customer's domain reputation damaged by product-sent email | 3 | 4 | **12** | O | Suppression, caps, complaint-rate auto-pause (`39` §4.2) |
| R-24 | Test suite remains thin, regressions reach production | 4 | 3 | **12** | E | `44` gate; coverage floor |
| R-25 | Documentation drifts back into fiction | 4 | 3 | **12** | F | Generated status (`17` §3.3) |
| R-26 | Secrets leak via logs or traces | 3 | 4 | **12** | E | Redaction; log policy; secret scanning that works |
| R-31 | Sub-processor (model provider) processes customer PII without a DPA | 3 | 4 | **12** | F | DPA before any real customer data; redaction as backstop |
| R-32 | Ledger mismatch from a concurrency bug | 3 | 4 | **12** | E | Idempotency + reconciliation + property tests (`36` §10) |
| R-35 | Free-tier abuse consumes platform spend | 4 | 3 | **12** | E | Platform daily cap (`31` §5) |
| R-42 | The plan itself is too large to execute | 4 | 3 | **12** | F | Milestone independence; explicit stop points |

---

## 3. Medium risks (score 8–11)

| ID | Risk | L | I | Score | Owner | Mitigation |
|---|---|---|---|---|---|---|
| R-11 | DPDP enforcement before controls are built | 2 | 4 | **8** | F | Phased commencement buys time; build consent in M1 |
| R-17 | Temporal operational complexity overwhelms a small team | 3 | 3 | **9** | E | Defer to M4; consider Cloudflare Workflows if ops burden is real |
| R-21 | Cloudflare Worker limits constrain long-running work | 3 | 3 | **9** | E | Workflow service on Node (`27` §2.1) |
| R-22 | Catalyst API rate limits throttle growth | 3 | 3 | **9** | E | Cache + denormalised read models (`28` §6) |
| R-23 | Migration to Catalyst loses data (if any exists) | 2 | 4 | **8** | E | Verify no production data first; export before delete |
| R-27 | Model provider terms change (price, data use, availability) | 3 | 3 | **9** | F | Gateway abstraction; two providers; no single dependency |
| R-28 | A competitor ships the same surface faster | 3 | 3 | **9** | F | Differentiation is evidence + consent, not features (`19` §5) |
| R-29 | Prospect confidence drops because the product looks emptier after M1 | 3 | 3 | **9** | F | Communicate the change; sell the audit that replaces the fake |
| R-34 | WhatsApp quality rating drops, limits revoked | 3 | 3 | **9** | O | Defer WhatsApp to M7; monitor rating |
| R-40 | Customer requests a feature that conflicts with the architecture | 4 | 2 | **8** | F | Refusal list (`19` §2); say no in writing |
| R-41 | Legal review reveals a compliance reading is wrong | 3 | 3 | **9** | F | Counsel review before M9; conservative defaults |

---

## 4. Low risks (score ≤ 7)

| ID | Risk | L | I | Score | Owner | Mitigation |
|---|---|---|---|---|---|---|
| R-36 | Cloudflare pricing change | 2 | 2 | **4** | F | Accept; monitor |
| R-37 | OpenNext breaking change on Next upgrade | 3 | 2 | **6** | E | Pin versions; upgrade deliberately |
| R-38 | Lucide/Tailwind upgrade breaks visual identity | 2 | 2 | **4** | E | Visual regression test at M2 |
| R-39 | Team member leaves mid-milestone | 2 | 3 | **6** | F | Small, documented milestones |

---

## 5. Risk heat map

Counts by cell; IDs listed so the map is auditable rather than illustrative.

| Impact ↓ / Likelihood → | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| **5** | — | — | R-04, R-06, R-07, R-15, R-30, R-33 | R-01, R-02, R-03 | — |
| **4** | — | R-11, R-23 | R-08, R-09, R-10, R-12, R-13, R-14, R-19, R-20, R-26, R-31, R-32 | R-05, R-16 | — |
| **3** | — | R-39 | R-17, R-21, R-22, R-27, R-28, R-29, R-34, R-41 | R-18, R-24, R-25, R-35, R-42 | — |
| **2** | — | R-36, R-38 | R-37 | R-40 | — |
| **1** | — | — | — | — | — |

Everything at impact 5 with likelihood ≥ 3 must be closed or explicitly accepted before a design partner sees the product. That is the M0–M1 mandate.

---

## 6. Risks by milestone

| Milestone | Risks it closes or reduces |
|---|---|
| M0 | R-01 (partial), R-10 (partial) |
| M1 | R-02, R-03, R-33 (partial) |
| M2 | R-07, R-08, R-25, R-26 |
| M3 | R-13, R-14 (partial), R-16 (partial), R-30 |
| M4 | R-04 (design), R-14, R-15, R-24, R-32 |
| M5 | R-12 (validated), R-22 |
| M6 | R-12, R-20, R-31 |
| M9 | R-10, R-11, R-19 (closed), R-41 |

Notable: R-05 (founder bandwidth) and R-42 (plan size) are not closed by any milestone. They are managed by the stop points in `42` §2.

---

## 7. Accepted risks

Explicitly accepted, with rationale, so they are decisions:

| Risk | Acceptance | Review |
|---|---|---|
| R-11 DPDP enforcement timing | Phased commencement; controls built before enforcement | Quarterly |
| R-17 Temporal complexity | Deferred to M4; alternative available | At M4 |
| R-28 competitive speed | Differentiation is evidence, not features | Annually |
| R-36 Cloudflare pricing | Insufficient magnitude to act on | Annually |
| R-39 team change | Mitigated by documentation, not eliminated | Continuous |

---

## 8. Risks the plan does not address

Honest scope limits:

| Not addressed | Why |
|---|---|
| Market risk (nobody wants this) | Requires customer discovery, not engineering. `20` §7 gives falsification criteria |
| Competitive dynamics | Not researched; no claims made |
| Funding risk | Outside the plan's scope; R-06 is the engineering-side mitigation |
| Founder health/burnout | Not an engineering problem, but R-05 and R-42 are its shadow |
| Macro/regulatory changes beyond the four regimes | Monitored, not planned for |
| Brand and reputation risk | Partially addressed by `14`; the rest is a communications problem |

---

## 9. The one risk that dominates

**R-01/R-02/R-03** share a single root cause: *the system was built to look finished rather than to be true.*

Every other risk in this register is manageable with normal engineering. Those three are different: they are already true, they are discoverable by anyone with the repository or a browser, and discovering them ends the company's credibility.

The entire M0–M1 scope exists to convert them from *existing conditions* to *historical notes*. That is three working weeks of work, and it is the highest-return engineering investment available to this business.
