# AgencyOS Pre-Deployment Security Checklist

**Status:** Active Security Gate  
**Compliance Mandates:** DPDP Act 2023 (India), TRAI TCCCPR, OWASP Top 10 (2025), Section 3.2.3 Google Maps TOS  
**Version:** 1.0.0  

---

## 1. Authentication & Session Management

- [ ] **JWT Secret Strength:** `JWT_SECRET` is at least 32 cryptographically random alphanumeric/special characters (generated via `openssl rand -base64 32`).
- [ ] **Cookie Security Flags:** Auth session cookies have `HttpOnly=true`, `Secure=true` (in staging/production), and `SameSite=Lax` or `Strict`.
- [ ] **Token Expiration:** JWT expiration is set to a maximum of 7 days (recommended: 24 hours with refresh token rotation).
- [ ] **Password Hashing:** Passwords hashed using `bcryptjs` with salt rounds $\ge 12$.
- [ ] **Session Invalidation:** Logout handler deletes auth cookies and client local tokens immediately.

---

## 2. Authorization & Data Access (Tenant Isolation)

- [ ] **Multi-Tenant Scoping:** All Mongoose database queries enforce ownership boundary (`userId` / `orgId` / `tenantId`) extracted directly from verified JWT claims, never from client request bodies or query parameters.
- [ ] **Role Verification:** Admin-only routes (`/api/admin/*`, critical agent settings) check `role === 'admin'` on the server side.
- [ ] **Direct Object References:** IDOR protections verified on `/api/leads/[id]`, `/api/clients/[id]`, `/api/projects/[id]`. No user can read/modify entities owned by another tenant.

---

## 3. Input Validation & Injection Defenses

- [ ] **Zod Schema Enforcement:** Every API route validates incoming `req.json()` payloads against strict Zod schemas before running business logic or database operations.
- [ ] **NoSQL Injection Defenses:** MongoDB operators (`$where`, `$regex`, `$gt`, etc.) sanitized or explicitly forbidden in direct user query filters.
- [ ] **Cross-Site Scripting (XSS):** React 19 / Next.js auto-escaping trusted for UI rendering; no `dangerouslySetInnerHTML` usage with unsanitized lead, client, or email HTML.
- [ ] **CSV / File Ingestion:** CSV parsers (PapaParse) sanitize formula injection characters (`=`, `+`, `-`, `@`) when exporting or viewing untrusted prospect data.

---

## 4. External Integrations & Data Sourcing Governance

- [ ] **Google Maps TOS Section 3.2.3 Compliance:** No scraping or caching of Google Places / Google Maps data. Only permitted public business registries, Google Places API via official keys with transient display, or user-uploaded CSVs.
- [ ] **TRAI TCCCPR & Indian DPDP Act 2023 Compliance:** Outreach mechanisms enforce suppression lists (DND/opt-out lists) deterministically before any message dispatch.
- [ ] **Outbound Dry-Run Default:** All outbound connectors (`RESEND_API_KEY`, WhatsApp webhooks, ad networks) default to `dry_run = true` or mock modes in non-production environments.
- [ ] **AI Model Guardrails:** Tool-calling LLMs receive sanitized inputs and have constrained action spaces; AI-generated code or commands are never executed directly on host shells without human approval.

---

## 5. Network & Infrastructure Security

- [ ] **CORS Configuration:** Origin headers locked to verified production domains in production environments.
- [ ] **Rate Limiting:** API endpoints (especially `/api/auth/*` and outreach trigger routes) protected by rate limiting (in-memory or Upstash Redis / reverse proxy).
- [ ] **Security Headers:** HTTP headers configured in `next.config.ts`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (in production)
- [ ] **Docker Hardening:** Application runs as a non-privileged user (`node:node` or dedicated `appuser`) inside the production container, not `root`.

---

## 6. Secrets & Environment Variable Hygiene

- [ ] **No Hardcoded Secrets:** Static code analysis confirms zero API keys, passwords, database URIs, or tokens exist in source code or git history.
- [ ] **`.env` Exclusion:** `.env`, `.env.local`, `.env.production` confirmed in `.gitignore`.
- [ ] **Least Privilege Access:** Cloud database connection strings use scoped database users with access restricted only to the `agencyos` database.
- [ ] **Key Rotation Runbook:** Operational procedures defined for emergency rotation of `JWT_SECRET`, `MONGODB_URI`, and LLM API keys.

