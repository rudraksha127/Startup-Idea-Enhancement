# AgencyOS Security Architecture & Trust Boundaries

---

## 1. Security Invariants & Principles

1. **Zero Trust for External Content:** Third-party websites, external emails, and Google Maps metadata are treated as untrusted user input. All content is sanitized before database storage or LLM ingestion to prevent prompt injection.
2. **Stateless JWT Authentication:** Session state is authenticated via cryptographically signed JSON Web Tokens (HMAC-SHA256) stored in `HttpOnly`, `SameSite=Lax`, and `Secure` cookies.
3. **Multi-Tenant Boundary (`orgId`):** Every data query, mutation, and aggregation includes the tenant boundary identifier `orgId`. Cross-tenant data leakage is structurally impossible.
4. **Secrets & Credentials Safety:** No production API keys, database connection strings, or JWT secrets are ever written to source files, tests, or documentation.

---

## 2. Trust Boundaries & Attack Surface

```mermaid
flowchart TD
    subgraph Untrusted Zone
        PublicUser[Public Internet Users]
        TargetWebsites[Prospective Business Websites]
        InboundEmail[Inbound Client Emails]
    end

    subgraph Perimeter & Transport Security
        HTTPS[TLS 1.3 Encryption]
        WAF[Cloudflare / Edge Firewall]
        RateLimiter[Rate Limiting: 100 req/min]
    end

    subgraph AgencyOS Protected Zone
        AppShell[Next.js App Router]
        AuthGuard[JWT Auth Middleware]
        ZodValidator[Zod Input Validation]
        API[Backend Route Handlers]
        DB[(MongoDB with orgId Isolation)]
    end

    PublicUser -->|HTTPS| Perimeter
    TargetWebsites -.->|Scraped HTML (Untrusted)| ZodValidator
    InboundEmail -.->|Raw Payload (Untrusted)| ZodValidator
    
    Perimeter --> AuthGuard
    AuthGuard --> AppShell
    AuthGuard --> API
    API --> ZodValidator
    ZodValidator --> DB
```

---

## 3. Data Protection & Regulatory Compliance

- **Google Maps Platform TOS (Section 3.2.3):** AgencyOS prohibits unauthorized mass caching or scraping of Google Maps content. Geocoding and Place IDs are fetched strictly through official APIs with real-time refresh policies.
- **Indian Digital Personal Data Protection (DPDP) Act 2023:**
  - Notice & Consent: Clear opt-out mechanisms embedded in every outreach message.
  - Right to Erasure: Instant purging of business contacts upon receipt of an unsubscribe request.
  - Data Minimization: Storing only business-relevant contact details (company email, public business telephone, office address).

