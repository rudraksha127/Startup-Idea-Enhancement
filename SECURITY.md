# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `0.1.x` |  Active Development |

---

## Reporting a Vulnerability

We take the security and privacy of AgencyOS, our agency data, and prospective client information seriously.

If you discover a security vulnerability:
1. **Do not create a public GitHub issue.**
2. Email full technical details and reproduction steps to `security@agencyos.ai` or contact the core repository maintainers directly.
3. We will acknowledge receipt of your vulnerability report within 24 hours and provide an estimated remediation timeline.

---

## Security Invariants

- **Stateless Authentication:** All private routes require valid JWT tokens signed with a 256-bit secret key.
- **Tenant Isolation:** All database queries must include the tenant boundary `orgId`.
- **Dry-Run Enforcement:** All outbound email and messaging systems default to `dry_run = true` in development and staging environments.
- **Regulatory Compliance:** Strict alignment with the Indian Digital Personal Data Protection (DPDP) Act 2023.

