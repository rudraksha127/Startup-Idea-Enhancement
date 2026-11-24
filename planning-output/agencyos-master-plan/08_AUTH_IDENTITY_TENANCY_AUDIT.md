# 08 — Auth, Identity, and Tenancy Audit

**Severity: this document contains the findings that make the product unsellable today.**

All findings `SOURCE-VERIFIED` unless labelled otherwise.

---

## 1. Finding summary

| # | Finding | Severity |
|---|---|---|
| A1 | Authentication middleware is optional — unauthenticated requests proceed | **Critical** |
| A2 | Missing org resolves to shared demo org `org-apex-001` | **Critical** |
| A3 | No `middleware.ts`; dashboard layout is a client component with no guard | **Critical** |
| A4 | Hardcoded default JWT signing secret | **Critical** |
| A5 | Backdoor account advertised on the login page and seeded | **Critical** |
| A6 | 24 of 42 API routes never call `getCurrentUser` | **High** |
| A7 | No cross-tenant enforcement on tenant-scoped entities | **High** |
| A8 | No session revocation, rotation, or MFA | **High** |
| A9 | `settings` route keyed to a hardcoded email rather than the session user | **High** |

---

## 2. A1 — Optional authentication

`backend/src/middleware/auth.ts` (`SOURCE-VERIFIED`): the middleware attempts to verify a token. On absence or failure it does not reject; it continues, leaving the request unauthenticated.

### 2.1 Why "optional auth" is not a configuration choice

An authentication middleware has exactly one correct default in a multi-tenant business system: **reject**. Opting *out* must be explicit, enumerable, and tested. The current design inverts this: every route is public unless a developer remembers to add a check, and there is no test that asserts the public set.

### 2.2 The test that would have caught this

```
for each route in routes:
  if route not in PUBLIC_ROUTES:
    expect(request without token).status === 401
```

That test does not exist. Its absence is why A1 survived. `44` makes it a release gate.

---

## 3. A2 — The shared demo organisation

`backend/src/common/resolve-org.ts`:

```ts
const DEFAULT_ORG_ID = "org-apex-001";
```

When no organisation can be resolved from the token, the request is bound to this constant.

### 3.1 The blast radius

- Every anonymous or misconfigured request operates in the same organisation.
- If two customers ever fail resolution they share a workspace.
- Data written by a demo user is visible to any other unresolved user.
- Deletion by one actor affects all.

This is not a hypothetical: A1 guarantees that anonymous requests reach this code path.

### 3.2 Correction (`PROPOSED`)

`resolveOrg` throws `UnauthenticatedError` when no org is present. There is no default. The constant is deleted. A startup assertion fails if the string `org-apex-001` appears anywhere in the production bundle.

---

## 4. A3 — No route guard

There is no `middleware.ts` in the application (`SOURCE-VERIFIED` absence across the tree).

`frontend/src/app/(dashboard)/layout.tsx` begins with `"use client"` and contains navigation and layout only — no session read, no redirect, no conditional render.

### 4.1 Observed consequence

Any visitor can load `/dashboard`, `/leads`, `/ai-agents`, `/billing`, `/settings`, and the other eleven dashboard routes. The page shell renders. Data calls then either succeed (if a route is unguarded, A6) or fail into fallback rendering (which displays plausible empties, `05`).

To a casual viewer, the product appears to work without logging in. To a security reviewer, it is an unauthenticated administrative interface.

### 4.2 Correction (`PROPOSED`)

1. `middleware.ts` matches `/(dashboard|leads|clients|projects|outreach|ai-agents|audits|analytics|settings|invoices)/:path*`, reads the session cookie, verifies it, and redirects to `/login?next=…` on failure.
2. The layout becomes a Server Component that re-reads the session server-side — middleware alone is not sufficient because it can be bypassed by direct route handler access.
3. Both layers are tested independently.

---

## 5. A4 — Hardcoded JWT secret

`frontend/src/lib/auth/jwt.ts`:

```ts
const JWT_SECRET = process.env.JWT_SECRET || "agencyos-dev-jwt-super-secret-key-min-32-chars-long";
```

### 5.1 Impact

If `JWT_SECRET` is unset in any environment, **the secret is a public string in the repository**. Anyone who has read the source can mint a valid token for any user and any organisation. There is no key rotation, no `kid` header, and tokens live 7 days (`expiresIn: "7d"`).

### 5.2 The mitigation that is not a mitigation

The presence of `JWT_SECRET` in `.env.production` (`SOURCE-VERIFIED` that the file exists; value unread) means the fallback may never trigger in production. That is not assurance — it is an untested assumption, and there is no startup check that fails when the variable is absent. A deployment that loses one environment variable becomes forgeable.

### 5.3 Correction (`PROPOSED`)

