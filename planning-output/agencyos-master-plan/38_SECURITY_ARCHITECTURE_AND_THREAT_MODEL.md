# 38 — Security Architecture and Threat Model

`PROPOSED`. Extends `13` from findings into design.

---

## 1. Threat model method

STRIDE per trust boundary, with the adversary defined as: **someone with repository access, an internet connection, and no credentials.**

That adversary is realistic here because the repository contains a published password (`08` A5) and a default signing secret (`08` A4). Any design that assumes source secrecy is already broken.

---

## 2. Trust boundaries

```
[ Internet ]
     │ B1
[ Cloudflare edge ]
     │ B2
[ Worker ]  ────────── B3 ──────► [ Catalyst Data Store ]
     │ B4
[ Workflow service ] ── B5 ──► [ LLM gateway ] ── B6 ──► [ Model providers ]
     │ B7
[ Connectors ] ── B8 ──► [ Email / WhatsApp / Places / Stripe ]
     │ B9
[ Inbound webhooks ]
```

| Boundary | Control |
|---|---|
| B1 | TLS, WAF, rate limiting |
| B2 | Session verification, CSP, security headers |
| B3 | Service credentials, least privilege, org-scoped queries |
| B4 | mTLS or signed internal requests, network restriction |
| B5 | Gateway auth token, per-org virtual keys |
| B6 | Provider TLS, redaction, DPA |
| B7 | Connector isolation, secret references |
| B8 | Provider TLS, idempotency keys |
| B9 | HMAC signature, timestamp, replay window |

---

## 3. STRIDE analysis

### 3.1 Spoofing

| Threat | Control |
|---|---|
| Forged session token | Signed JWT with `kid`, 15-min expiry, server-side session check |
| Stolen refresh token | Rotation with reuse detection → revoke family |
| Forged webhook | HMAC over raw body + timestamp |
| Spoofed internal request to workflow service | Shared secret + network restriction; not publicly routable |
| Credential stuffing | Rate limit, breached-password check, MFA for privileged |

### 3.2 Tampering

| Threat | Control |
|---|---|
| Modify a ledger entry | Append-only; no update/delete path in code |
| Modify an audit score | Derived from immutable check rows; recomputation verified |
| Edit an approved message after approval | Snapshot hash comparison (`35` §3.2) |
| Modify the Catalyst schema out-of-band | Drift detection in CI (`28` §3.3) |
| Tamper with a trace to hide an action | Traces are supplementary; `AuditLog` is the record of authority |

### 3.3 Repudiation

| Threat | Control |
|---|---|
| "I never approved that" | `Approval` with `decidedBy`, timestamp, snapshot |
| "The system sent it without me" | `AuditLog` + `Approval` + `RunStep` chain |
| "I did not change that setting" | `AuditLog` with before/after |

Every privileged action must be attributable. This is the product's core promise (`19`) expressed as a security control.

### 3.4 Information disclosure

| Threat | Control |
|---|---|
| Cross-tenant read | Repository-injected `orgId` + cross-tenant test suite (`34` §4.4) |
| PII in logs | Logging policy: no PII; hashed identifiers |
| PII in traces | Gateway redaction before trace write (`31` §6) |
| PII to model provider | Redaction + minimisation + DPA |
| Secrets in bundle | Secrets via platform bindings, never `[vars]` (`16` §4) |
| Error messages leaking internals | Typed error taxonomy; internal detail logged, not returned |
| Enumeration via timing | Generic responses on auth; constant-time comparison |

### 3.5 Denial of service

| Threat | Control |
|---|---|
| Login flooding | Rate limit per IP and per account |
| Expensive endpoint abuse | Per-org caps on runs, maps, exports |
| Runaway agent loop | Per-run budget, per-org ceiling, platform ceiling (`31` §5) |
| Queue flooding | Per-org concurrency cap |
| Cost-based DoS | Platform daily spend cap with hard stop |

Cost-based DoS is the one unique to AI products: an attacker who can trigger model calls can impose real spend. The daily ceiling is the control.

### 3.6 Elevation of privilege

| Threat | Control |
|---|---|
| Role escalation via API | Capability check server-side; role never accepted from client |
| Agent granting itself a tool | Tool allowlist enforced by policy, not prompt (`35` §4.3) |
| Prompt injection triggering a tool | Actions derive from validated output + allowlist; injection fixture test (`31` §9.1) |
| SSRF via URL fetch | Crawler allowlist: http/https only, no private IPs, no metadata endpoints, redirect limits |
| Path traversal in storage keys | Keys derived server-side; never from user input |

### 3.7 The SSRF finding deserves emphasis

The audit crawler fetches arbitrary customer-supplied URLs. That is an SSRF surface by construction.

