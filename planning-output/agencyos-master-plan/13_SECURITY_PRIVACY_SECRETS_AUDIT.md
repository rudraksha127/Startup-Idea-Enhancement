# 13 — Security, Privacy, and Secrets Audit

**Method:** code reading at `d1be212`. **No penetration test was performed.** Findings are code-level; exploitability is `INFERRED` unless a live observation is recorded.

---

## 1. Risk register (security-specific)

| ID | Finding | Severity | Exploitability |
|---|---|---|---|
| S1 | Authentication optional on backend middleware | Critical | Direct |
| S2 | Shared default org `org-apex-001` | Critical | Direct |
| S3 | No `middleware.ts`; dashboard publicly reachable | Critical | Direct |
| S4 | Hardcoded default JWT secret | Critical | Direct if env var absent |
| S5 | Advertised backdoor credentials + seeded user | Critical | Direct |
| S6 | Billing webhook without signature verification | Critical | Direct |
| S7 | In-memory datastore reports success | Critical (integrity) | Silent, not attacker-driven |
| S8 | 24 of 42 API routes unguarded | High | Direct |
| S9 | No org-scoped enforcement on entities | High | Direct (IDOR class) |
| S10 | n8n inbound webhook unsigned | High | Direct |
| S11 | No input validation on most routes | High | Operator-injection class |
| S12 | Integration diagnostics unauthenticated | Medium | Reconnaissance |
| S13 | No session revocation; 7-day JWT | High | Post-compromise persistence |
| S14 | Secrets in local `.env*` files with no manager | Medium | Host compromise |
| S15 | `backend/node_modules` committed, unaudited | Medium | Supply chain blind spot |
| S16 | No dependency gating in CI | Medium | Known-vuln persistence |
| S17 | No CSP, no security headers observed | Medium | XSS amplification |
| S18 | No rate limiting on Next API routes | Medium | Abuse, credential stuffing |
| S19 | No audit log of privileged actions | High (compliance) | N/A — detection gap |
| S20 | No consent records | High (compliance) | N/A — lawful basis gap |

---

## 2. S1–S5: the identity cluster

Detailed in `08`. Summarised here because the security posture is dominated by it.

The compound effect: an anonymous request is accepted, bound to a shared organisation, and can be issued a token signed with a secret that is in the repository, using credentials printed on the login page.

Any one of these would be a release blocker. Together they mean the application has **no effective authentication boundary**.

**Remediation order (must be strictly sequential):**

1. Remove the JWT default → fail closed at startup.
2. Delete backdoor credentials from UI, seed, and docs.
3. Make auth middleware reject by default; add `@Public()` allowlist.
4. Delete `org-apex-001`; make org resolution throw.
5. Add `middleware.ts`; convert dashboard layout to a server component with a session check.
6. Add the route-coverage test that asserts 401 for every non-public route.

Steps 1–2 are hours. Steps 3–5 are days. Step 6 prevents regression permanently.

---

## 3. S6: billing webhook

A `POST` to the webhook with no signature marks invoices paid (`SOURCE-VERIFIED`). This is a financial-integrity break and, in a live system, a fraud vector.

**Remediation:** verify signature over the **raw body**; enforce idempotency on event ID; reconcile against a provider-side retrieval before transitioning invoice state; gate the path behind `payments_enabled = false` until M9.

---

## 4. S7: silent data loss

Not an attacker-driven vulnerability, but a security-adjacent integrity failure: the datastore accepts writes and returns success without durability (`07` §2). In a breach investigation, this is the difference between "we can prove what happened" and "we cannot".

---

## 5. S11: input validation and injection surface

Most routes pass `await req.json()` directly into persistence or service calls. Mongoose filter construction from request-controlled keys is an operator-injection surface (`$gt`, `$ne`, `$regex`). Whether any specific route is exploitable is `BLOCKED` without targeted testing.

**Remediation:** `schema.safeParse` at every entry point; repositories accept typed domain objects, never raw filters; a lint rule bans `req.body` usage outside a validated handler.

---

## 6. S14: secrets management

Six `.env*` files exist on disk with live keys. They are correctly untracked (`SOURCE-VERIFIED`), which is the important part.

Remaining risks:

1. **No secret manager.** Keys live in developer filesystem files, propagate by copy, and have no rotation record.
2. **No rotation policy observed.**
3. **No separation evidence** between local and production keys (`INFERRED` risk).
4. **Secrets are available to any process** on the development machine, including agents and scripts.

