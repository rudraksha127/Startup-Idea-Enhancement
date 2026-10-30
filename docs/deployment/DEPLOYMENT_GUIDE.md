# AgencyOS Enterprise Production Deployment Guide

This guide establishes the production deployment procedures for the canonical **Dual-Tier Topology**:
- **Frontend Presentation Tier:** **Cloudflare Pages** (Next.js 15 App Router Edge CDN).
- **Backend API Tier:** **Zoho Cloud (Catalyst AppSail)** (Node.js 20 LTS + Express.js REST API).
- **Database Datastore:** **MongoDB Atlas / Cloud** (Encrypted TLS 1.3 Mongoose Connection).
- **Automation Tier:** **n8n Workflow Engine** (Self-Hosted / Managed Docker).

---

## 1. Pre-Deployment Verification Gates

Every deployment must pass the 3 mandatory release gates before promoting changes to staging or production:

```bash
# 1. Static Typecheck (Root & Express API)
npm run typecheck
npm run typecheck:api

# 2. Automated Test Suite (16 Unit & API Contract Tests)
npm run test

# 3. Frontend Production Build & Route Compilation
npm run build
```

---

## 2. Frontend Deployment — Cloudflare Pages

Cloudflare Pages provides global edge distribution with sub-20ms asset response times.

### 2.1 Deployment Configuration
- **Framework Preset:** `Next.js (Static Export / Edge)`
- **Build Command:** `npm run build`
- **Build Output Directory:** `.next` (or `out` if static export configured)
- **Root Directory:** `/`

### 2.2 Cloudflare Pages Environment Variables

| Variable | Environment | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Production | `https://agencyos.pages.dev` | Canonical public URL of the web dashboard |
| `NEXT_PUBLIC_API_URL` | Production | `https://api-agencyos.catalyst.zoho.com` | Base URL pointing to the Zoho Cloud Express API |
| `NODE_VERSION` | Build | `20.18.0` | Node.js runtime for build execution |

### 2.3 Cloudflare Custom Domain & HTTPS
1. In the Cloudflare Pages dashboard, navigate to **Custom Domains**.
2. Add your custom agency domain (e.g., `app.youragency.com`).
3. Cloudflare automatically issues and manages the Universal SSL certificate.

---

## 3. Backend Deployment — Zoho Cloud (Catalyst AppSail)

Zoho Catalyst AppSail is Zoho's containerized and runtime application hosting platform for Node.js web services.

### 3.1 Zoho Catalyst Setup & CLI Configuration
Install the official Zoho Catalyst CLI:
```bash
npm install -g zcatalyst-cli
catalyst login
```

Initialize Catalyst in the backend directory (`backend`):
```bash
cd backend
catalyst init
```
Select **AppSail (Standalone Web Service)** and name your service `agencyos-api`.

### 3.2 Configuration Manifest (`catalyst.json`)
Create `backend/catalyst.json`:
```json
{
  "appsail": [
    {
      "name": "agencyos-api",
      "source": ".",
      "build_path": "dist",
      "command": "node dist/server.js",
      "runtime": "nodejs20",
      "memory": 512,
      "env_variables": {
        "PORT": "4000",
        "NODE_ENV": "production"
      }
    }
  ]
}
```

### 3.3 Deploying to Zoho Catalyst
```bash
# Compile TypeScript to JavaScript in backend/dist
cd backend
npm run build

# Deploy standalone runtime to Zoho Catalyst
catalyst deploy --only appsail:agencyos-api
```

### 3.4 Zoho Cloud Environment Variables
Configure the following in the **Zoho Catalyst Console > AppSail > Environment Variables**:

| Variable | Value Requirement | Purpose |
| :--- | :--- | :--- |
| `PORT` | `4000` (or injected by Catalyst) | Web service listening port |
| `NODE_ENV` | `production` | Enables production error handling |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/agencyos` | MongoDB Atlas TLS connection string |
| `JWT_SECRET` | 64-character random string | Secret key for JWT signing & verification |
| `ALLOWED_ORIGINS` | `https://agencyos.pages.dev,https://app.youragency.com` | CORS origin allowlist |
| `AI_RESEARCH_PROVIDER`| `gemini` or `openai` | Active AI provider |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API key |
| `EMAIL_PROVIDER` | `resend` | Active email provider |
| `RESEND_API_KEY` | `re_12345...` | Resend API key |

---

## 4. Database Setup — MongoDB Atlas / Managed Cluster

Zoho Catalyst does not provide a native MongoDB instance; MongoDB Atlas is the recommended cloud provider.

### 4.1 Cluster Provisioning
1. Deploy an M0 (Free) or dedicated M10 cluster in the region closest to your Zoho Catalyst data center (e.g. `ap-south-1` Mumbai for India).
2. Create a dedicated database user `agencyos_user` with `readWrite` access scoped exclusively to the `agencyos` database.

### 4.2 Network Security & IP Allowlisting
- In MongoDB Atlas **Network Access**, add the public outbound IP ranges of your Zoho Catalyst AppSail instances (or `0.0.0.0/0` with strict credential authentication and TLS 1.3 enforced).

### 4.3 Database Seeding & Verification
To seed default agency leads and admin credentials on the remote database:
```bash
MONGODB_URI="mongodb+srv://agencyos_user:<PASSWORD>@cluster.mongodb.net/agencyos" npx tsx src/lib/seed/seed-data.ts
```

---

## 5. Automation Deployment — n8n Workflow Engine

The n8n workflow engine coordinates asynchronous website audits, places discovery, and scheduled drips.

1. Deploy n8n via Docker or managed n8n cloud:
   ```bash
   docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n:latest
   ```
2. Import workflow definitions from `workflows/n8n/research/local-business-discovery.json`.
3. Configure webhook endpoint to dispatch qualified leads to:
   `POST https://api-agencyos.catalyst.zoho.com/api/v1/leads`
   Authenticated with header: `X-Webhook-Secret: <N8N_WEBHOOK_HMAC_SECRET>`.

---

## 6. Post-Deployment Verification & Smoke Tests

Execute these smoke tests after any production promotion:

```bash
# 1. Probe Backend API Health
curl -s -i https://api-agencyos.catalyst.zoho.com/api/v1/health
# Expected: HTTP/2 200 OK, {"status":"ok","database":{"status":"connected"}}

# 2. Verify CORS Preflight
curl -s -I -X OPTIONS https://api-agencyos.catalyst.zoho.com/api/v1/leads \
  -H "Origin: https://agencyos.pages.dev" \
  -H "Access-Control-Request-Method: GET"
# Expected: Access-Control-Allow-Origin: https://agencyos.pages.dev

# 3. Verify Frontend Delivery
curl -s -I https://agencyos.pages.dev
# Expected: HTTP/2 200 OK (Cloudflare edge headers present)
```
