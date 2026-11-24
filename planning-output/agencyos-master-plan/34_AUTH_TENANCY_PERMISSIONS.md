# 34 — Auth, Tenancy, and Permissions

`PROPOSED`. Replaces `08`. This is the specification that closes the critical findings.

---

## 1. Threat model in one line

The adversary is **anyone with the repository**, because the repository contains a published password and a default signing secret. The design must assume that source disclosure grants no access.

---

## 2. Identity

### 2.1 Entities

```
User          id, email (unique, verified), passwordHash, name,
              status: 'active' | 'invited' | 'suspended',
              mfaEnabled, mfaSecret?, createdAt, lastLoginAt

Organisation  id, name, slug (unique), plan, status,
              dataRegion, createdAt, ownerId

Membership    id, userId, orgId, role, status,
              invitedBy, invitedAt, joinedAt
              UNIQUE(userId, orgId)

Session       id, userId, orgId, refreshTokenHash,
              userAgent, ip, createdAt, expiresAt, revokedAt?
```

### 2.2 Registration

- Email + password initially; Google OAuth at M6.
- Password: minimum 12 characters, checked against a breached-password list (k-anonymity range API — no plaintext leaves the server).
- Email verification required before any external action.
- **A new registration creates an Organisation** and makes the user its `owner`. There is no shared default org.

### 2.3 Invitation

```
invite(email, role) → Membership(status='invited') + single-use token (24h)
accept(token, password) → Membership(status='active')
```

Invitations are org-scoped, role-scoped, expiring, and logged in `AuditLog`.

---

## 3. Sessions

| Property | Value | Rationale |
|---|---|---|
| Access token | JWT, 15 minutes, `httpOnly`, `Secure`, `SameSite=Lax` | Short enough that revocation delay is bounded |
| Refresh token | Opaque, 30 days, rotating, single-use | Rotation detects theft |
| Server-side session record | Required, checked on every request | Enables immediate revocation |
| Revocation | `revokedAt` set → next request fails | Employee offboarding |
| Absolute lifetime | 30 days, re-auth required | Limits stolen-device exposure |
| Concurrent sessions | Listed, individually revocable | "Sign out everywhere" |

### 3.1 Why not a 7-day JWT

The current implementation (`08` A4/A8) issues a 7-day token with no server-side state. A compromised token is valid for a week and cannot be revoked. For a product holding client business data, that is unacceptable.

A short access token plus a server-checked refresh token costs one additional database read per 15 minutes and buys immediate revocation.

### 3.2 Secret handling

```
JWT_SECRET = requireEnv('JWT_SECRET', { minLength: 32 })
```

`requireEnv` throws at module load. There is no fallback. The build fails if the variable is absent at build time; the Worker fails on first request if absent at runtime.

**Also required:** `kid` header on tokens so the secret can be rotated without invalidating every session.

---

## 4. Tenancy

### 4.1 The rule

> **Organisation context is derived from the session and injected by the repository. It is never read from a request body, query parameter, or header.**

### 4.2 Three enforcement points

| Layer | Mechanism |
|---|---|
| **Middleware** | Resolves the session, sets `orgId` in the request context; 401 if absent |
| **Service** | Receives `orgId` from context, never from arguments supplied by the caller |
| **Repository** | Injects `orgId` into every query; rejects caller-supplied org filters |

### 4.3 Why three layers

Middleware alone can be bypassed by a route handler that does not go through it. Service-alone relies on every service author remembering. The repository is the last line and the only one that cannot be forgotten, because the query cannot be constructed without it.

### 4.4 The cross-tenant test

For every repository method, a test creates a record in org A and attempts to read it with a context for org B. Expected: `null` or `404`. Never: the record.

Additionally: a static test asserts no module outside `platform/persistence` imports the Catalyst SDK.

### 4.5 Honest limitation

This is application-level isolation. There is no database-enforced RLS on Catalyst (`28` §9). A bug in the repository layer would be a cross-tenant leak. The three-layer design plus the import restriction reduces that risk to the repository implementation itself, which is a small, heavily-tested surface — but it is not equivalent to RLS.

**Recommendation for M10:** if an enterprise customer requires database-enforced isolation, evaluate a per-tenant data store partition or a database that supports RLS. Until then, state the limitation clearly in security documentation rather than implying RLS-grade separation.

---

## 5. Roles

| Role | Scope |
|---|---|
| `owner` | Full org control, billing, delete org |
| `admin` | Manage team, settings, integrations, approvals |
| `operator` | Run work, approve within limits, no settings |
| `viewer` | Read-only |
| `client_viewer` | Read-only, limited to a single client's data |

### 5.1 Capability matrix