- Remove the fallback. `throw` at module load if `JWT_SECRET` is missing or shorter than 32 bytes.
- Migrate to a managed session model (HTTP-only, `SameSite=Lax`, `Secure`, short-lived access + rotating refresh) rather than a 7-day bearer JWT in a cookie.
- Add `kid` to permit rotation without invalidating all sessions.

---

## 6. A5 — The backdoor account

Three coordinated facts (`SOURCE-VERIFIED`):

1. `frontend/src/app/(auth)/login/page.tsx` pre-fills `founder@agencyos.com` / `password123` in state (lines 10–11) **and renders them on screen as instructions** (lines 123–124).
2. `frontend/src/lib/seed/seed-data.ts` creates that user with that password and logs it to console (line 43).
3. `/api/settings` looks up the user by the literal string `"founder@agencyos.com"` rather than by session.

### 6.1 Why this is the single most damaging item

It is a documented, advertised, seeded credential pair committed to the repository's public source. Any reader of the repository — a contractor, a candidate, a diligence engineer, an attacker — knows a valid login. Combined with A2, that login lands in the shared demo org.

There is no scenario in which this is acceptable outside a disposable local environment, and there is no environment flag preventing it from existing in production.

### 6.2 Correction (`PROPOSED`)

1. Delete the prefill and the on-screen credential display.
2. Delete the seed user creation from any path reachable in production; if a demo account is required, it is created by an operator script with a generated password, stored in a secret manager, and gated behind `DEMO_MODE`.
3. `/api/settings` resolves the user from the session only.
4. Add a CI check that fails on the literal strings `password123` and `founder@agencyos.com` outside `tests/`.

---

## 7. A6 — Unguarded routes

Of 42 route handlers, roughly **18** call `getCurrentUser`; the remainder do not (`SOURCE-VERIFIED` by inspection). Every unguarded route is reachable by an anonymous caller.

The unguarded set includes data-mutating endpoints in leads, outreach, teams, clients, projects, templates, and integrations. Even where a route calls `getCurrentUser`, the call's failure path still permits the demo-org fallback (A2), so "guarded" means "attempted to resolve identity", not "requires identity".

### 7.1 Correction (`PROPOSED`)

Same enumerable-public-set pattern as A1, applied at the Next route level: a `withAuth` wrapper is the default export pattern for every handler; `withPublic` is a distinct, greppable wrapper used by a short allowlist (`/api/auth/login`, `/api/auth/register`, `/api/health/liveness`, provider webhooks with signature verification).

---

## 8. A7 — Tenancy is a convention

See `07` §4. No enforced `orgId` on tenant-scoped entities; filtering is ad hoc. In a codebase where several routes resolve to a *shared* org, an omitted filter is not merely possible but probable.

---

## 9. A8 — Session lifecycle

Absent (`SOURCE-VERIFIED`):

- No logout invalidation server-side (logout clears the cookie; the JWT remains valid until expiry).
- No token rotation or refresh.
- No device/session listing.
- No MFA.
- No password policy beyond whatever the register route enforces (unverified).
- No lockout or rate limiting observed on login beyond a general `express-rate-limit` dependency in the backend (`SOURCE-VERIFIED` dependency present; application to the Next login route `BLOCKED`).

For a B2B product handling client business data, session revocation is table stakes: an employee leaving a customer's company must be revocable within minutes, not seven days.

---

## 10. Target identity model (`PROPOSED`)

| Concern | Design |
|---|---|
| Identity | Email + password initially; Google OAuth in M6 |
| Session | HTTP-only cookie, 15-minute access token, 30-day rotating refresh, server-side session record for revocation |
| Tenancy | `Organisation` entity; `Membership(userId, orgId, role)` |
| Roles | `owner`, `admin`, `operator`, `viewer`, `client_viewer` |
| Authorisation | Per-route capability check, not role string comparison in the UI |
| Isolation | Repository injects `orgId`; callers cannot supply it |
| Audit | Every privileged action writes an `AuditLog` entry |
| MFA | TOTP for `owner`/`admin` from M6 |
| SSO | Deferred to M10 (enterprise only) |

Detailed in `34`.

---

## 11. Compliance linkage

`39` establishes that DPDP obligations include reasonable security safeguards and breach notification. An authentication model with optional auth, a public default secret, an advertised credential pair, and a shared tenant bucket is not defensible as "reasonable security safeguards" under any reading. This is a legal exposure as well as an engineering one.

---

## 12. Verdict

The identity layer is the first thing to fix and the cheapest to fix relative to its risk. It requires no new technology: middleware, one guard wrapper, deletion of two constants, and a startup assertion. It should occupy the first two weeks of M1 and block every other milestone.

**Do not demo the product to a customer, investor, or auditor before A1–A5 are closed.** Demonstrating the product today demonstrates an unauthenticated admin panel with a published password.
