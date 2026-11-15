# AgencyOS — Live Deployment Guide: Cloudflare Pages + Zoho Catalyst

**Architecture Target:**
- **Frontend:** Cloudflare Pages (`https://agencyos-saas.pages.dev`)
- **Backend API:** Zoho Catalyst AppSail (Node.js 20 Serverless Container)
- **Database:** Zoho Catalyst CloudScale Data Store (ZCQL Engine)

---

## Part 1: Backend & Database Deployment (Zoho Catalyst Platform)

### Step 1.1: Catalyst CLI Login
The Catalyst CLI (`1.29.0`) is already installed on your system. Run in your terminal:
```powershell
catalyst login
```
*A browser window will open. Sign in to your Zoho account.*

### Step 1.2: Link or Initialize Catalyst Project
Run in the root folder:
```powershell
catalyst init
```
1. Select your **Catalyst Project** (e.g. `AgencyOS` or create a new one).
2. Choose services: Select **AppSail** and **Data Store**.

### Step 1.3: Deploy Database Tables
The 18 entity tables are defined in `database/zoho-catalyst/manifests/tables.json`.
In your **Zoho Catalyst Console** (https://catalyst.zoho.com):
1. Go to **Data Store**.
2. Create or verify tables: `Organizations`, `Users`, `Leads`, `LeadAudits`, `LeadNotes`, `Campaigns`, `OutreachMessages`, `Replies`, `Meetings`, `Proposals`, `Clients`, `Projects`, `Templates`, `Invoices`, `AgentConfigs`, `AgentExecutions`.

### Step 1.4: Build and Deploy the Backend API
Run:
```powershell
# 1. Build the backend code
cd backend
npm run build

# 2. Deploy to Zoho AppSail
catalyst deploy --only appsail
```
*Catalyst will upload `dist/server.js`, configure container settings from `catalyst.json`, and output your live backend URL:*
`https://agencyos-api.appsail.catalystserverless.com` (note this URL down).

---

## Part 2: Frontend Deployment (Cloudflare Pages)

The Cloudflare Pages project **`agencyos-saas`** has already been created under your Cloudflare account (`luckyudiya@gmail.com`).

### Option A: Automatic Git Integration (Recommended)
1. Open your **Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Go to **Compute (Workers) > Workers & Pages**.
3. Click on the project **`agencyos-saas`** (already created for you).
4. Go to **Settings > Builds & deployments > Source**:
   - Connect your GitHub repository: `rudraksha127/Startup-Idea-Enhancement`
   - Production branch: `main`
   - Framework preset: `Next.js`
   - Build command: `npm run build:frontend`
   - Build output directory: `frontend/.next`
   - Root directory: `/`
5. Go to **Settings > Environment variables** and add:
   - `NEXT_PUBLIC_API_URL` = Your Zoho AppSail backend URL from Step 1.4
   - `NEXT_PUBLIC_APP_URL` = `https://agencyos-saas.pages.dev`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = Your Google Maps Platform API Key
6. Click **Save and Deploy**. Cloudflare will automatically build and publish to `https://agencyos-saas.pages.dev`!

### Option B: Direct CLI Deployment (Wrangler)
To deploy directly from your local terminal:
```powershell
# 1. Build frontend locally
npm run build:frontend

# 2. Deploy using Wrangler
npx wrangler pages deploy frontend/.next --project-name=agencyos-saas
```
