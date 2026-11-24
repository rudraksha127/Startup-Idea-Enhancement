# 14 — Synthetic Data and Trust Integrity Audit

**This document is the product-integrity core of the audit.** Every other defect degrades the product. This one corrupts the customer's business.

---

## 1. Definition

A **synthetic surface** is any UI element or API response that presents computed-looking information which was not computed from a real source. Not "demo data" — demo data is labelled. A synthetic surface is unlabelled and indistinguishable from truth.

---

## 2. Complete inventory

| # | Surface | File | Mechanism | What the user believes | Reality |
|---|---|---|---|---|---|
| D1 | Audit scores | `frontend/src/app/api/leads/[leadId]/audit/route.ts` | Fixed set `68/54/46/42/78/88` for every lead | "My website scored 68" | Same numbers for every lead, always |
| D2 | Audit dashboard metrics | `frontend/src/app/(dashboard)/audits/page.tsx` | `Math.random()` | "These are my audit metrics" | Random on each render |
| D3 | Agent run outputs | `frontend/src/app/api/agents/[id]/run/route.ts` | `CANONICAL_OUTPUTS[id]` | "The agent analysed my data" | Pre-written text |
| D4 | Discovered phone numbers | same file | Synthesised numbers | "These are qualified leads' phone numbers" | Invented digits |
| D5 | Business list | `frontend/src/app/(dashboard)/map-explorer/page.tsx` | `REALISTIC_BUSINESSES` constant | "2,847 businesses found" | Fixed constant array |
| D6 | Business count | same file | Hardcoded "2,847" | "The market has 2,847 prospects" | A string literal |
| D7 | Places fallback | `frontend/src/app/api/maps/places/route.ts` | Static registry labelled **"Google Maps Verified"** | "These are verified Google businesses" | Invented records, attributed to Google |
| D8 | Campaign list | `frontend/src/app/(dashboard)/outreach/page.tsx` | `DEFAULT_CAMPAIGNS` | "These campaigns exist" | Constants |
| D9 | Agent catalogue | `frontend/src/app/(dashboard)/ai-agents/page.tsx` | `CANONICAL_13_UI_AGENTS` | "13 agents are available" | 13 stubs, none execute |
| D10 | Token/cost figures | `backend/src/modules/agents/agent-orchestrator.ts` | Fabricated constants | "This run cost X tokens" | Invented |
| D11 | Approvals | same file | `approveRun` returns canned success | "A human approved this" | No human, no record |
| D12 | Website builder | `frontend/src/app/(dashboard)/website-builder/page.tsx` | No backend | "I built a site" | Nothing persists |
| D13 | Integration status | `/api/integrations*` | Describes fallbacks as operational | "The system is configured" | Partially unconfigured |
| D14 | Empty-state substitution | ~10 API routes | `catch → return []` | "You have no leads" | The database is unreachable |

---

## 3. The three most serious

### 3.1 D4 — Fabricated phone numbers

This is the worst single item in the repository, worse than the auth findings in commercial terms, because it causes third-party harm.

A lead-generation product that invents phone numbers will:

1. Export them to the customer's CRM.
2. Enter them into a dialler.
3. Cause real people to be called who never had any connection to the business.
4. Generate complaints, possibly TRAI complaints (`39`), and reputational damage to the customer.
5. Be attributed to the customer, not to AgencyOS.

The customer's recourse is to leave, publicly. There is no recovery from being the vendor that supplied fake leads to a sales team.

**Immediate action (`PROPOSED`, M0 day 1):** remove the phone synthesis. If a phone number is not present in a verified source, the field is `null`, and the UI shows "not available". A null is honest; an invented number is a liability.

### 3.2 D7 — "Google Maps Verified"

Two harms in one string:

1. **Misattribution.** Invented records are attributed to Google. This is a trademark and misrepresentation issue independent of any data-protection question.
2. **False assurance.** "Verified" tells the user that a human or a system confirmed the business exists. Nothing did.

**Immediate action:** the fallback list is either deleted or relabelled unambiguously as "sample data — not real businesses", and it must not be returned by an API that a real workflow consumes.

### 3.3 D1/D2 — Audit scores

The product sells audits. A fixed score set and `Math.random()` mean the audit product does not exist.

Two distinct consequences:

- **Commercial:** a customer comparing two leads sees identical scores and concludes the tool is fake. This is the fastest possible way to lose a technical buyer.
- **Product:** without real scoring there is no signal to improve, and no basis for pricing audits.

