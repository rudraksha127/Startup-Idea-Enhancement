# 39 — Compliance Framework

**Scope:** Google Maps Platform terms, DPDP Act 2023 + DPDP Rules 2025, TRAI TCCCPR, WhatsApp Business policies.
**Research date:** 17 November 2026.

---

## 0. How to read this document

Everything here is engineering guidance derived from published terms and regulations, with sources recorded. **Every legal conclusion is `INFERRED` and requires confirmation by qualified Indian counsel before it is relied upon commercially.** This document does not constitute legal advice, and no statement in it should be repeated to a customer, regulator, or investor without counsel review.

Where a requirement could not be established, it is marked `BLOCKED` rather than assumed.

---

## 1. Google Maps Platform

### 1.1 The sources

- Google Maps Platform Service Specific Terms (R13).
- Places API policies and attributions documentation (R13).

### 1.2 What the terms permit

| Data | Persistence permitted |
|---|---|
| **Place ID** | **Indefinite** — explicitly exempt from caching restrictions |
| Latitude / longitude from Places | Up to **30 consecutive calendar days** |
| Other Places content (name, address, phone, rating, hours) | Temporary caching only; the service-specific terms treat Places content as cacheable for a limited period and prohibit storage beyond it |
| Attribution | Required wherever Places content is displayed |

### 1.3 What the terms prohibit

- Scraping or pre-fetching Places data (consistent with `AGENTS.md` §6).
- Storing Places content indefinitely.
- Displaying Places content without attribution.
- Using Places content to build a database that substitutes for the API.

### 1.4 The current violations

| Violation | Location | Severity |
|---|---|---|
| Static business registry labelled **"Google Maps Verified"** | `frontend/src/app/api/maps/places/route.ts` | **Critical** — misattribution |
| Design intent to retain discovered businesses indefinitely as leads | `14` D5/D6, lead schema | **High** — caching violation |
| Hardcoded business list presented as found results | `map-explorer/page.tsx` | **High** — misrepresentation |

### 1.5 Required design (implemented in `33` §4)

```
Prospect {
  placeId              // indefinite
  displayName?         // expiresAt = fetchedAt + 30d
  formattedAddress?    // expiresAt
  phone?               // expiresAt
  rating?              // expiresAt
  source: 'google_places'
  firstSeenAt, lastFetchedAt, expiresAt
}
```

Mandatory behaviours:

1. **The connector sets `expiresAt` on every Places-derived field.** It cannot be omitted.
2. **A purge job deletes expired fields daily** and logs what it purged.
3. **The UI displays attribution** wherever Places content appears.
4. **The fallback registry is deleted.** If Places is unavailable, discovery returns `unavailable` — never a static list.
5. **No bulk pre-fetch.** Lookups occur because a user or workflow requested them.
6. **A test asserts** that no code path creates a Places-sourced prospect without an `expiresAt`.

### 1.6 The commercial consequence

The lead database cannot be a permanent copy of Places content. It must be:

