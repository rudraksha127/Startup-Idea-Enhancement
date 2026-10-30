# AgencyOS — Security Architecture & Compliance Policy

**Classification:** Internal Engineering Standard  
**Compliance Standard:** Indian DPDP Act 2023, TRAI TCCCPR 2018, OWASP Top 10  
**Status:** Enforced  

---

## 1. Core Security Invariants

### 1.1. Secrets & Credentials Isolation
1. **Zero Secret Leakage in Bundles:** API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `MONGODB_URI`, `JWT_SECRET`) must never be prefixed with `NEXT_PUBLIC_` or bundled into client-side JavaScript.
2. **Template-Driven Configuration:** All environment variables must have sanitized descriptions in `.env.example`. Live secrets are injected via secure runtime environment managers (Cloudflare Secrets, Zoho Catalyst Environment Variables).
3. **API Key Masking:** Any API key displayed in settings or administrative UIs must be masked using `@agencyos/utils.maskApiKey` leaving at most the trailing 4 characters visible.

### 1.2. Deterministic Outbound Safety Gates
1. **Mandatory Dry-Run Default:** All outbound connectors (email dispatch, SMS, WhatsApp, ad spend, and external webhooks) default to `dry_run = true`.
2. **Live Action Gate Clearance:** Live dispatches can only occur if an authenticated user with role `owner` or `admin` explicitly clears the dispatch gate and supplies active provider credentials.

---

## 2. Compliance & Legal Safeguards

### 2.1. Google Maps / Places Terms of Service
- **Policy Rule:** Scraping Google Maps, Places, or Google Search HTML is strictly prohibited.
- **Enforcement:** Code audits reject any scraping library (Puppeteer, Cheerio, Selenium) targeted against Google Maps URLs. Data enrichment utilizes official Google Places API keys or customer-supplied directories.

### 2.2. Indian Digital Personal Data Protection (DPDP) Act 2023
- **Data Minimization:** Only business contact information publicly published for commercial contact is stored. Personal private identifiers are excluded.
- **Right to Erasure:** The system supports immediate hard-deletion of client and lead records upon request (`DELETE /api/clients/:id`, `DELETE /api/leads/:id`).
- **Data Storage:** MongoDB Atlas instances configured for Indian regions (e.g. `ap-south-1` Mumbai) for domestic data residency compliance.

### 2.3. TRAI TCCCPR 2018 (Commercial Communications)
- Automated SMS and voice channels must integrate with DLT (Distributed Ledger Technology) registered headers and pre-approved commercial templates before live dispatch.

---

## 3. Network & Application Hardening

### 3.1. Authentication & Session Management
- **Passwords:** Salted and hashed using `bcryptjs` with a work factor of 10.
- **JWT Tokens:** Signed using HMAC-SHA256 (`HS256`) with strict 7-day expiration.
- **Cookies:** Marked with `HttpOnly`, `Secure` (in production), and `SameSite=Lax`.

### 3.2. HTTP Security Headers
Applied by Next.js and Express middleware:
- `Content-Security-Policy`: Restricts scripts, styles, and image sources.
- `X-Frame-Options: DENY`: Mitigates clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`: Mandates HTTPS.

### 3.3. Abuse Prevention & Rate Limiting
- **Global API Rate Limit:** 300 requests per 15-minute window per IP address via `express-rate-limit`.
- **Auth Endpoint Rate Limit:** 10 attempts per 15-minute window on `/api/v1/auth/login`.

