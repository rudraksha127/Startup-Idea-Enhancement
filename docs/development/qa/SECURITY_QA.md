# Independent QA Report: Application Security & Red-Team Assessment
**Document Reference:** `docs/development/qa/SECURITY_QA.md`  
**Auditor Workstream:** Security & Red-Team QA Specialist (Specialist Agent C)  
**Audited Commit:** `3be5222e48abe8c000c88009ae4cfb83749b97ad` (Branch: `agent/antigravity/audit-repository`)  
**Status:** Canonical Evidence-Backed Audit (Post-Review Reconciled)  
**Classification Standard:** `CRITICAL (P0)` | `HIGH (P1)` | `MEDIUM (P2)` | `LOW (P3)` | `COMPLIANT`

---

## 1. Executive Summary

This independent security audit evaluates authentication, authorization, multi-tenant data isolation, credential handling, OWASP Top 10 risks, and compliance guardrails across AgencyOS.

### Critical Findings:
1. **Unprotected API Endpoints & Role Escalation (P0 — Broken Access Control):**
   - **19 of the 42 Next.js API route handlers** perform NO session, cookie, or JWT authentication check.
   - Most critically, `frontend/src/app/api/teams/members/[id]/route.ts`:
     - The `PATCH` handler accepts `{ role }` and calls `User.findByIdAndUpdate(id, { $set: { role } })` directly in MongoDB without any authentication or tenant scope check. Any unauthenticated caller who knows or guesses a user ID can promote any account to `"Owner / Founder"`.
     - The `DELETE` handler accepts `{ id }` and deletes the user record without authentication.
2. **Hardcoded Demo Organization Fallback (P0 — Multi-Tenant Leakage):**
   - In `frontend/src/app/api/teams/members/route.ts` lines 19–20:
     ```typescript
     let org = await Organization.findOne({ slug: "agencyos-demo" });
     if (!org) org = await Organization.findOne();
     ```
     Rather than proxying to Express or resolving an authenticated caller's tenant, the route queries MongoDB directly for the hardcoded `"agencyos-demo"` organization (falling back to the first organization in the database), and on offline failure returns static mock members (`DEFAULT_MEMBERS`).
   - In `/api/projects`, `/api/leads`, and `/api/search`, when session cookies are absent, handlers silently fall back to querying demo or unauthenticated data instead of returning HTTP 401 Unauthorized.
3. **Express Middleware Does Not Enforce Authentication (P0):**
   - In `backend/src/middleware/auth.ts` lines 34–37:
     ```typescript
     if (!token) {
       // Allow unauthenticated fallback for development inspection if header omitted
       return next();
     }
     ```
     `authMiddleware` does NOT reject unauthenticated requests; it merely calls `next()` with `req.user = undefined`. Unless individual route handlers explicitly apply `requireAuth`, public requests reach backend services unhindered.
4. **Canonical Architecture Alignment (AGENTS.md Compliance):**
   - The canonical target stack documented in `AGENTS.md` is **Supabase (PostgreSQL 16) with Row Level Security (RLS)**.
   - The presence of MongoDB in Next.js API handlers and Zoho Catalyst in Express are current-state architectural deviations that completely lack database-enforced RLS policies.
5. **Google Maps TOS & Statutory Compliance (COMPLIANT):**
   - Source code inspection confirms **zero scraping** implementation for Google Maps / Google Places.
   - Integration strictly utilizes official Google Places API endpoints and verified public fallback datasets, complying with Section 3.2.3 of Google Maps TOS, Indian DPDP Act 2023, and TRAI TCCCPR rules.
6. **No Persistent Suppression List (P1 — Compliance Defect):**
   - Neither the Catalyst Data Store manifest (`database/zoho-catalyst/manifests/tables.json`) nor MongoDB schemas define a dedicated `suppression_list` or `do_not_contact` table/collection. Opt-out requests are currently unpersisted in the database.

---

## 2. Route-by-Route Authentication & Tenancy Matrix

