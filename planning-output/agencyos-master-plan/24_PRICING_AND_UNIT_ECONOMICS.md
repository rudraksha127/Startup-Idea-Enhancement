# 24 — Pricing and Unit Economics Framework

**This document contains no prices, no market sizes, and no financial projections.** None were researched; asserting them would violate the evidence standard in `01`. What follows is the *model* the founder must populate with actuals.

---

## 1. Why a cost model comes before a price

The product's costs are variable and per-action: model tokens, crawls, message sends, Places lookups, storage. A price set before the cost model exists will be wrong in one of two directions:

- **Too low** → each new customer deepens the loss, and growth accelerates the problem.
- **Too high** → the customer compares against manual labour and declines.

Both failures are avoidable with one afternoon of measurement. Today the measurement is impossible because token counts are fabricated (`09` §2.2). That is why cost capture is an M4 deliverable, not a finance afterthought.

---

## 2. Cost components

| Component | Driver | Currently measured |
|---|---|---|
| Model input tokens | Prompt size × calls | **No** — fabricated |
| Model output tokens | Response size × calls | **No** — fabricated |
| Crawl / fetch | Pages per audit | No |
| Places API calls | Lookups per discovery | No |
| Message sends | Email / WhatsApp per contact | No |
| Compute | Worker requests, function duration | Partially (platform) |
| Storage | Records, blobs, traces | No |
| Observability | Trace volume | No |
| Human review | Minutes per supervised action | **No — and this is usually the largest cost** |

### 2.1 The cost everyone forgets

At low autonomy, **human review is the dominant cost**. If a supervised message takes 90 seconds of an operator's time, the marginal cost of that message is dominated by labour, not tokens. A pricing model built on token cost alone will underprice supervised tiers and overprice autonomous ones.

**Consequence:** price by *outcome*, and use the credit ledger to allocate the internal cost of producing it.

---

## 3. The credit unit

`PROPOSED` accounting unit, deliberately abstract so it can be re-pegged as costs change.

```
1 credit = a normalised unit of platform work
```

Credit consumption per action class:

| Action | Credits | Rationale |
|---|---|---|
| Page fetch + parse (per page) | low | CPU-bound, cacheable |
| Deterministic check (per check) | very low | Pure computation |
| Model call — classification | low | Short prompt, short output, cheap model |
| Model call — drafting | medium | Longer output, mid model |
| Model call — synthesis | high | Long context, frontier model |
| Message send | medium + pass-through | Provider fee + platform handling |
| Places lookup | pass-through + margin | Third-party fee |

The ratios are the design; the absolute credit value is a founder decision (`46` D-06).

### 3.1 Why credits rather than per-seat

Per-seat pricing rewards the customer for using the product less. This product's value is proportional to work performed. Credits align the two: a customer who runs 200 audits pays for 200 audits.

Risk: unpredictability. Mitigation — a monthly allowance included in the plan, plus a hard cap that *stops work* rather than silently overbilling. Stopping is honest; overbilling is not.

---

## 4. The margin floor rule

`PROPOSED` decision rule, expressed as a constraint rather than a number:

```
price(outcome) ≥ direct_cost(outcome) / (1 − target_gross_margin)
```

Applied per **service line**, not per account. If audits run at a healthy margin and outreach runs at a loss, the loss is invisible in blended reporting and the customer will buy the loss-making line preferentially.

**Rule:** no service line may be sold below its floor. If a line cannot clear the floor at a competitive price, the line is not viable — not "subsidised for growth". Subsidy without a stated payback mechanism is how agencies die.

Target margin is a founder decision (`46` D-07). This document only insists that a floor exists and is enforced in the product, not in a spreadsheet.

---

## 5. Contribution model

Per customer, per period:

```
Contribution = Revenue
             − model_cost
             − provider_fees            (Maps, email, WhatsApp)
             − infrastructure_alloc     (compute, storage, traces)
             − support_alloc            (minutes × loaded rate)
```

Two properties required for this to be computable:

1. Every model call records tokens and currency cost (`36`).
2. Every provider call records its fee.

Without both, contribution is a guess. The ledger (`36`) exists precisely to make this arithmetic possible.

### 5.1 Worked structure (no numbers)

For a given customer:

- **If** audits are frequent and outreach is heavy → margin is dominated by model + send fees → optimise model routing and template reuse.
- **If** audits are infrequent and review is heavy → margin is dominated by labour → the fix is autonomy (fewer reviews), and pricing must reflect the supervised cost until then.
- **If** provider fees dominate → the fix is caching (within TOS limits, `39`) and batching.

The model tells you *which* lever to pull. It cannot be replaced by a single blended margin number.

---

## 6. Packaging logic

Three packages from `21` §5, priced by capability mix:

| Package | Cost profile | Pricing logic |
|---|---|---|
| Audit | Mostly deterministic compute; low marginal cost | Price near the customer's own price for an audit; margin is high because compute is cheap |
| Pipeline | Adds model drafting + sends | Price per completed contact plus allowance; costs are variable, so the cap matters |
| Workspace | Adds seats and isolation | Seat + usage; the seat component covers support and isolation cost |

### 6.1 The one pricing rule that matters

**Never price on agent count, message volume without a cap, or "unlimited" anything.** Each of these creates an unbounded liability against a variable cost base, and each attracts the customer who consumes most and pays least.

---

## 7. What must be measured before any price is published

| Measurement | Source | Needed by |
|---|---|---|
| Tokens per audit narrative | Gateway telemetry | M3 |
| Token cost per 100 audits | Ledger | M4 |
| Pages crawled per audit (distribution) | Crawler telemetry | M3 |
| Places calls per 100 discoveries | Connector telemetry | M5 |
| Sends per campaign (distribution) | Outreach telemetry | M6 |
| Operator review minutes per action | **Manual time log** | M4 |
| Infrastructure cost per 1,000 runs | Platform billing | M5 |
| Support minutes per account | Support log | M9 |

Items 1–5 and 7–8 require the M3–M9 features. **Item 6 requires only discipline:** someone must record minutes for two weeks. That is the cheapest, highest-value measurement available and can start before any code ships.

---

## 8. Break-even arithmetic (structure only)

```
Fixed monthly cost  = infra + tooling + salaries + compliance
Gross margin %      = (revenue − variable cost) / revenue
Break-even revenue  = fixed monthly cost / gross margin %
Break-even customers = break-even revenue / average revenue per customer
```

Every input is a founder-supplied actual. This document deliberately does not populate them. The formula is included so that when the inputs exist, the answer is mechanical rather than a matter of opinion.

---

## 9. Pricing anti-patterns to avoid

| Anti-pattern | Why it fails here |
|---|---|
| Free tier with full capability | Model costs are real; free users consume them |
| Per-seat only | Rewards low usage of a usage-priced cost base |
| Unlimited messages | Unbounded provider liability + incentivises the behaviour `39` restricts |
| Price matching a scraping tool | Different product; that price cannot cover compliant sourcing |
| Annual prepay with no cap | Customer over-consumes; you cannot stop service without a dispute |
| Discounting to win a logo | Sets a reference price the product cannot recover from |

---

## 10. Decisions this document defers

Recorded in `46`:

| ID | Decision |
|---|---|
| D-05 | Credit peg (currency value of one credit) |
| D-06 | Included allowance per package |
| D-07 | Target gross margin and per-line floors |
| D-08 | Whether pass-through provider fees are billed at cost or with margin |
| D-09 | Whether SL-6 (delivery workspace) is priced at all |

Until D-05 through D-08 are answered, the product should not accept money. Taking payment before the cost model exists means every early customer teaches the wrong lesson.
