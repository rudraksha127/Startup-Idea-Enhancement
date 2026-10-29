# AgencyOS Technical Debt & Operational Risk Register

**Document ID:** DEBT-001  
**Date:** 30 October 2026  
**Status:** Active  
**Governance:** Zero Critical Blockers for Release; Prioritized Maintenance Backlog  

---

## 1. Technical Debt Classification Matrix

| Item ID | Category | Description | Severity | Impact | Mitigation Plan |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **DEBT-01** | Architecture | API handlers currently co-located inside Next.js (`src/app/api`). For Cloudflare Pages + Zoho Cloud topology, a standalone Express API must be initialized. | Medium | Prevents deploying frontend purely as static export to Cloudflare Pages without edge worker overhead. | Scaffold `apps/api/` Express server reusing existing Mongoose models and Zod schemas. |
| **DEBT-02** | Security | JWT session stored in HTTP cookie. For cross-origin requests between Cloudflare Pages (`*.pages.dev`) and Zoho Cloud API, `SameSite=None; Secure=true` or Bearer token header must be supported. | Medium | Cross-domain cookie delivery requires specific CORS headers and cookie flags. | Support both `Authorization: Bearer <token>` and secure cookie authentication in API middleware. |
| **DEBT-03** | Testing | Playwright end-to-end tests exist (`tests/e2e/agencyos.spec.ts`) but are not currently gated in `.github/workflows/ci.yml` due to container runner dependencies. | Low | Regressions in browser interactions must be verified locally before pushing. | Add headless Chromium browser install step to GitHub Actions CI workflow. |
| **DEBT-04** | Data Layer | Database migrations currently rely on Mongoose schema defaults rather than formal migration runners (e.g. `migrate-mongo`). | Low | Schema updates for existing documents require manual update scripts. | Introduce `migrate-mongo` configuration for versioned database migrations. |
| **DEBT-05** | Integrations | Payment processing on `/billing` operates with mock receipts and mock balance increments. | Low | Live revenue collection cannot be triggered automatically without real webhook secrets. | Implement live Stripe and Razorpay webhook handlers behind founder toggle. |
| **DEBT-06** | Third-Party Sourcing | Google Maps API key in `.env.example` defaults to `mock`. | Low | Live Places API search requires founder-provided Google Cloud key. | Retain strict compliance with Section 3.2.3 Google Maps TOS (ephemeral display only). |

---

## 2. Risk Evaluation & Safety Guardrails

- **Data Privacy & Compliance (DPDP Act 2023 / TRAI TCCCPR):**
  - All outreach features enforce `dry_run = true` by default.
  - Suppression lists take deterministic precedence before any message queue dispatch.
- **Cost Protection:**
  - AI token consumption capped per agency organization.
  - Zero-cost mock providers ensure development and test runs never incur third-party billing charges.