Required controls:
1. Scheme allowlist: `http`, `https` only.
2. Resolve DNS, reject private ranges (`10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16`, `::1`, `fc00::/7`).
3. Reject on redirect to a private range (check every hop, max 5).
4. No `file://`, `gopher://`, `ftp://`.
5. Timeout and size limits.
6. User-Agent identification.
7. Reject `169.254.169.254` explicitly (cloud metadata).

Without these, a customer can use the audit feature to probe the company's internal network. This is a standard crawler vulnerability and it must be built correctly the first time.

---

## 4. Control inventory

| Control | Layer | Status |
|---|---|---|
| Session verification | Middleware | M1 |
| Capability checks | Route | M1 |
| Repository org injection | Data | M2 |
| Zod validation | Route | M1 |
| Security headers + CSP | Middleware | M1 |
| Rate limits | Middleware | M1 |
| Webhook HMAC | Inbound | M1 |
| Secrets via bindings | Deploy | M1 |
| Append-only ledger | Data | M4 |
| Approval + snapshot | Domain | M4 |
| PII redaction | Gateway | M3 |
| Audit log | Domain | M1 |
| Kill switches | Runtime | M2 |
| SSRF guards | Crawler | M3 |
| Dependency auditing | CI | M0 |
| Secret scanning (working) | CI | M0 |
| Backup + restore test | Ops | M2 |
| Incident runbook | Ops | M2 |
| MFA | Auth | M6 |
| Penetration test | External | Before M9 |

---

## 5. Encryption

| Data | At rest | In transit |
|---|---|---|
| Business records (Catalyst) | Provider-managed (`INFERRED` — verify) | TLS |
| Secrets | Platform secret store | TLS |
| Backups | Encrypted, provider-managed | TLS |
| Traces (Langfuse) | Volume encryption | TLS |
| Object storage | Provider-managed | TLS |

**Application-level encryption** for specific fields (e.g. MFA secrets, API tokens stored per org) using a KMS-managed key. Do not attempt to encrypt the whole database at the application layer; it breaks querying for no meaningful gain over provider-managed encryption.

`BLOCKED`: whether Catalyst encrypts at rest by default. Must be confirmed with the vendor before being asserted to a customer.

---

## 6. Incident response

| Phase | Action | Owner | Timeframe |
|---|---|---|---|
| Detect | Alert or report | On-call | immediate |
| Triage | Severity, affected orgs | Founder | 30 min |
| Contain | Kill switch the affected capability | On-call | 1 hour |
| Assess | Was personal data affected? | Founder | 4 hours |
| Notify (internal) | Written summary | Founder | 24 hours |
| Notify (regulator) | If personal data breach, per DPDP Rules | Founder + counsel | 72 hours |
| Notify (customers) | If their data affected | Founder | Per contract |
| Remediate | Fix + test | Engineering | Per severity |
| Review | Post-incident note in repo | Founder | 5 days |

**The 72-hour figure** comes from the DPDP Rules 2025 breach-notification requirement (R11). It is an `INFERRED` reading requiring counsel confirmation, and it is short enough that the containment and assessment steps must be rehearsed rather than improvised.

---

## 7. Pre-launch security gate (M9)

| Requirement | Evidence |
|---|---|
| No critical/high dependency vulnerabilities | CI output |
| No secrets in repository or bundle | Scan output |
| External penetration test | Report, findings remediated or accepted |
| Auth coverage test passing | CI output |
| Cross-tenant test passing | CI output |
| Gate tests passing | CI output |
| SSRF tests passing | CI output |
| Prompt-injection test passing | CI output |
| Backup restore verified | Restore log |
| Incident runbook rehearsed | Tabletop note |
| DPDP documentation complete | `39` deliverables |

**No production customer data before this gate.** A security incident in the first month of a business is frequently terminal, and the cost of the gate is days, not weeks. Design-partner audits under `42` M3 are not production: public URLs only, staging storage, manual delivery, and deletion on request.

---

## 8. Accepted risks

Stated explicitly so they are decisions, not oversights:

| Risk | Acceptance rationale | Revisit |
|---|---|---|
| Application-level tenancy (no RLS) | Catalyst constraint; mitigated by repository injection + tests | M10, if enterprise requires |
| Self-hosted Temporal increases ops surface | Avoids vendor lock-in and data-processor complexity | If ops burden exceeds value |
| Single region | No customer requires residency yet | On first such request |
| No WAF custom rules initially | Cloudflare defaults cover common cases | After first attack or at M9 |
| TOTP-only MFA (no hardware keys) | Sufficient for the segment; hardware keys at enterprise | M10 |

---

## 9. Verdict

The current system fails on the first three boundaries (B1–B3) and has no controls at B9. The target closes B1–B3 in M1 at low cost and adds B9 controls with the first connector.

The security posture that matters for the business is not "we are secure" — it is "**we can prove what happened, and we cannot be made to do something we did not authorise**". That is achievable here, and it is the same property the product sells.
