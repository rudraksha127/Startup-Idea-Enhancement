# 33 — Integration Hub and Connector Contracts

`PROPOSED`. Replaces the ad-hoc integration surface in `11`.

---

## 1. The contract

Every connector implements exactly this interface. No exceptions, no optional methods, no "just this once".

```ts
interface Connector<Config, Action, Result> {
  readonly provider: string;
  readonly capabilities: readonly Capability[];
  readonly sideEffect: 'external';
  readonly supportsIdempotency: boolean;
  readonly requiresConsent: boolean;

  validateConfig(cfg: Config): Promise<ValidationResult>;
  dryRun(action: Action, ctx: ExecContext): Promise<DryRunResult>;
  execute(action: Action, ctx: ExecContext): Promise<Result>;
  health(ctx: ExecContext): Promise<HealthStatus>;
}
```

### 1.1 The non-negotiable methods

**`dryRun` is mandatory and must not call the provider.** It returns exactly what would be sent, stored as an `OutboxEntry` with status `suppressed_dry_run`. This is the mechanism that satisfies `AGENTS.md` §5 (no uncontrolled external actions) *by construction* rather than by discipline.

**`validateConfig` must not mutate.** It reports whether credentials work, without sending anything to a customer.

**`health` must be cheap.** It is called on a schedule and on demand from the integrations page.

---

## 2. `ExecContext`

```ts
interface ExecContext {
  orgId: string;
  actorId: string;
  correlationId: string;
  idempotencyKey: string;      // REQUIRED — connector must honour or declare it cannot
  approvalId?: string;
  consentId?: string;
  budgetRemaining: number;
  dryRun: boolean;
}
```

### 2.1 Why `idempotencyKey` is required

A retry is inevitable: network failures, workflow restarts, provider 5xx. Without an idempotency key, a retry sends a second message to a real person.

A connector that cannot honour a key must declare `supportsIdempotency: false`, and the hub then wraps it in a dedupe layer that records keys in a `SentKey` table *before* returning success. The wrapper is imperfect (a crash between send and record can duplicate), which is why connectors that natively support idempotency are strongly preferred.

---

## 3. Connector inventory

| Connector | Capabilities | Consent | Idempotent | Milestone |
|---|---|---|---|---|
| `email` (Resend) | send, read events | yes | via `Idempotency-Key` header | M6 |
| `whatsapp` (Cloud API) | send template, send free-form, read | **yes** | via `biz_opaque_callback_data` | M7 |
| `places` (Google) | search, details | no (read-only) | n/a (cacheable) | M5 |
| `crm.generic` | create/update contact, create note | no | via external ID | M8 |
| `storage` | put, get, signed URL | no | yes (key-based) | M3 |
| `llm` | completion | no | dedupe by request hash | M3 |

---

## 4. The `places` connector — TOS-constrained by design

This connector is unusual: the provider's terms dictate the data model (`39`, R13).

```ts
interface PlacesAction {
  kind: 'search' | 'details';
  query?: string;
  placeId?: string;
}

interface PlacesResult {
  placeId: string;             // exempt from caching limits — storable indefinitely
  displayName?: string;        // ≤30 days
  formattedAddress?: string;   // ≤30 days
  phone?: string;              // ≤30 days
  rating?: number;             // ≤30 days
  fetchedAt: string;
  expiresAt: string;           // fetchedAt + 30 days — set by the connector
}
```

**Rules the connector enforces:**
1. `expiresAt` is always set on Places-derived fields.
2. The connector never returns Places content without an expiry.
3. A cache hit past `expiresAt` is a miss — it must refetch or return nothing.
4. No pre-fetching, no bulk harvesting, no scraping. Only user- or workflow-initiated lookups.
5. Attribution metadata is returned alongside results so the UI can display it.

**Why in the connector and not in the service:** TOS compliance that depends on every caller remembering to set an expiry will fail. Compliance that is structurally unavoidable at the boundary will hold.

---

## 5. The `email` connector

### 5.1 Preconditions (all enforced before provider call)

1. `ConsentRecord` granted for `channel=email`, contact, and scope.
2. `Approval` present covering this message.
3. Address not in `Suppression`.
4. Org has a verified sending identity.
5. Budget sufficient.
6. `dryRun` false.

Any failure → typed error, no provider call.

### 5.2 What it records

```
OutboxEntry { messageId, providerMessageId, status, sentAt, errorCode }
```

and on events: `delivered`, `bounced`, `complained`, `opened` (if tracking enabled — and note that open tracking is itself a privacy consideration under DPDP; recommend disabling it by default).

### 5.3 Suppression handling

| Event | Action |
|---|---|
| Hard bounce | Add to `Suppression` immediately |
| Complaint | Add to `Suppression` immediately + alert founder |
| Unsubscribe | Add to `Suppression` immediately |
| Soft bounce | Retry twice, then suppress |

