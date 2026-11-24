# 06 — Backend and API Audit

**Scope:** `backend/` (209 files) and `frontend/src/app/api/**` (42 route handlers).
**All findings `SOURCE-VERIFIED` unless labelled otherwise.**

---

## 1. Two backends, one product

The repository contains **two** server implementations that both claim to serve the same domain:

| | `backend/` (Express 5) | `frontend/src/app/api/**` (Next.js route handlers) |
|---|---|---|
| Framework | Express 5 | Next.js App Router |
| Persistence | Catalyst ZCQL (+ in-memory fake) | Mongoose + fetch to Express |
| Auth | Optional middleware, demo-org fallback | Per-route `getCurrentUser`, demo-org fallback |
| Validation | Partial | Minimal |
| Deployment | Separate service ("AppSail") | Part of the Worker |

Neither is authoritative. Routes in the Next app *call* the Express API and *also* write to MongoDB directly. This is the structural defect from which most backend findings follow.

---

## 2. Route inventory (42 handlers)

| Domain | Routes | Notes |
|---|---|---|
| Auth | `login`, `logout`, `register`, `me` | Backdoor credentials; default JWT secret |
| Leads | list/create, `[leadId]`, `[leadId]/audit`, `[leadId]/notes`, `[leadId]/outreach`, `import`, `export` | Fixed audit scores; fabricated phone numbers on discovery |
| Agents | list, `[id]/run` | Canned outputs |
| Outreach | `campaigns`, `campaigns/[id]`, `inbox`, `ai-reply`, `send-test` | `send-test` can send real email if configured |
| Maps | `places`, `status` | Fake registry when key absent |
| Billing | `invoices`, `webhook` | **Webhook unauthenticated** |
| Dashboard | `metrics`, `activity` | Fallback data |
| Analytics | `overview` | Fallback data |
| Teams | `members`, `members/[id]`, `invite` | Offline fallback |
| Clients | list, `[id]` | AppSail fallback |
| Projects | list | AppSail fallback |
| Templates | list | Offline fallback |
| Integrations | `route`, `test`, `diagnostics` | Diagnostics surface leaks config presence |
| n8n | `webhook`, `trigger`, `status` | No signature verification observed |
| System | `health`, `search`, `notifications`, `settings` | `settings` keyed to a hardcoded email |

---

## 3. Validation

`zod` is a direct dependency (`SOURCE-VERIFIED` `package.json`), yet the majority of route handlers accept `await req.json()` and pass the object into Mongoose or a service without a schema parse. Examples observed across leads, outreach, teams, clients, projects, templates.

### 3.1 Why this is a release blocker, not a code-quality note

Without validation:

- A client can send arbitrary field names into `findOneAndUpdate`, which in Mongoose can be an operator-injection surface depending on how the filter is constructed.
- Status fields accept any string, compounding the four-enum problem in `07`.
- Numeric fields accept `NaN`, negative values, and strings, which corrupts any downstream aggregate (scores, credits, invoice totals).
- No request is ever rejected for being malformed, so the API has no contract in practice.

`INFERRED` risk: operator injection is *possible* wherever a filter is built from request body keys; a targeted review is required in M1 rather than assuming exploitability.

**Correction (`PROPOSED`):** every route begins with `schema.safeParse(body)`; on failure return `400` with field-level errors; the parsed value — never the raw body — flows onward. Specified in `33`.

---

## 4. Error handling

Observed pattern across routes:

```ts
try {
  // real work
} catch (err) {
  console.warn("... fallback ...", err);
  return NextResponse.json(fallbackData);
}
```

### 4.1 The three defects in this pattern

1. **Errors become data.** A database outage is reported to the UI as a valid, complete response.
2. **Errors are swallowed.** No error boundary, no alerting, no correlation ID, no status code. `catch` here is not error handling; it is error concealment.
3. **The fallback is indistinguishable from a real result**, which is precisely the mechanism that produced the fabrication findings in `14`.

**Correction (`PROPOSED`):** a single `withApiHandler` wrapper that (a) generates a correlation ID, (b) maps known error types to status codes, (c) logs structured errors, (d) never substitutes data. Fallbacks are permitted only behind an explicit `DEMO_MODE` flag that is compiled out of production builds.

---

## 5. Auth on the backend

`backend/src/middleware/auth.ts` — authentication is optional; requests without a token proceed. `backend/src/common/resolve-org.ts` — a `DEFAULT_ORG_ID = "org-apex-001"` binds unresolved requests to a shared demo organisation.

### 5.1 The compound failure

Either defect alone is serious. Together they mean:

- An anonymous request is authenticated as *something*.
- That something is a **shared** organisation.
- Every tenant that fails to resolve lands in the same organisation.