**Correction:** audits become deterministic pipelines (`09` §6): fetch the page, run measurable checks (HTTPS present, title length, meta description, mobile viewport, page weight, structured data, broken links, LCP proxy), store each check's evidence, compute the score from a published rubric. The model writes the narrative around real findings; it never produces the score.

---

## 4. Why this happened — a diagnosis, not an accusation

Three mechanisms produced the inventory above. Understanding them prevents recurrence.

### 4.1 The fallback culture

Every API route has a `catch` that returns plausible data (`06` §4). Once a fallback exists, the difference between "real" and "fallback" is invisible to both developer and user. The fallbacks were almost certainly added to make demos work. They then became the product.

### 4.2 The demo deadline

`audits/page.tsx` using `Math.random()` is the signature of a feature built to look finished for a specific meeting. It was never replaced because nothing forced replacement — no test asserted the values were stable, no customer complained because the numbers looked plausible.

### 4.3 Absence of a truth test

There is no test anywhere in the suite that asserts "this number came from this source". The 71 passing tests validate pure functions. Nothing validates provenance. A system without provenance tests will accumulate synthetic surfaces, because synthetic surfaces are cheaper than data pipelines and pass every test that exists.

### 4.4 The correction that prevents recurrence

A single architectural rule, enforced by test:

> **No response field may contain a value that cannot be traced to a persisted record or a deterministic computation over persisted records.**

Implementation: every API response carries a `_meta` block with `{ source: 'db'|'computed'|'provider', correlationId, generatedAt }`. A contract test asserts the block is present and that `source` is never `'synthetic'` in production builds.

---

## 5. Commercial disclosure requirement

If the founder chooses to keep any synthetic surface for demonstration (Option B in `00` §7), each must be:

1. Behind `DEMO_MODE`, compiled out of production builds.
2. Rendered with a persistent, non-dismissible banner: *"Demonstration data — not real businesses, scores, or results."*
3. Excluded from any export, API response, or CRM sync.
4. Listed in a `DEMO_DISCLOSURE.md` given to any prospect who sees a demo.
5. Reviewed before every demo to confirm the list is current.

Anything less converts a demo into a misrepresentation, which is a legal exposure in addition to a commercial one.

---

## 6. Remediation sequence

| Order | Action | Effort | Milestone |
|---|---|---|---|
| 1 | Delete phone synthesis (D4) | 1h | M0 |
| 2 | Remove "Google Maps Verified" label and the fake registry from API responses (D7) | 2h | M0 |
| 3 | Delete `Math.random()` metrics; render empty state (D2) | 2h | M0 |
| 4 | Delete `CANONICAL_OUTPUTS`; agent run returns `501 Not Implemented` until real (D3, D10) | 3h | M0 |
| 5 | Make `approveRun` return `501` or remove the endpoint (D11) | 1h | M0 |
| 6 | Convert empty-state substitution into explicit degraded state (D14) | 2d | M1 |
| 7 | Delete `REALISTIC_BUSINESSES` / `DEFAULT_CAMPAIGNS` / count literals (D5, D6, D8) | 4h | M1 |
| 8 | Rebuild audits as deterministic pipeline (D1) | 5d | M3 |
| 9 | Rebuild agents as real runtime (D3, D9) | see `29` | M3–M7 |
| 10 | Build website-builder or remove the route (D12) | decision in `46` | M8 or never |

Note that steps 1–5 total roughly **one working day** and remove the majority of the legal and reputational exposure. There is no reason to defer them.

---

## 7. Trust as the product's only durable asset

An agency-as-a-service product sells one thing: the customer's confidence that work was done and reported accurately. Every synthetic surface spends that asset. The interfaces in `/audits` and `/map-explorer` look expensive to build and are worth less than nothing, because a customer who discovers one fake number will assume all numbers are fake — including the ones that are real.

This is why `00` recommends subtraction before addition. A smaller product that never lies is worth more than a larger one that sometimes does.

---

## 8. Verdict

| Dimension | Assessment |
|---|---|
| Synthetic surfaces identified | 14 |
| Directly harmful to third parties | 1 (D4) |
| Legally exposed | 1 (D7) |
| Undermining a core product claim | 4 (D1, D2, D3, D9) |
| Time to remove the worst 5 | ~1 day |
| Tests preventing recurrence | None |

**Recommendation:** treat every item in §2 as a defect of the highest severity regardless of the effort to fix it. The effort is small precisely because the features do not exist. The exposure is large because the features appear to.