**Remediation (`PROPOSED`):**

- Adopt a secret manager (Cloudflare Secrets for Worker bindings; a managed vault for the Express service).
- Environment-scoped credentials with distinct values.
- Rotation runbook with a 90-day cadence and immediate rotation on personnel change.
- A startup assertion that no secret equals a known-placeholder or documentation value.
- CI check that no `.env*` file other than `.example` is ever staged.

---

## 7. S15–S16: supply chain

`backend/node_modules` (1,514 files) is committed (`SOURCE-VERIFIED`). `npm audit` runs with `continue-on-error: true` and covers only the root lockfile.

Consequences: a vulnerable transitive dependency can persist indefinitely, and the committed tree is not scanned at all.

**Remediation:** untrack `node_modules` and `app.js`; enable Dependabot or equivalent; make `npm audit --audit-level=high` blocking; add a lockfile-integrity check.

---

## 8. S17–S18: headers and rate limiting

No `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, or `Strict-Transport-Security` configuration was observed in the Next application (`SOURCE-VERIFIED` absence of a `headers()` block or middleware that would set them). `helmet` is a backend dependency; whether it is applied is unverified.

No rate limiting on Next API routes was observed. Login has no lockout visible in the route code.

**Remediation:** a `headers()` block in `next.config` (or middleware) setting CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and a strict `frame-ancestors`. Rate limit login (5/min/IP + per-account backoff) and expensive endpoints (agent run, maps, export).

---

## 9. S19–S20: audit and consent

Both entities are absent (`07` §6). This is simultaneously:

- **A security detection gap** — privileged actions leave no trace, so an insider action is undetectable.
- **A compliance gap** — DPDP requires reasonable safeguards and breach notification; TRAI and WhatsApp require demonstrable consent (`39`).

**Remediation:** `AuditLog` and `ConsentRecord` are M1 schema deliverables, not later additions, because retrofitting them means the first months of operation have no record.

---

## 10. Privacy posture under DPDP

Research R11 (17 Nov 2026): the DPDP Act 2023 and DPDP Rules 2025 were notified in November 2025; core obligations are phased, with widely-reported full effect around May 2027. The Data Protection Board is established.

| Obligation | Current state |
|---|---|
| Lawful basis and notice | No notice flow, no purpose statement (`SOURCE-VERIFIED` absence) |
| Consent management | Absent |
| Data principal rights (access, correction, erasure) | No mechanism |
| Retention limits | No policy; Places content retained indefinitely (violates Google TOS regardless of DPDP) |
| Breach notification (72h per Rules) | No incident process |
| Processor agreements | `BLOCKED` — no evidence |
| Security safeguards | Failing (S1–S5) |
| Grievance officer | Not designated (`BLOCKED`) |

`INFERRED` legal reading; requires counsel. Full treatment in `39`.

**Note on timing:** the phased commencement is a *grace period*, not an exemption. Building consent and audit records in M1 costs days; retrofitting them into a live system with customer data costs months and creates a disclosure obligation.

---

## 11. Threat model summary

Full STRIDE treatment in `38`. The five threats that matter most:

| Threat | Vector | Current control |
|---|---|---|
| **Cross-tenant read** | Demo-org fallback + missing org filter | **None** |
| **Account takeover** | Published credentials + default JWT secret | **None** |
| **Financial manipulation** | Unsigned billing webhook | **None** |
| **Data fabrication reaching customer** | Fake leads/phones exported to CRM | **None** |
| **Malicious inbound webhook** | Unsigned n8n endpoint | **None** |

Four of five are exploitable by someone with only repository access and a browser. That is the security posture as it stands.

---

## 12. Verdict and sequencing

| Area | State |
|---|---|
| Authentication | **Absent** |
| Authorisation | **Convention** |
| Tenant isolation | **Absent** |
| Webhook integrity | **Absent** |
| Secret management | **Filesystem** |
| Supply chain | **Unaudited** |
| Headers/rate limits | **Absent** |
| Audit logging | **Absent** |
| Consent | **Absent** |
| Encryption at rest | Provider-managed (Catalyst/Mongo default) — `INFERRED` |
| Encryption in transit | TLS via Cloudflare — `INFERRED` |

Security is not a hardening phase here; it is the *first* phase, and it is cheap because the codebase is small and types are clean. M1 is two working weeks of safety work that converts the product from unsellable to demonstrable. Nothing else should be scheduled before it.