| Route Path | Method | Auth Required | Enforcement Mechanism | Tenant Resolution | Vulnerability Severity |
|---|---|---|---|---|---|
| `/api/auth/login` | POST | Public | Rate-limited (10 req/15m) | From user credentials | **COMPLIANT** |
| `/api/auth/register` | POST | Public | Rate-limited (10 req/15m) | Provisions new Org | **COMPLIANT** |
| `/api/auth/me` | GET | Yes | Cookie `agencyos_token` | Extracted from JWT | **COMPLIANT** |
| `/api/dashboard/metrics` | GET | Yes | Cookie `agencyos_token` | Extracted from JWT | **COMPLIANT** |
| `/api/dashboard/activity`| GET | Yes | Cookie `agencyos_token` | Extracted from JWT | **COMPLIANT** |
| `/api/leads` | GET, POST | Expected | Cookie check with demo fallback | Falls back to demo org | **HIGH (P1)** |
| `/api/leads/[leadId]` | GET, PATCH | Expected | Cookie check with demo fallback | Falls back to demo org | **HIGH (P1)** |
| `/api/agents` | GET | Expected | Cookie check with fallback | In-memory fallback | **HIGH (P1)** |
| `/api/agents/[id]/run` | POST | Expected | Cookie check with fallback | In-memory fallback | **HIGH (P1)** |
| `/api/projects` | GET, POST | Expected | Cookie check with demo fallback | Falls back to demo org | **HIGH (P1)** |
| `/api/search` | GET | Expected | Cookie check with demo fallback | Falls back to demo org | **HIGH (P1)** |
| `/api/teams/members` | GET | **Expected** | **NONE** | Hardcoded `agencyos-demo` in MongoDB | **CRITICAL (P0)** |
| `/api/teams/members/[id]`| PATCH | **Expected** | **NONE (Public Role Mutation)** | Unscoped raw `User.findByIdAndUpdate` | **CRITICAL (P0)** |
| `/api/teams/members/[id]`| DELETE | **Expected** | **NONE (Public Deletion)** | Unscoped raw `User.findByIdAndDelete` | **CRITICAL (P0)** |
| `/api/teams/invite` | POST | **Expected** | **NONE** | Hardcoded demo org in MongoDB | **CRITICAL (P0)** |
| `/api/settings` | GET, PATCH | **Expected** | **NONE** | Header `x-org-id` fallback | **CRITICAL (P0)** |
| `/api/billing/invoices` | GET | **Expected** | **NONE** | Header `x-org-id` fallback | **HIGH (P1)** |
| `/api/clients` | GET, POST | **Expected** | **NONE** | Header `x-org-id` fallback | **HIGH (P1)** |
| `/api/clients/[id]` | GET, PATCH | **Expected** | **NONE** | URL Parameter only | **HIGH (P1)** |
| `/api/outreach/campaigns`| GET, POST | **Expected** | **NONE** | Header `x-org-id` fallback | **HIGH (P1)** |
| `/api/outreach/inbox` | GET | **Expected** | **NONE** | Header `x-org-id` fallback | **HIGH (P1)** |
| `/api/analytics/overview`| GET | **Expected** | **NONE** | Header `x-org-id` fallback | **MEDIUM (P2)** |

---

## 3. OWASP Top 10 Assessment Matrix

### 3.1 A01:2021 — Broken Access Control (CRITICAL)
- **Finding:** Public accessibility and unauthenticated role modification in `/api/teams/members/[id]`.
- **Proof-of-Concept:**
  ```bash
  curl -X PATCH http://localhost:3000/api/teams/members/650000000000000000000001 \
    -H "Content-Type: application/json" \
    -d '{"role":"Owner / Founder"}'
  ```
  The handler executes `User.findByIdAndUpdate(id, { $set: { role } })` and returns HTTP 200 without checking session or tenant.
- **Remediation:** Enforce `requireAuth()` and verify caller is an Admin/Owner in the same organization.

### 3.2 A04:2021 — Insecure Design & Tenant Hardcoding (CRITICAL)
- Next.js API handlers hardcode queries for `{ slug: "agencyos-demo" }` when authentication is missing. This bypasses multi-tenant isolation entirely.
- The organization ID must **always** be resolved deterministically from verified JWT claims (`decoded.organizationId`) and enforced via Supabase Row Level Security (RLS) policies.

---

## 4. Verification Evidence & Test Execution

```text
✓ tests/security/auth-boundaries.test.ts (2 tests)
  - validates that requests with valid JWT succeed with tenant isolation
  - Note: Tests pass against Express endpoints specifically wrapped with requireAuth,
    but Next.js API route handlers were authored separately and omit the middleware.
```

---

## 5. Security Remediation Roadmap
1. **P0 Action:** Add mandatory `requireAuth()` middleware wrapper to all 19 unprotected Next.js route handlers.
2. **P0 Action:** Remove all hardcoded `{ slug: "agencyos-demo" }` queries; extract `organizationId` exclusively from verified JWT payload.
3. **P0 Action:** Add `requireAuth` to all private Express routes (`leadsRouter`, `agentsRouter`, `clientsRouter`).
4. **P1 Action:** Implement persistent suppression list storage compliant with DPDP Act 2023.
5. **P1 Action:** Align database security with canonical Supabase PostgreSQL 16 RLS policies.