"Immediately" means synchronously in the webhook handler, before returning `200`. A queued suppression is a future violation.

---

## 6. The `whatsapp` connector

The most constrained connector. Preconditions beyond email:

| Precondition | Enforcement |
|---|---|
| Opt-in recorded | `ConsentRecord` with `channel=whatsapp`, `basis` recorded |
| Template approved | `Template` record with `approvalStatus='approved'` |
| Inside 24h window, or using a template | `ContactWindow` record; free-form refused outside window |
| Business verification complete | `Integration.status='connected'` requires it |
| Per-message cost budgeted | Message category known before send; cost reserved |

### 6.1 The window tracker

```
ContactWindow { orgId, contactId, openedAt, expiresAt, lastInboundAt }
```

Updated on every inbound message. A free-form send outside the window is refused with `reason: outside_service_window`, and the UI offers the approved templates instead.

### 6.2 Cost awareness

Research R14: from 1 October 2026, service messages are billable per message after a free monthly allowance, and utility templates inside the window are billable again. **The connector must record the message category** so cost is attributable, because "WhatsApp is free" is no longer true and a cost model built on that assumption would be wrong.

---

## 7. The hub

A thin registry that routes actions to connectors and enforces cross-cutting rules.

```ts
class ConnectorHub {
  async perform(action: Action, ctx: ExecContext) {
    const connector = this.registry.get(action.provider);

    if (ctx.dryRun) return connector.dryRun(action, ctx);

    await this.policy.assertSendable(action, ctx);   // consent, approval,
                                                     // suppression, budget,
                                                     // capability flag
    const key = ctx.idempotencyKey;
    if (await this.sentKeys.exists(key)) return this.sentKeys.result(key);

    const result = await connector.execute(action, ctx);
    await this.sentKeys.record(key, result);
    return result;
  }
}
```

### 7.1 The policy assertion

`assertSendable` is the single gate. It checks, in order, and throws a typed error with a machine-readable reason code:

```
consent_missing | consent_withdrawn | approval_missing |
suppressed | budget_exhausted | capability_disabled |
config_invalid | outside_service_window | template_not_approved
```

The reason code is surfaced in the UI so an operator can fix the cause rather than guess.

---

## 8. Kill switches

Every connector is individually disableable at runtime via `FeatureFlag` (`26` §2.7).

| Flag | Effect |
|---|---|
| `connector.email.enabled` | Refuses all email sends; queues remain |
| `connector.whatsapp.enabled` | Same |
| `connector.places.enabled` | Discovery returns "unavailable" |
| `agent.<key>.enabled` | Agent runs refused |

**Requirement:** disabling must take effect within one request, without a deploy. This is the containment mechanism in `25` SOP-06, and it is the difference between a 30-second incident and a 4-hour one.

---

## 9. Inbound webhooks

All inbound webhooks (email events, WhatsApp events, billing, n8n if retained) follow one pattern:

1. Read the **raw body** (not parsed).
2. Verify HMAC signature over raw body + timestamp.
3. Reject timestamp skew beyond 5 minutes.
4. Reject duplicate event IDs (idempotency).
5. Process.
6. Return `200` only after the state change is persisted.

### 9.1 The current failures

| Current | Problem |
|---|---|
| Billing webhook | No signature at all; marks invoices paid |
| n8n webhook | No signature observed |
| Express body parsing | Raw body unavailable after parsing — the classic reason signature checks get skipped |

**Mitigation for the parsing problem:** capture the raw body in a middleware that runs before JSON parsing, and pass it through. If the framework makes this awkward, that is a reason to fix the framework usage, not to skip verification.

---

## 10. Contract tests

Every connector ships with a contract test suite that any implementation must pass:

| Test | Assertion |
|---|---|
| `dryRun` makes no network call | Provider client is mocked to throw if called |
| `dryRun` records an `OutboxEntry` | Record exists with `suppressed_dry_run` |
| Missing consent is refused | `403` with `consent_missing` |
| Missing approval is refused | `403` with `approval_missing` |
| Suppressed address is refused | `403` with `suppressed` |
| Duplicate idempotency key does not resend | Second call returns first result |
| Signature verification rejects a bad signature | `400`, no state change |
| Kill switch refuses | `403` with `capability_disabled` |

Run against email, WhatsApp, and any future connector. This is the mechanism that prevents the next connector from repeating the current ones' defects.

---

## 11. Exit criteria

M6 is complete when:

1. Email sends only with consent + approval + non-suppressed + budget.
2. `dryRun` is the default in non-production and is proven not to call the provider.
3. Every send has a provider message ID recorded.
4. Unsubscribe adds a global suppression synchronously.
5. Kill switches work without deploy.
6. Contract tests pass for every connector.
7. No connector can be called outside the hub (lint-enforced import boundary).
