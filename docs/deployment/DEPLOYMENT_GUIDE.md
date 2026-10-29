# AgencyOS Production Deployment Guide

This guide details the deployment options, environment preparation, build validation, and verification procedures for AgencyOS.

---

## 1. Supported Deployment Targets

| Target | Recommended For | Primary Advantages | Considerations |
| :--- | :--- | :--- | :--- |
| **Docker / Container** | Self-hosted VPS, AWS ECS, GCP Cloud Run | Full control, predictable runtime, reproducible across dev/prod | Container networking and persistent volume for local DB |
| **Vercel** | Frontend & Serverless Edge | Zero-config Next.js 15 App Router optimization | Edge runtime limits; external MongoDB Atlas required |
| **Railway** | Full-Stack PaaS | Managed MongoDB plugin + Next.js web service in one project | Monthly usage cost tracking |

---

## 2. Pre-Deployment Verification Gates

Before deploying any release to staging or production, execute the three mandatory verification checks locally or in CI:

```bash
# 1. Static Type Checking
npm run typecheck

# 2. Automated Test Suite
npm run test

# 3. Production Compilation & Route Verification
npm run build
```

All 3 gates must exit with code `0`. If any gate fails, deployment must be blocked.

---

## 3. Option A: Docker Deployment (Recommended)

AgencyOS includes a production-grade multi-stage Docker build at `infra/docker/Dockerfile` and an orchestration setup at `infra/docker-compose.yml`.

### Architecture

```
                      ┌──────────────────────┐
                      │    Reverse Proxy     │
                      │   (Nginx / Caddy)    │
                      └──────────┬───────────┘
                                 │ :3000
                                 ▼
                      ┌──────────────────────┐
                      │   AgencyOS Next.js   │
                      │ (Node 20 Alpine app) │
                      └──────────┬───────────┘
                                 │ :27017
                                 ▼
                      ┌──────────────────────┐
                      │    MongoDB 7.0       │
                      │  (Persistent Volume) │
                      └──────────────────────┘
```

### 1. Build and Run via Docker Compose

```bash
# Navigate to repository root
cd /path/to/AgencyOS

# Copy production environment variables
cp .env.example .env.production
# Edit .env.production with secure production credentials

# Start services using the docker-compose manifest
docker compose -f infra/docker-compose.yml --env-file .env.production up -d --build
```

### 2. Standalone Container Build

```bash
# Build production image
docker build -f infra/docker/Dockerfile -t agencyos:latest .

# Run container with external MongoDB Atlas
docker run -d \
  --name agencyos-web \
  -p 3000:3000 \
  --env-file .env.production \
  agencyos:latest
```

---

## 4. Option B: Vercel Deployment

Vercel is the native host for Next.js 15 App Router.

### Prerequisites
1. A managed MongoDB database (e.g. MongoDB Atlas cluster).
2. Connected GitHub/GitLab repository with main branch protection.

### Steps
1. Import repository in the Vercel Dashboard.
2. In **Project Settings > Build & Development Settings**:
   - Framework Preset: `Next.js`
   - Build Command: `next build`
   - Output Directory: `.next`
3. Configure **Environment Variables**:
   - Set `MONGODB_URI` to your MongoDB Atlas connection string.
   - Set `JWT_SECRET` to a 64-character random string.
   - Set `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL` to your production domain (e.g. `https://agencyos.yourdomain.com`).
   - Add required API keys (`OPENAI_API_KEY`, `RESEND_API_KEY`, etc.).
4. Trigger deployment via git push to `main`.

---

## 5. Option C: Railway Deployment

Railway allows co-locating the Next.js service with a managed MongoDB container.

1. Create a new Railway project.
2. Add a **MongoDB** plugin service from the template gallery.
3. Add a **GitHub Repo** service pointing to AgencyOS.
4. Set the environment variable in the web service:
   - `MONGODB_URI`: `${{MongoDB.MONGO_URL}}`
   - `JWT_SECRET`: Random secure string
   - `NODE_ENV`: `production`
5. Railway automatically detects the Dockerfile or Node.js buildpack.

---

## 6. Post-Deployment Smoke Test & Health Check

After any deployment completes, verify core functionality:

1. **Health Endpoint:**
   ```bash
   curl -i https://your-deployment-domain.com/api/health
   # Expected response: 200 OK {"status":"ok","timestamp":"..."}
   ```
2. **Web Route Verification:**
   - Load `/login` and check that styling, fonts, and assets load without 404s.
   - Test login with verified test credentials.
   - Access `/dashboard` and verify data cards render without unhandled rejections.
3. **Database Connectivity:**
   - Navigate to `/leads` or query `/api/leads`. Ensure database connection does not timeout.
4. **Outbound Protection:**
   - Verify that test campaigns operate in `dry_run = true` mode until explicitly cleared by founder.

