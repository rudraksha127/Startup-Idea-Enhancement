# Integration Register — AgencyOS
**Last Updated:** 2026-10-30  
**Version:** 1.0.0  
**Status:** Canonical Third-Party Integration Inventory & Verification Registry

---

## 1. Governance Policy & Rules of Engagement

1. **Explicit Credential Verification:** Never classify an integration as `CONNECTED` merely because an environment variable is non-empty. The provider must pass automated connection verification.
2. **Missing Credential Handling:** When credentials are not yet supplied, the provider capability is explicitly labeled `CREDENTIAL_REQUIRED` (or `BLOCKED`), with clear setup instructions.
3. **Deterministic Sandbox & Fallbacks:** In development and test environments where live credentials are not provided, deterministic mock providers execute to ensure the application remains stable and testable without fabricating live credentials.
4. **Data Minimization & Compliance:** All external integrations adhere strictly to DPDP Act 2023, TRAI TCCCPR, and Google Maps Terms of Service (Section 3.2.3).

---

## 2. Master Integration Inventory

| Provider | Purpose | Status | Scopes / Capabilities | Required Credentials | Verification Procedure | Data Processed | Rate Limits & Limitations | Monthly Operating Cost |
|---|---|---|---|---|---|---|---|---|
| **Google Maps Platform** | Location discovery, interactive web maps, Place search, autocomplete | `CREDENTIAL_REQUIRED` (Live Fallback Active) | • Maps JavaScript API<br>• Places API (New)<br>• Autocomplete (New)<br>• Geocoding API | `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`<br>`GOOGLE_MAPS_SERVER_KEY` | `POST /api/v1/maps/places/search` with valid query; verifies HTTP 200 and place schema | Place IDs, Business names, street addresses, geo-coordinates, rating count. **No caching of restricted content per TOS Section 3.2.3** | Free tier: \$200/mo credit (~28,000 map loads or ~10,000 place searches) | \$0 within free credit |
| **Google Gemini API** | AI Agent reasoning, structured extraction, lead qualification scoring | `CREDENTIAL_REQUIRED` (Deterministic Mode Active) | `gemini-2.0-flash`<br>`gemini-1.5-pro` | `GEMINI_API_KEY` | `POST /api/v1/integrations/test` with payload `{ provider: "gemini" }` | Anonymized business website text, lead audit scores. **No PII or user credentials sent** | Standard tier: 1,500 RPM, 4M TPM | Pay-per-token: ~\$0.10 / 1M input tokens |
| **OpenAI API** | Secondary AI Agent reasoning & fallback model | `CREDENTIAL_REQUIRED` (Deterministic Mode Active) | `gpt-4o`<br>`gpt-4o-mini` | `OPENAI_API_KEY` | `POST /api/v1/integrations/test` with payload `{ provider: "openai" }` | Anonymized audit text and proposal drafting parameters | Tier 1: 500 RPM | Pay-per-token: ~\$0.15 / 1M tokens |
| **MongoDB Atlas** | Primary multitenant document persistence | `CONNECTED` (Staging/Production Target) | Read/Write, Compound Indexes, Sharding | `MONGODB_URI` | `Mongoose.connection.readyState === 1` probe in `/api/v1/health` | Multi-tenant organization records, leads, clients, campaigns, invoices, audit logs | Cluster IOPS, connection pools (500 conn on M10) | M0: Free (512MB)<br>M2: \$9/mo<br>M10: \$57/mo |
| **Resend** | Transactional & outreach email dispatch | `CREDENTIAL_REQUIRED` (Dry-Run Enforced) | `emails.send`, webhook tracking | `RESEND_API_KEY` | `POST /api/v1/integrations/test` with payload `{ provider: "resend" }` | Recipient email, outreach draft. **Subject to suppression list and `dry_run=true`** | 100 emails/day on free tier | \$0 (Free) to \$20/mo |
| **Razorpay / Stripe** | Subscription management, client invoicing & checkout sessions | `CREDENTIAL_REQUIRED` (Sandbox Active) | Invoices, payment links, webhooks | `RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET`<br>`STRIPE_SECRET_KEY` | `POST /api/v1/billing/invoices/:id/checkout` initiates signed session | Invoice amount, client company name, transaction reference | Standard gateway rate limits | 2% per successful transaction; no monthly fee |

---

## 3. Credential Setup Runbook

### Google Maps Platform
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. Create project `agencyos-maps-prod`.
3. Enable APIs:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Geocoding API**
4. Under Credentials, create:
   - **Browser Key:** Set HTTP Referrer restriction to `https://app.agencyos.io/*` (and `http://localhost:3000/*` for dev). Set to `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`.
   - **Server Key:** Set API restriction to Places API (New) & Geocoding API. Set to `GOOGLE_MAPS_SERVER_KEY`.

### Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create API key.
3. Configure `GEMINI_API_KEY` in environment.

### Resend Email
1. Visit [Resend.com](https://resend.com/).
2. Verify agency sending domain (e.g., `outreach.agencyos.io`) with DKIM and SPF records.
3. Add `RESEND_API_KEY` to environment. Note: Outbound messages default to `dry_run = true` until explicitly un-gated by Founder role.

---

## 4. Connection Test Endpoint Contract

- **Endpoint:** `POST /api/v1/integrations/test`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "provider": "google-maps",
    "apiKey": "AIzaSy..."
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "result": {
      "provider": "google-maps",
      "status": "CONNECTED",
      "latencyMs": 140,
      "message": "Google Places API connection verified",
      "lastTestedAt": "2026-10-30T15:10:00.000Z"
    }
  }
  ```
- **Response (Missing/Invalid Key):**
  ```json
  {
    "success": true,
    "result": {
      "provider": "google-maps",
      "status": "CREDENTIAL_REQUIRED",
      "message": "google-maps credentials required for live queries",
      "lastTestedAt": "2026-10-30T15:10:00.000Z"
    }
  }
  ```

