# 36 — Credits, Ledger, and Billing Design

`PROPOSED`. Designed around ZCQL's absence of multi-statement transactions (`28` §5).

---

## 1. Why a ledger and not a balance column

A single `balance` field updated with `balance = balance - 100` is wrong on a store without atomic multi-row operations, because:

- Two concurrent charges can both read the same balance and both write, losing one.
- A retry after a timeout may double-charge with no way to detect it.
- A dispute cannot be resolved because there is no history, only a number.
- A bug corrupts the number permanently with no recovery path.

A ledger solves all four: the append is the truth, the balance is derived, idempotency prevents double-charge, and history resolves disputes.

---

## 2. Entities

```
CreditAccount
  id, orgId, currency
  cachedBalance, cachedReserved, cachedAt        // derived, reconcilable

LedgerEntry                                      // APPEND-ONLY
  id, orgId, accountId,
  type: 'grant' | 'debit' | 'refund' | 'purchase'
      | 'expiry' | 'adjustment' | 'overdraft_grant',
  direction: 'credit' | 'debit',
  amount, currency, unit: 'credit' | 'currency',
  reason, refType, refId,
  idempotencyKey,        // UNIQUE — the whole safety mechanism
  reversesEntryId?,
  createdAt, createdBy, correlationId

CostRecord
  id, orgId, runId?, messageId?,
  provider, model?, tokensIn?, tokensOut?,
  costMinor, currency, occurredAt

Invoice
  id, orgId, periodStart, periodEnd,
  amountMinor, currency,
  status: 'draft' | 'open' | 'paid' | 'void' | 'past_due',
  providerInvoiceId?, paidAt?, reconciledAt?

Payment
  id, orgId, invoiceId, provider, providerPaymentId,
  amountMinor, currency, status, receivedAt, reconciledAt
```

---

## 3. The append-only invariant

### 3.1 Rules

1. `LedgerEntry` is never updated, never deleted.
2. Every entry has a unique `idempotencyKey`.
3. A correction is a new entry with `reversesEntryId` set.
4. Balance is computed as `Σ credits − Σ debits` over entries.
5. `CreditAccount.cachedBalance` is a cache, reconciled hourly, never authoritative.

### 3.2 Idempotency key format

```
<operation>:<subjectId>:<attempt-discriminator>

Examples:
  run:01H8X...:charge
  run:01H8X...:refund
  invoice:INV-2026-11-001:payment
  grant:org_123:2026-11
```

The key is derived from the *business operation*, not from a request ID. Two retries of the same charge produce the same key and therefore one entry.

### 3.3 The charge pattern

```ts
async function charge(ctx, runId, credits) {
  const key = `run:${runId}:charge`;
  try {
    await ledger.append({
      orgId: ctx.orgId, type: 'debit', direction: 'debit',
      amount: credits, unit: 'credit',
      reason: `agent run ${runId}`, refType: 'agent_run', refId: runId,
      idempotencyKey: key, correlationId: ctx.correlationId,
    });
  } catch (e) {
    if (isUniqueViolation(e)) return;   // already charged — success
    throw e;
  }
  await scheduleBalanceRefresh(ctx.orgId);   // best-effort cache update
}
```

### 3.4 Why this is safe without transactions

The unique index on `idempotencyKey` is the serialisation point. Either the insert succeeds (charge applied once) or it fails on the unique constraint (already applied). There is no window in which two entries for the same operation can both exist.

This relies on the uniqueness constraint being enforced by the data store. **This must be verified against Catalyst before building on it** — task T-061 in `43`. If ZCQL cannot enforce a unique constraint, an alternative is a deterministic ID (`hash(idempotencyKey)`) used as the row ID, so a duplicate insert collides on the primary key. That fallback is recorded here because it changes the implementation.

---

## 4. Balance computation

```ts
async function balance(orgId): Promise<number> {
  // For account pages: compute from entries (authoritative)
  const entries = await ledger.findMany({ orgId });
  return entries.reduce((n, e) => n + (e.direction === 'credit' ? e.amount : -e.amount), 0);
}
```

At low volume, computing on read is correct and cheap. At high volume, use the cache and reconcile hourly.

### 4.1 The reconciliation job

```
hourly:
  for each account:
    computed = Σ entries
    if (computed !== cachedBalance):
      alert(founder)
      auditLog.write({ action: 'ledger.mismatch', ... })
      // DO NOT auto-correct
```

**Not auto-correcting is deliberate.** A mismatch means a bug. Silently fixing the cache hides the bug and the next mismatch is bigger. The alert is the product.

### 4.2 Reservation

Before a run, credits are *reserved* (not charged):

```
reserve: INSERT LedgerEntry { type: 'debit', reason: 'reservation',
                             amount: estimated, refType: 'run_reservation' }
settle:  INSERT compensating entry for (estimated − actual)
```

This prevents a run from starting with insufficient balance and overspending, without requiring a mutable hold field.

---

## 5. Cost capture

