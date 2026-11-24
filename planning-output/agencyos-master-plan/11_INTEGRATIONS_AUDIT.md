# 11 — Integrations Audit

**Scope:** Maps/Places, email (Resend), WhatsApp, Stripe, CRM connectors, and the generic integration surface.
**All findings `SOURCE-VERIFIED` unless labelled otherwise. No live integration was exercised (`BLOCKED` for runtime behaviour).**

---

## 1. Integration inventory

| Integration | Key present in env | Code path | Real call possible | Currently returns |
|---|---|---|---|---|
| Google Maps / Places | Yes (`GOOGLE_MAPS_SERVER_KEY`) | `/api/maps/places` | Yes, if key valid | Real Places results **or** static fake registry |
| Resend (email) | Yes | `/api/outreach/send-test`, outreach send | Yes | Unverified (`BLOCKED`) |
| WhatsApp | Not confirmed | Outreach routes | Unverified | Unverified (`BLOCKED`) |
| Stripe | Yes | `/api/billing/webhook`, invoices | Webhook only | Marks invoices paid without verification |
| Gemini | Yes | none | **No — mock unconditional** | Mock |
| OpenAI | Yes | none | **No — mock unconditional** | Mock |
| NVIDIA NIM | Yes | none | **No — mock unconditional** | Mock |
| OpenRouter | Yes | none | **No — mock unconditional** | Mock |
| n8n | Config unknown | `/api/n8n/*` | Unverified | Fallbacks |
| MongoDB | Yes | Mongoose | Yes | Real or fallback |

The pattern is stark: **credentials exist for ten external services; two are wired to real calls, and one of those is wired incorrectly.**

---

## 2. Google Maps / Places

### 2.1 The dual behaviour

`frontend/src/app/api/maps/places/route.ts`:

- If a key is present: calls the Places API and returns results.
- If absent, or on error: returns a **static "Verified Business Registry"** and labels it **Google Maps Verified**.

### 2.2 Three distinct problems

**(a) Misattribution.** Labelling invented records as "Google Maps Verified" attributes fabricated data to Google. This is a trademark/attribution violation and a misrepresentation to the customer. It is the single most legally exposed string in the codebase.

**(b) Silent substitution.** The caller cannot distinguish a real Places response from the static list. A downstream agent will treat fabricated businesses as real and act on them.

**(c) TOS exposure.** Research R13 (17 Nov 2026): Google's Maps Platform Service Specific Terms permit caching of Places content for at most **30 consecutive calendar days**, with **Place ID exempt** and storable indefinitely. Scraping or pre-fetching is separately prohibited — which is consistent with `AGENTS.md` §6's absolute ban on Google Maps/Places scraping.

Storing a Places-derived business list as a permanent lead database (which is what a lead-generation product does by default) **would violate the caching limit** unless the stored fields are limited to Place ID plus independently-sourced data.

### 2.3 Compliant design (`PROPOSED`)

| Data | Permitted persistence |
|---|---|
| Place ID | Indefinite |
| Name, address, phone, rating, hours | **≤ 30 days**, then delete |
| Any Places content used in output | Must carry Google attribution |

Therefore a lead record created from Places cannot be a durable copy of Places content. It must be:

- `{ placeId, source: 'google_places', firstSeenAt, lastFetchedAt, expiresAt }` plus owner-entered or independently-sourced fields.
- Enrichment (phone, contact name) sourced from the business's own public website or from a licensed data provider, with provenance recorded.
- A scheduled job that purges expired Places-derived fields.

This is a **material design constraint**, not a compliance afterthought: it changes the lead schema. Detailed in `39`.

### 2.4 The `AGENTS.md` rule

`AGENTS.md` §6 forbids implementing scraping for Google Maps / Places. Code review found **no scraping implementation** (`SOURCE-VERIFIED` absence) — the repository uses the official API or a static fake. The rule is currently honoured. The risk is that a future agent, faced with "we need more leads", implements scraping. `39` records this as a standing prohibition with a test-level guard (no outbound request to `maps.google.com` domains outside the official API client).

---

## 3. Email (Resend)

### 3.1 Current state

- Key present in environment.
- `send-test` route exists and can send a real message.
- No dry-run default was observed on the send path (`SOURCE-VERIFIED` absence of a guard).
- No suppression list, no unsubscribe handling, no bounce processing, no rate limit, no per-org sending identity observed.

### 3.2 The AGENTS.md conflict

`AGENTS.md` §5 requires all outbound connectors to default to `dry_run = true`. The email path does not implement a dry-run mode. In a non-production environment, a test click can send a real email from the company's domain.

**Correction (`PROPOSED`):**

1. Every outbound connector implements a `dry_run` flag, default `true` outside production.
2. `dry_run` writes the intended message to an `OutboxEntry` record with status `suppressed_dry_run`, visible in the UI, so operators can review exactly what *would* have been sent.
3. Real send requires: `dry_run=false` **and** an approval record **and** a consent record **and** a verified sending domain.

### 3.3 What is missing for production email

