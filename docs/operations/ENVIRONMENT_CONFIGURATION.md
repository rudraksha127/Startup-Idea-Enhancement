# Environment Configuration Specification — Autonomous Agency OS

This document catalogs every environment variable used by the application, its security sensitivity, format, and default value.

---

## 1. Environment Variable Catalog

| Variable Name | Exposure | Required | Description & Validation |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Browser) | Yes | URL of the Supabase project (e.g., `https://xyz.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Browser) | Yes | Supabase public anon key for browser authentication. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Server Only)** | Yes | Elevated key for backend operations bypassing RLS (kept strictly server-side). |
| `N8N_WEBHOOK_URL` | Private (Server Only) | Yes | Ingest endpoint URL for asynchronous n8n audit workflows. |
| `N8N_WEBHOOK_HMAC_SECRET` | **Secret (Server Only)** | Yes | Cryptographic secret used to sign/verify webhook callbacks from n8n. |
| `GOOGLE_PAGESPEED_API_KEY` | **Secret (Server Only)** | Optional | API key for PageSpeed Insights (falls back to local mock fixtures if absent). |
| `NODE_ENV` | Environment | Yes | Runtime environment: `development`, `test`, or `production`. |