This is a cross-tenant data exposure of the most direct kind: not a subtle IDOR, but a shared default bucket. Whether real tenant data currently exists in that bucket is `BLOCKED` (no database access), but the code provides no protection if it does.

### 5.2 Correction (`PROPOSED`)

- Auth middleware rejects unauthenticated requests with `401` by default; an explicit `@Public()` decorator is required to opt out, and the set of public routes is enumerated in one file and tested.
- `resolveOrg` throws on missing org; there is no default. Tested by a test that asserts anonymous access returns `401` for every non-public route (see `44`).
- `org-apex-001` is deleted from the codebase, not merely unused.

---

## 6. The billing webhook

`frontend/src/app/api/billing/webhook/route.ts` (`SOURCE-VERIFIED`):

- Accepts `POST` with no signature verification.
- On receipt, marks invoices as `Paid`.

### 6.1 Impact

An unauthenticated caller can mark any invoice paid. This is a direct financial-integrity break. In a live deployment it is both a fraud vector and an accounting-corruption vector. Stripe (and any competent payment provider) signs webhooks precisely to prevent this.

### 6.2 Correction (`PROPOSED`)

1. Verify the provider signature against the raw request body (not the parsed body — a subtle and commonly-broken detail).
2. Reject on missing/invalid signature with `400`, and log the attempt.
3. Enforce idempotency by event ID so replay is harmless.
4. Never mark an invoice `Paid` from a webhook alone; reconcile against a provider-side retrieval of the payment intent.
5. Gate the whole path behind a `payments_enabled` flag that is false until M9.

Detailed in `36`.

---

## 7. The n8n webhook and trigger routes

Three routes (`webhook`, `trigger`, `status`) interface with n8n. No signature verification or shared-secret check was observed on the inbound webhook (`SOURCE-VERIFIED` absence).

**Correction (`PROPOSED`):** inbound webhooks carry an HMAC signature and a replay-resistant timestamp; the shared secret is per-environment; unsigned requests are rejected before any workflow dispatch. Specified in `33`.

---

## 8. The integrations diagnostics route

`/api/integrations/diagnostics` and `/api/integrations` report on configuration state. In their current form they describe which keys are present and which fallbacks are active (`SOURCE-VERIFIED` strings such as "GOOGLE_MAPS_SERVER_KEY missing…").

**Risk (`INFERRED`):** an unauthenticated configuration-probe endpoint is a reconnaissance aid. It tells an attacker exactly which integrations are unconfigured and therefore which paths are running fakes.

**Correction (`PROPOSED`):** diagnostics require an authenticated owner role, return booleans only (never key fragments or provider names beyond a fixed catalogue), and are excluded from the public route set.

---

## 9. Health and search

- `/api/health` exists. Its depth is unverified (`BLOCKED` on what it actually asserts). A health check that returns `200` without checking Catalyst and MongoDB liveness is worse than none.
- `/api/search` performs cross-entity search. Implementation quality unassessed; with three persistence layers it is unclear which data it searches.

**Recommendation (`PROPOSED`):** health becomes two endpoints — `liveness` (process up) and `readiness` (Catalyst reachable, schema version correct, queue reachable) — with readiness failing closed. Search is rebuilt on the authoritative store in M5.

---

## 10. Backend module structure

`backend/src/modules/**` follows a module pattern (controller/service/model per domain). This is a reasonable structure and worth preserving.

Weaknesses observed:

- Services contain fallback logic that duplicates the route-level fallbacks.
- No repository interface boundary: ZCQL calls are made directly from services, so the in-memory fake can be substituted invisibly.
- `backend/workers/README.md` describes BullMQ/Catalyst workers that **do not exist** (`DOCUMENTED-ONLY`).

**Correction (`PROPOSED`):** a repository interface per aggregate, with exactly two implementations — `CatalystRepository` (production) and `InMemoryRepository` (tests only, selected by an explicit test-only flag that throws in production). This single change eliminates the silent-fallback class of bug. Specified in `28`.

---

## 11. Backend verdict

| Dimension | Assessment |
|---|---|
| Module structure | Reasonable — preserve |
| Compilation | Pass |
| Input validation | **Absent in practice** |
| Auth | **Optional, shared-org fallback** |
| Error handling | **Conceals rather than handles** |
| Webhook security | **Billing: none. n8n: none observed** |
| Persistence authority | **Undefined — three competing paths** |
| Worker/queue layer | **Documented but nonexistent** |

The backend is a well-organised skeleton with the two most important properties of a business system — *who is this* and *did it happen* — unenforced. Those are M1 and M2 respectively.