| Requirement | Status |
|---|---|
| SPF/DKIM/DMARC on sending domain | Unknown (`BLOCKED`) |
| Suppression list | Absent |
| Unsubscribe link + honouring | Absent |
| Bounce/complaint webhook handling | Absent |
| Per-org sending identity | Absent |
| Volume caps per org | Absent |

Without these, sending at any volume damages domain reputation, which is a company-level asset that takes months to recover.

---

## 4. WhatsApp

### 4.1 Current state

Outreach routes exist with WhatsApp-related naming. No verified Cloud API integration, no template registry, no opt-in store (`SOURCE-VERIFIED` absence).

### 4.2 Policy requirements (research R14, 17 Nov 2026)

| Requirement | Consequence for design |
|---|---|
| **Opt-in required** before a business initiates contact | A `ConsentRecord` is mandatory, with channel `whatsapp` and the exact scope |
| **24-hour customer service window**; outside it, only approved templates | The system must track window state per contact and refuse free-form sends outside it |
| **Template pre-approval** by Meta | Templates must be registered and their approval status stored; an unapproved template cannot be sent |
| **Per-message pricing**; from 1 Oct 2026 service messages are billable after a free monthly allowance | Cost model must be per-message, per-destination-market; a "free WhatsApp" assumption is now false |
| Business verification and display name approval | Onboarding dependency measured in days, not minutes |

### 4.3 Design implication (`PROPOSED`)

WhatsApp is **not** a drop-in replacement for email. It requires:

- A consent store with per-channel scope and withdrawal handling.
- A template registry synced with Meta approval status.
- A window tracker per contact.
- Per-message cost accounting feeding the credits ledger (`36`).
- Strict refusal when any precondition is unmet — not a fallback, not a warning, a `403` with a reason code.

Specified in `33` and `39`.

---

## 5. Stripe / billing

`frontend/src/app/api/billing/webhook/route.ts`: no signature verification; marks invoices `Paid` (`SOURCE-VERIFIED`). Detailed in `06` §6 and `36`.

Additionally absent (`SOURCE-VERIFIED` absence): customer/price/product mapping, subscription lifecycle handling, proration, dunning, refunds, tax handling, reconciliation job.

**Status:** the billing integration is a stub with a security hole, not a billing system.

---

## 6. CRM connectors

Referenced in prompts and UI. No connector implementation, no OAuth flow, no field mapping, no sync state, no conflict resolution observed (`SOURCE-VERIFIED` absence).

**Recommendation (`PROPOSED`):** CRM connectors are M8, not earlier. They require a stable internal lead model first; syncing an unstable model to a customer's CRM creates cleanup work at the customer's expense.

---

## 7. The generic integration surface

`/api/integrations`, `/api/integrations/test`, `/api/integrations/diagnostics` report configuration state.

Observed behaviour: returns messages such as "Google Maps API key is missing. Verified local business directory fallback active." (`SOURCE-VERIFIED`).

### 7.1 Problems

1. Unauthenticated configuration reconnaissance (`08`).
2. The message **normalises the fallback** — it presents fake data as an acceptable operational mode rather than a failure.
3. There is no persisted `Integration` entity, so there is no record of when a connection was established, by whom, or with which credentials.

**Correction (`PROPOSED`):** an `Integration` entity with `orgId`, `provider`, `status` (`connected`/`error`/`not_configured`), `connectedAt`, `connectedBy`, `lastCheckedAt`, `lastErrorCode` — never storing secrets in the entity (secrets live in a secret manager, referenced by key). Diagnostics requires owner role.

---

## 8. Connector contract (`PROPOSED`)

Every connector, without exception, implements:

```ts
interface Connector {
  readonly provider: string;
  readonly capabilities: Capability[];       // e.g. ['send_message','read_inbox']
  readonly requiresConsent: boolean;

  validateConfig(): Promise<ValidationResult>;
  dryRun(action: Action): Promise<DryRunResult>;  // must not call provider
  execute(action: Action, ctx: ExecContext): Promise<Result>;
  health(): Promise<HealthStatus>;
}
```

`ExecContext` carries `orgId`, `correlationId`, `idempotencyKey`, `approvalId`, `budgetRemaining`, and a `dryRun` flag. A connector that cannot honour `idempotencyKey` must declare it and be wrapped in a deduplicating layer.

Detailed in `33`.

---

## 9. Verdict

| Integration | Real | Safe | Compliant | Verdict |
|---|---|---|---|---|
| Google Maps/Places | Partial | No (fake labelled verified) | **No** (misattribution; cache limit unaddressed) | Rebuild |
| Resend email | Yes | No dry-run, no suppression | No | Rebuild |
| WhatsApp | No | — | No consent/template model | Build from scratch |
| Stripe | Webhook only | **No signature check** | No | Rebuild |
| LLM providers | **No — mocks** | N/A | N/A | Wire via gateway |
| CRM | No | — | — | Defer to M8 |

Nine integrations are referenced; zero are production-ready. The pattern repeats from `09`: the surface exists, the substance does not, and in two cases the substitute actively misrepresents reality.