Every model call and provider call writes a `CostRecord`:

| Source | Fields |
|---|---|
| LLM | provider, model, tokensIn, tokensOut, costMinor |
| Email | provider, costMinor (usually 0 at volume, but record it) |
| WhatsApp | provider, category, costMinor (billable from Oct 2026, R14) |
| Places | provider, requestType, costMinor |
| Compute | estimated allocation per run |

`CostRecord` is the input to margin (`24`) and to credit pricing (`46` D-05).

### 5.1 Cost to credit conversion

```
creditsCharged = ceil(costMinor * markup / creditValueMinor)
```

Parameters are founder decisions (`46` D-05, D-07). The **mechanism** is fixed: cost is recorded as currency, credits are charged as a derived quantity, and the derivation is a single function so it can be changed in one place.

---

## 6. Invoicing

### 6.1 The states

```
draft → open → paid
  │       │
  │       ├→ past_due (dunning)
  │       └→ void
  └→ void
```

### 6.2 Payment reconciliation — the critical correction

Current code marks an invoice `Paid` from an unauthenticated webhook (`11` §5). The correction:

```
webhook received
  ├─ verify signature over raw body        (reject on failure)
  ├─ reject duplicate event ID             (idempotent)
  ├─ fetch the payment from the provider   (never trust the payload alone)
  ├─ match amount, currency, invoice id
  ├─ if match: INSERT Payment + transition invoice to 'paid'
  └─ else: record discrepancy, alert, do not transition
```

**Rule:** the webhook is a *notification*, not an authority. State transitions are based on a provider-side fetch.

### 6.3 Idempotency

`providerPaymentId` is unique. A replayed webhook finds the existing `Payment` and returns `200` without a second transition.

---

## 7. Refunds and reversals

| Case | Mechanism |
|---|---|
| Failed run charged in error | `refund` entry with `reversesEntryId` |
| Customer dispute | `adjustment` entry + `AuditLog` note |
| Provider refund | `Payment` status `refunded` + `credit` ledger entry |
| Credit expiry (if used) | `expiry` entry — never a silent deletion |

No case involves updating or deleting an existing entry.

---

## 8. What the customer sees

| Screen | Shows | Source |
|---|---|---|
| Balance | Current credits, reserved, available | Computed from entries |
| Usage | Per-run charges, grouped by service line | Entries filtered by `refType` |
| Costs | What the platform spent on their behalf | `CostRecord` |
| Invoices | Period, amount, status, link | `Invoice` |
| Ledger | Every entry, immutable, exportable | `LedgerEntry` |

The usage screen is also the margin screen for the operator (`24` §5): revenue and cost per client, side by side.

---

## 9. Failure modes and their handling

| Failure | Handling |
|---|---|
| Duplicate charge attempt | Unique key → no-op |
| Charge succeeds, cache update fails | Cache reconciles within an hour |
| Charge fails, run already executed | Run marked `settlement_pending`; retried; alerted if unresolved in 24h |
| Provider says paid, no `Payment` row | Reconciliation job creates it from a provider fetch |
| Balance cache negative | Alert; ledger is authoritative; investigate |
| Ledger mismatch | Alert; no auto-fix |
| Webhook replayed 100 times | One `Payment`, 99 no-ops |

**The `settlement_pending` state matters:** it is dishonest to mark a run succeeded when it was not charged, and equally dishonest to charge for a run that failed before doing work. The state makes the ambiguity visible rather than resolving it wrongly.

---

## 10. Testing

| Test | Assertion |
|---|---|
| Append same idempotency key twice | One entry |
| Reverse an entry | Balance returns to prior value; original unchanged |
| Sum of entries equals cached balance after N random operations | Property-based test |
| Concurrent charges with same key | Exactly one entry |
| Webhook replay | One payment, one transition |
| Webhook without signature | `400`, no transition |
| Webhook with amount mismatch | No transition, discrepancy recorded |
| Refund of refund | Rejected |
| Negative balance without overdraft | Rejected by policy |
| Reconciliation detects injected mismatch | Alert fired, no auto-fix |

The property-based test in row 3 is the highest-value one: it explores operation sequences a human would not think to try.

---

## 11. Sequencing

| Milestone | Scope |
|---|---|
| M4 | Entities, append, balance computation, cost capture, budget enforcement |
| M4 | Reconciliation job and alerting |
| M6 | Usage screens |
| M9 | Invoicing, payments, provider reconciliation, dunning |

**Billing goes live at M9, not before**, because invoicing a customer requires a defensible cost model (`24`), and the cost model requires M4's cost capture to have been running for months.

---

## 12. Exit criteria (M4)

1. Every model call and provider call produces a `CostRecord`.
2. Every charge is idempotent — proven by test.
3. Balance is derived and reconciles to entries.
4. A mismatch alerts and does not auto-correct.
5. Budget is enforced before the call, not after.
6. `settlement_pending` is visible to operators.
7. No code path updates or deletes a `LedgerEntry` (enforced by the repository having no such method).