| Capability | owner | admin | operator | viewer | client_viewer |
|---|---|---|---|---|---|
| Read own org data | ✓ | ✓ | ✓ | ✓ | ○ (own client) |
| Create/edit prospects | ✓ | ✓ | ✓ | — | — |
| Run audits | ✓ | ✓ | ✓ | — | — |
| Approve messages (≤ limit) | ✓ | ✓ | ✓ | — | — |
| Approve messages (> limit) | ✓ | ✓ | — | — | — |
| Send external messages | ✓ | ✓ | ✓ | — | — |
| Manage integrations | ✓ | ✓ | — | — | — |
| Manage team | ✓ | ✓ | — | — | — |
| Manage billing | ✓ | — | — | — | — |
| Delete organisation | ✓ | — | — | — | — |
| View audit log | ✓ | ✓ | — | — | — |

### 5.2 The approval limit

`operator` may approve up to `org.approvalLimitPerDay` messages per day. Above that, an `admin` must approve. This exists to prevent two opposite failures: a single operator becoming a bottleneck, and an operator bulk-approving without review.

---

## 6. Authorisation implementation

### 6.1 Capability-based, not role-string

```ts
// Wrong
if (user.role === 'admin') { ... }

// Right
if (!ctx.can('integration:manage')) throw new ForbiddenError();
```

Capabilities are a static map from role to capability set, defined in one file. Adding a role or a capability is a one-place change.

### 6.2 Route wrapper

```ts
export const POST = withAuth({
  capability: 'message:approve',
  schema: approveSchema,
  handler: async (ctx, input) => { ... }
});
```

`withAuth` performs: session verify → org resolve → capability check → schema parse → handler. A route that does not use a wrapper does not exist in the public allowlist and is rejected at startup by a route-registration check.

### 6.3 The public allowlist

Exactly four public routes:

```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/health/liveness
```

Plus signature-verified webhooks, which are not "public" in the same sense (they authenticate the *provider*, not a user).

A test enumerates every registered route and asserts each is either in the allowlist or returns `401` without a session.

---

## 7. Multi-factor authentication

Required for `owner` and `admin` from M6:

- TOTP, with a QR enrolment flow.
- Recovery codes, hashed at rest, single-use.
- Enforced at the org level: an org may require MFA for all members.
- A session created without MFA cannot perform `billing:manage` or `org:delete`.

---

## 8. Audit logging

Every privileged action writes an `AuditLog` row (`26` §2.7):

| Action class | Logged fields |
|---|---|
| Auth | login success/failure, logout, MFA change, password change, session revoke |
| Membership | invite, role change, removal |
| Data | create/update/delete on tenant-scoped entities (before/after where practical) |
| Approval | who, what, decision, timestamp |
| Integration | connect, disconnect, config change |
| Settings | any change to org settings or limits |
| Export | any data export (who, what, when) |

**Retention:** 7 years (`28` §7).
**Access:** `owner`/`admin` only, read-only, filterable.
**Immutability:** no update or delete path in code. Enforced by the repository having no `update`/`delete` method for this entity.

---

## 9. Rate limiting

| Surface | Limit |
|---|---|
| `POST /api/auth/login` | 5/min per IP, 10/hour per account, exponential backoff after failures |
| `POST /api/auth/register` | 3/hour per IP |
| `POST /api/agents/*/run` | per-org concurrency cap |
| `GET /api/maps/*` | per-org daily cap |
| `POST /api/leads/export` | 1/hour per org |
| All authenticated routes | generous global cap to prevent runaway clients |

Implemented at the middleware layer using Catalyst Cache or a Cloudflare-native mechanism.

---

## 10. Security headers

Set in `middleware.ts` for every response:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CSP requires care with Next.js (inline scripts). Use a nonce-based policy rather than `unsafe-inline`; if that proves impractical, document the exception explicitly rather than silently weakening the policy.

---

## 11. Data subject rights (DPDP)

`39` covers the legal detail. The implementation contract:

| Right | Implementation |
|---|---|
| Access | Export all data for a data principal, machine-readable |
| Correction | Update flows on prospect and contact records |
| Erasure | Soft delete + purge job; ledger and consent records retained with a legal-basis note |
| Grievance | A contact channel and a recorded response |
| Nomination | Deferred (`46` D-14) |

**Erasure versus retention:** a financial ledger entry cannot be deleted to satisfy an erasure request in every case; legal retention may override. The system must therefore record *why* a record was retained, so the position is defensible.

---

## 12. Exit criteria (M2)

1. Anonymous access to any non-public route returns `401` — proven by an enumerating test.
2. `org-apex-001` does not exist in the codebase.
3. No default secret exists; startup fails without `JWT_SECRET`.
4. Sessions are revocable and revocation takes effect on the next request.
5. Cross-tenant access returns `404` for every repository method.
6. The public allowlist contains exactly four routes plus verified webhooks.
7. `AuditLog` records login, approval, and every export.
8. Security headers present on all responses.
9. Re-seeding a database creates no user with a known password.