- a set of `placeId` references, plus
- data independently sourced (the business's own website, user entry, a licensed data provider), with provenance recorded per field.

This constrains the product: **discovery cannot be sold as "a permanent database of every business in an area"**. It can be sold as "a continuously refreshed view, with your own enrichments persisted". That is a positioning decision for `19`/`46` D-02.

### 1.7 Scraping prohibition

`AGENTS.md` §6 forbids implementing scraping for Google Maps / Places. The audit found no scraping implementation (`SOURCE-VERIFIED` absence). To keep it that way:

- A lint/CI guard: no outbound HTTP to `maps.google.com`, `maps.googleapis.com/place`, or Google Maps HTML endpoints outside the official API client.
- A code-review checklist item.
- A note in `KNOWN_LIMITATIONS.md` explaining why, so a future contributor does not "helpfully" add it.

---

## 2. DPDP Act 2023 and DPDP Rules 2025

### 2.1 Status (R11, 17 Nov 2026)

| Fact | Detail |
|---|---|
| Act passed | 2023 |
| Rules notified | November 2025 (MeitY; PIB announcement 14 Nov 2025) |
| Board established | Provisions relating to the Data Protection Board commenced immediately |
| Core obligations | Phased; widely reported as effective around **May 2027**, eighteen months from notification |

**Critical framing:** the phased commencement is a **grace period, not an exemption**. Building the controls now costs days; retrofitting them into a live system with customer data costs months and creates a disclosure obligation.

### 2.2 Roles

| Role | Who |
|---|---|
| Data Fiduciary | The AgencyOS customer (they determine purpose of processing their prospects' data) — `INFERRED` |
| Data Processor | AgencyOS (processes on the customer's instruction) — `INFERRED` |
| Data Principal | The prospect / contact |

This dual-role structure matters: **the customer is likely the fiduciary, and AgencyOS the processor.** That means the customer carries the primary obligation, and AgencyOS must provide the contractual and technical means for them to meet it. Selling to customers who do not understand this is a support burden and a reputational risk.

**An alternative reading:** for data AgencyOS collects for its own purposes (its own marketing), it is the fiduciary. Both roles coexist.

### 2.3 Obligations mapped to implementation

| Obligation | Interpretation | Implementation | Milestone |
|---|---|---|---|
| Notice | Purpose-specific, itemised, plain language | Consent capture UI with purpose text, versioned | M2 |
| Consent | Free, specific, informed, unambiguous, withdrawable | `ConsentRecord` with `basis`, `scope`, `evidenceRef`, withdrawal path | M1 |
| Purpose limitation | Use only for stated purpose | Consent scope checked at every send (`35` §4.3) | M2 |
| Data minimisation | Collect only what is needed | Redaction (`31` §6); Places field expiry (`39` §1.5) | M2 |
| Storage limitation | Retention periods | Purge job (`28` §7.1) | M2 |
| Accuracy | Reasonable efforts | Correction flows; `lastVerifiedAt` per field | M5 |
| Security safeguards | Reasonable technical measures | `38` controls | M1–M9 |
| Breach notification | To the Board and affected principals | Incident runbook with 72h path (`38` §6) | M9 |
| Grievance redressal | Mechanism and officer | Contact channel + recorded responses | M9 |
| Rights: access, correction, erasure | Mechanisms | Export, edit, soft-delete + purge | M9 |
| Children's data | Verifiable parental consent | **Out of scope** — product is B2B; must refuse use for minors' data | M9 |
| Significant Data Fiduciary duties | DPIA, audits, DPO | Applies to the customer, not typically to a processor; **`BLOCKED`** — depends on scale | M10 |

### 2.4 The processor obligations

As a processor, AgencyOS must:

1. Process only on documented instruction (contract).
2. Assist the fiduciary with rights requests.
3. Implement security safeguards.
4. Notify the fiduciary of breaches.
5. Delete or return data on termination.
6. Permit audit.
7. Not engage sub-processors without authorisation.

**Deliverable (`PROPOSED`, M9):** a Data Processing Agreement template, plus a public sub-processor list (Catalyst, Cloudflare, model providers, email provider, WhatsApp/Meta, Places). The sub-processor list is the artefact most often missing and most often requested in a customer security review.

### 2.5 Cross-border transfer

The Act permits transfer except to countries restricted by the Government. No such restriction list is in force as of the research date (`INFERRED`; `BLOCKED` if a list has been notified since). Providers used (US-based model providers, Cloudflare, Zoho) involve cross-border processing.

**Required:** disclose cross-border processing in the notice; record it in the data-processing inventory.

### 2.6 The honest gaps

| Gap | Status |
|---|---|
| Privacy notice text | **Not written** |
| DPA template | **Not written** |
| Sub-processor list | **Not maintained** |
| Records of processing | **Absent** |
| Grievance officer | **Not designated** |
| DPIA | **Not performed** (may become required if scale triggers SDF status) |
| Consent UI | **Absent** |
| Retention enforcement | **Absent** |

None of these is expensive. All of them are absent. That combination is the finding.

---

## 3. TRAI TCCCPR

### 3.1 The regulatory shape (R12)

The Telecom Commercial Communications Customer Preference Regulations, 2018, amended in **February 2025** (Second Amendment). Key features relevant to this product:

| Feature | Requirement |
|---|---|
| **Consent** | Commercial communication requires consent; explicit digital consent can override DND preferences |
| **Inferred consent** | Permitted in defined relationships (e.g. existing contract), valid for the duration of the relationship — then requires explicit consent |
| **DLT registration** | Senders and templates must be registered on a Distributed Ledger Technology platform |
| **Header/template registration** | Commercial SMS must use registered headers and approved templates |
| **Traceability** | Limited intermediaries between Principal Entity and Telemarketer; messages must be traceable |
| **Designated numbering series** | Commercial calls must use designated series, not ordinary 10-digit numbers |
| **UCC complaints** | Handled via 1909 and the DND app; repeated violations lead to disconnection |

### 3.2 Scope question — `BLOCKED`

TCCCPR governs **telecom** commercial communication (SMS, calls) primarily. Whether it governs email and WhatsApp is a question requiring counsel:

- Email is generally outside TRAI's telecom scope.
- WhatsApp messages traverse telecom networks but are OTT; the regulatory position is less settled (`INFERRED`).
- Voice calls and SMS are clearly in scope.

**Conservative position (`PROPOSED`):** treat any SMS or voice feature as fully in scope; treat WhatsApp conservatively as requiring consent regardless; treat email under separate norms (see §4) plus DPDP.

### 3.3 What this means for the product

| Decision | Consequence |
|---|---|
| Do not build SMS | Avoids DLT registration, header/template approval, and number-series obligations entirely |
| Do not build voice calling | Avoids designated-series and robo-call rules |
| WhatsApp | Build only with consent + template approval + window tracking (`33` §6) |
| Email | Build with consent + suppression, under DPDP and provider policy |

**Recommendation:** **exclude SMS and voice from the roadmap entirely** for the first two years. The compliance burden is disproportionate to the value, and the product's differentiation does not require them.

This is a significant product decision and is recorded as `46` D-03.

### 3.4 If SMS is ever added

Non-negotiable prerequisites:

1. DLT registration as a Principal Entity.
2. Registered headers.
3. Approved templates per use case.
4. Consent records matching DLT consent scope.
5. Traceability through the registered chain.
6. Designated number series.
7. A complaint-handling process with a defined response time.

Each is a weeks-long external process. It is not a feature toggle.

---

## 4. Email norms

Not a single regulator, but three overlapping regimes:

| Regime | Requirement |
|---|---|
| DPDP | Lawful basis; notice; minimisation; rights |
| Provider acceptable-use (Resend and equivalents) | No purchased lists; honour unsubscribes; complaint-rate thresholds |
| General anti-spam expectation | Identification, unsubscribe, honest subject lines |

### 4.1 The product's rules

1. **No purchased or scraped lists.** Enforced by requiring a `source` on every prospect and rejecting sources not in an allowlist.
2. **Consent or a documented legitimate-interest basis** recorded per contact.
3. **Unsubscribe in every message**, honoured synchronously and globally (`33` §5.3).
4. **Identification** of the sender and the customer.
5. **Bounce and complaint handling** with automatic suppression.
6. **Volume caps per org per day**, below provider thresholds.
7. **No misleading subject lines.** A model drafting subject lines must be constrained by a "no false claims" rule and reviewed in the eval set.

### 4.2 The metric that matters

Complaint rate. Provider thresholds are unforgiving and a spike can suspend the sending domain. **The product must monitor complaint rate per org and pause an org automatically above a threshold**, before the provider does it for them. This is a feature, not just a safeguard.

---

## 5. WhatsApp Business Platform

### 5.1 The requirements (R14, 17 Nov 2026)

| Requirement | Detail |
|---|---|
| **Opt-in** | The business must obtain opt-in before initiating contact; must be able to demonstrate it |
| **24-hour customer service window** | Opens/resets on each user message; outside it, only approved templates |
| **Template pre-approval** | Templates reviewed by Meta; categories (marketing, utility, authentication) affect pricing and policy |
| **Business verification** | Required for higher messaging limits; display name approval |
| **Messaging limits** | Tiered by quality and verification; not unlimited |
| **Pricing** | Per-message, per-market; **from 1 October 2026 service messages are billable after a free monthly allowance**, and utility templates inside the window are billable again |
| **Quality rating** | Low quality reduces limits; blocks are a strong negative signal |

### 5.2 What this changes about the economics

A cost model assuming "WhatsApp replies are free" is now wrong. Any WhatsApp feature must:

- Record the message category before send.
- Reserve cost against budget (`36`).
- Attribute cost per org and per campaign.

### 5.3 Implementation requirements (matching `33` §6)

1. `ConsentRecord` with `channel='whatsapp'` and the exact opt-in evidence.
2. Template registry with approval status synced from Meta.
3. `ContactWindow` tracking with 24h expiry.
4. Refusal outside the window for free-form messages.
5. Opt-out honoured immediately.
6. Quality-rating monitoring with automatic pause on degradation.
7. Business verification as a gating prerequisite for enabling the connector.

### 5.4 The honest assessment

WhatsApp is the highest-effort, highest-risk channel in the product. It requires:

- external verification measured in days
- template approval per use case
- per-message cost accounting
- window tracking
- quality monitoring

**Recommendation (`PROPOSED`):** ship email first (M6), prove the consent and approval machinery, and add WhatsApp at M7 only if customers ask for it specifically. Building it in parallel with email doubles the compliance surface for one channel's worth of value.

---

## 6. Cross-cutting compliance controls

| Control | Implementation | Milestone |
|---|---|---|
| Consent store | `ConsentRecord` with scope, basis, evidence | M1 |
| Suppression store | Global, synchronous, permanent | M1 |
| Purpose limitation | Scope check at every send | M2 |
| Retention + purge | Daily job, logged | M2 |
| Data export (access right) | Per-principal export | M9 |
| Erasure | Soft delete + purge, with retention exceptions recorded | M9 |
| Breach runbook | `38` §6 | M9 |
| Sub-processor register | Maintained document | M9 |
| DPA template | Counsel-drafted | M9 |
| Privacy notice | Counsel-reviewed | M9 |
| Grievance channel | Recorded, with response tracking | M9 |
| Attribution | Places content labelled | M2 |
| Places expiry | Connector-set, purge-enforced | M2 |

---

## 7. Compliance posture summary

| Regime | Current | Required by launch | Gap |
|---|---|---|---|
| Google Maps TOS | **Violating** (misattribution, unbounded retention) | Compliant | High but cheap to fix |
| DPDP | **Non-compliant** (no consent, no notice, no retention, no rights) | Compliant | Medium effort, mostly documentation + consent UI |
| TRAI TCCCPR | **Out of scope if SMS/voice excluded** | Stay out of scope | A positioning decision |
| WhatsApp policy | **Not applicable yet** | Compliant before enabling | High effort, deferrable |
| Email norms | **No suppression, no unsubscribe, no dry-run** | Compliant | Medium |

**The cheapest high-value action in this entire document:** delete the "Google Maps Verified" label and stop retaining Places fields beyond 30 days. That is a few hours of work and removes a live terms violation.

**The second cheapest:** build `ConsentRecord` and `Suppression` in M1. They are two small tables that make three of the four regimes tractable.

---

## 8. What must not be claimed

Until the M9 gate passes, the product must not claim:

- "DPDP compliant"
- "GDPR compliant" (not addressed at all in this plan)
- "SOC 2" or "ISO 27001"
- "Enterprise-grade security"
- "Verified business data"

Marketing language that outruns the controls is a legal exposure and, in the case of the current "Google Maps Verified" label, is already one.
