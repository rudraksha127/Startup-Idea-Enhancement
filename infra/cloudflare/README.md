# Cloudflare Pages Deployment Guide — AgencyOS Frontend

This document outlines the procedure for deploying the **AgencyOS** Next.js web application to **Cloudflare Pages**.

---

## 1. Architecture Overview

- **Platform:** Cloudflare Pages (with `@cloudflare/next-on-pages` or Node.js runtime)
- **Domain:** Configured via Cloudflare DNS (e.g. `app.agencyos.in`)
- **API Strategy:**
  - Route handlers (`/api/*`) run as Edge / Serverless functions or proxy to the dedicated Express backend (`/api/v1/*`) hosted on Zoho Catalyst.
  - Client state communicates via typed API clients located in `packages/contracts` and `@agencyos/validation`.

---

## 2. Prerequisites

1. Cloudflare account with active domain zone.
2. Cloudflare Wrangler CLI installed:
   ```bash
   npm install -g wrangler
   ```
3. Remote MongoDB Atlas cluster URI configured.

---

## 3. Build & Deployment Settings

In the Cloudflare Pages dashboard:

- **Project Name:** `agencyos-web`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Build Output Directory:** `.next`
- **Root Directory:** `/` (or `apps/web` if partitioned into monorepo root)
- **Node.js Version:** `20.x` or `22.x`

---

## 4. Required Environment Variables

Configure the following secrets in Cloudflare Pages Settings → Environment Variables:

| Variable Name | Description | Example / Required Value |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/agencyos` |
| `JWT_SECRET` | 256-bit secret token for auth JWTs | `<random-hex-string-64-chars>` |
| `NEXT_PUBLIC_APP_URL` | Public canonical URL | `https://app.agencyos.in` |
| `NEXT_PUBLIC_API_URL` | External Express API endpoint | `https://api.agencyos.in` |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Currency code | `INR` |
| `DEFAULT_DRY_RUN` | Safety outbound toggle | `true` |

---

## 5. Security & Edge Headers

Cloudflare Pages automatically applies the security headers configured in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 6. Verification Checklist

- [ ] Route `/login` loads with responsive theme
- [ ] Authentication sets secure HTTP-only cookies
- [ ] `/dashboard`, `/leads`, `/map-explorer`, `/ai-agents`, `/outreach`, `/clients`, `/projects` load and render real database entities
- [ ] All outbound actions retain `dry_run = true` safety defaults
