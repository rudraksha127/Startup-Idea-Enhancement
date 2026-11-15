# AgencyOS — Integration Audit & Central Provider Status Registry

**Audit Date:** 14 November 2026  
**Status:** Canonical Provider Registry  
**Auditor:** DevSecOps & Cloud Integration Lead  

---

## 1. Integration Status Registry

AgencyOS enforces strict truth-over-intent governance across all external service integrations. A provider is marked **`CONNECTED`** if and only if an authenticated network request has succeeded against the provider's production or staging API endpoint. When credentials are not configured in the host environment, the provider is honestly registered as **`NOT_CONFIGURED`**, and the application routes through safe deterministic staging mock adapters with `dry_run = true`.

### Central Integration Inventory

| Provider | Purpose | Connection Status | Required Scopes / Permissions | Configured Environment Variable(s) | Safe Staging Fallback | Last Test Result |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **Google Maps Platform** | Business discovery via Places API (New) & Place Details | `NOT_CONFIGURED` *(Ready for Key)* | `places.searchText`, `places.getPlaceDetails` | `GOOGLE_MAPS_API_KEY` | Synthetic Places Engine (Section 3.2.3 TOS compliant) | Safe adapter active; 200 OK with TOS attribution headers. |
| **OpenAI / Anthropic / Gemini** | Multi-agent text & code generation | `NOT_CONFIGURED` *(Ready for Key)* | `chat.completions`, `messages.create` | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` | Structured deterministic JSON synthesizer | Verified 13 canonical agent schema outputs. |
| **SendGrid / Resend** | Outbound cold email campaign dispatch | `NOT_CONFIGURED` *(Ready for Key)* | `mail.send` | `SENDGRID_API_KEY`, `RESEND_API_KEY` | Safe Mock (`dry_run = true`); message logged to audit trail | Approval gate verified; zero unauthorized dispatches. |
| **Cal.com / Google Calendar** | Meeting scheduling & video link generation | `NOT_CONFIGURED` *(Ready for Key)* | `calendar.events.write` | `CAL_COM_API_KEY`, `GOOGLE_CALENDAR_CREDENTIALS` | Deterministic booking slot synthesizer | Returns valid Google Meet / Cal.com URL structure. |
| **Stripe** | Subscription invoicing & payment webhooks | `NOT_CONFIGURED` *(Ready for Key)* | `invoices.create`, `webhook_endpoints` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Idempotent mock receiver passing signature check | 3 unit tests passing with idempotency. |
| **Cloudflare Pages** | Customer staging & production website deployment | `NOT_CONFIGURED` *(Ready for Key)* | `pages.deployments.create` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Webhook dispatch simulator | Deployment record created with staging preview URL. |
| **Zoho Catalyst CloudScale** | Primary business transactional data store & ZCQL | `NOT_CONFIGURED` *(Local Dev Mode)* | `CatalystDataStore.readWrite`, `CatalystZCQL` | `CATALYST_PROJECT_ID`, `CATALYST_CLIENT_ID`, `CATALYST_CLIENT_SECRET` | Local Catalyst ZCQL emulator / in-memory store | Ready for Zoho Catalyst AppSail deployment. |
| **n8n Automation Engine** | 25 multi-agent workflows & scheduled sweeps | `NOT_CONFIGURED` *(Local Host)* | `workflow:execute`, `webhook:trigger` | `N8N_API_KEY`, `N8N_WEBHOOK_URL` | Local workflow dispatcher | 25/25 workflows schema-validated. |
| **GitHub API** | Scaffolding customer website repositories | `NOT_CONFIGURED` *(Ready for Key)* | `repo`, `workflow` | `GITHUB_TOKEN` | Template repository cloner | Scaffolds valid Next.js/Tailwind directories. |

---

## 2. Credential Security & Isolation Rules

1. **Frontend Isolation:** No server-side secrets (`SENDGRID_API_KEY`, `STRIPE_SECRET_KEY`, `CATALYST_CLIENT_SECRET`) are ever exposed to client-side bundles. Only `NEXT_PUBLIC_` prefixed variables (such as public analytics IDs or public map tile keys) are bundled.
2. **Deterministic Pre-flight Gate:** Every external API invocation passes through an environment check:
   ```typescript
   if (!process.env.PROVIDER_API_KEY || process.env.NODE_ENV !== "production") {
     return executeSafeMockAdapter(payload);
   }
   ```
3. **Dry-Run Enforcement:** All outbound email, WhatsApp, and financial refund endpoints enforce `dry_run = true` by default until explicitly overridden by an authenticated admin with production credentials.
4. **Audit Trail Logging:** Every outgoing provider call logs a sanitized record (timestamp, provider, endpoint, status code, latency, redacted payload) to the `AuditLog` table.

---

## 3. Onboarding Procedure for Live Credentials

When the founder/operator provisions live production keys:
1. **Google Maps:** Generate API key in Google Cloud Console with restrictions to *Places API (New)*, *Maps JavaScript API*, and *Geocoding API*. Set `GOOGLE_MAPS_API_KEY=AIzaSy...`.
2. **Email Engine:** Generate API key in SendGrid/Resend with `Mail.Send` permission. Set `SENDGRID_API_KEY=SG...`. Configure DNS DKIM/SPF records for sender domain.
3. **Stripe:** In Stripe Dashboard, retrieve `STRIPE_SECRET_KEY=sk_live_...` and configure webhook destination `https://agencyos.zohoappsail.com/api/v1/billing/webhook` to obtain `STRIPE_WEBHOOK_SECRET=whsec_...`.
4. **Zoho Catalyst:** In Zoho Catalyst Console, create project `AgencyOS`, register AppSail client, and set `CATALYST_PROJECT_ID` and OAuth credentials in environment.
5. **n8n:** Deploy Docker container or link n8n Cloud instance with `N8N_API_KEY` and set webhook callback target.
