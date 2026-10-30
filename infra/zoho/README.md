# Zoho Catalyst AppSail Deployment Guide — AgencyOS REST API

This guide provides step-by-step instructions for deploying the **AgencyOS Express REST API (`apps/api/`)** on **Zoho Catalyst AppSail**.

---

## 1. Component Overview

- **Service:** AgencyOS Headless API (`/api/v1/*`)
- **Runtime:** Node.js 20 LTS (AppSail Container)
- **Port:** `8080` (or `process.env.X_ZOHO_CATALYST_LISTEN_PORT` / `process.env.PORT`)
- **Architecture:** Express 4.21 with TypeScript, Helmet, CORS, Rate-Limiting, Morgan logging, and Zod validation middleware.

---

## 2. Directory Layout & Catalyst Configuration

Create `infra/zoho/catalyst.json` or place it in the project root:

```json
{
  "appsail": [
    {
      "name": "agencyos-api",
      "source": "apps/api",
      "build": "npm run build",
      "run": "node dist/server.js",
      "env_variables": {
        "NODE_ENV": "production",
        "PORT": "8080"
      }
    }
  ]
}
```

---

## 3. Deployment Steps via Catalyst CLI

1. **Install Zoho Catalyst CLI:**
   ```bash
   npm install -g zcatalyst-cli
   ```

2. **Authenticate with Zoho:**
   ```bash
   catalyst login
   ```

3. **Initialize or Link Catalyst Project:**
   ```bash
   catalyst init
   # Select your existing project: AgencyOS-Production
   ```

4. **Deploy AppSail Container:**
   ```bash
   catalyst deploy --only appsail:agencyos-api
   ```

---

## 4. Environment Variables Configuration

Set these variables in the Catalyst Web Console under **AppSail → Environment Variables**:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas Production Connection String |
| `JWT_SECRET` | Cryptographic secret for signing bearer tokens |
| `CORS_ORIGIN` | Allowed web frontend origin (`https://app.agencyos.in`) |
| `DEFAULT_DRY_RUN` | Mandatory outbound lock: `true` |
| `GEMINI_API_KEY` | Google Gemini API Key for research & outreach generation |
| `OPENAI_API_KEY` | Optional fallback provider key |

---

## 5. Health Probe Verification

AppSail utilizes HTTP probes to determine container vitality.
- **Probe Endpoint:** `GET /api/v1/health`
- **Expected Status:** `200 OK` (when MongoDB is connected) or `503 Service Unavailable` (structured JSON payload with `requestId` and error details).
- **Service Root Probe:** `GET /` returns API version and uptime metrics.
