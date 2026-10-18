# Security, Privacy & Data Protection Architecture — Autonomous Agency OS

---

## 1. Threat Modeling & Risk Surface

```
[Threat Vector: Data Leakage]
Risk: Anon Supabase API key exposed in client bundle allows reading all prospects.
Control: 100% of tables have Row Level Security (RLS) enabled. Anon role has ZERO permissions.

[Threat Vector: API Abuse & Denial of Service]
Risk: Public website contact forms blasted by spambots, exhausting Supabase limits.
Control: Cloudflare Turnstile CAPTCHA + IP-based rate limiting on Edge Functions (max 5/hour).

[Threat Vector: Runaway Webhook Loop]
Risk: Buggy n8n workflow triggers thousands of PageSpeed API calls in an infinite loop.
Control: Global Emergency Kill Switch checked at node #1 + n8n per-workflow execution throttles.

[Threat Vector: Regulatory Non-Compliance]
Risk: Unsolicited cold outreach violates Indian DPDP Act 2023 or TRAI UCC rules.
Control: No automated cold emailing or WhatsApp sequences; B2B direct networking only.
```

---

## 2. Secrets & Credential Management Policy

1. **Zero Credentials in Code:** No production secrets, service role keys, or database passwords may ever be committed to Git. Pre-commit hooks actively scan for token patterns.
2. **Environment Variable Taxonomy:**
   - `NEXT_PUBLIC_*`: Safe for browser exposure (e.g., Supabase Project URL, Supabase Anon Key).
   - Server-Only: Protected environment variables available only to Route Handlers and Edge Functions (`SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_HMAC_SECRET`, `GOOGLE_PAGESPEED_API_KEY`).
3. **Template Synchronization:** All required variables must be documented in `.env.example` with sanitized placeholder descriptions.

---

## 3. Data Governance & Retention (DPDP Act 2023 Alignment)

- **Purpose Limitation:** Contact details ingested into the system are utilized strictly for agency business development and website audits.
- **Data Subject Erasure (Right to be Forgotten):** When an institute director requests removal or opts out, calling `POST /api/suppression/opt-out` automatically deletes the prospect's contact information from `prospects` and records an encrypted hash in `suppression_list` to prevent re-addition.
- **Access Isolation:** Multi-tenant client databases for delivered websites are completely isolated in separate projects/schemas from the agency's internal operating system.
