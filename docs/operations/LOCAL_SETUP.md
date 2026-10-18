# Local Development Setup Guide — Autonomous Agency OS

**Prerequisites:**
- Node.js >= 20.x LTS
- npm or pnpm >= 9.x
- Docker Desktop (for local Supabase and n8n testing)
- Supabase CLI (`npm install -g supabase`)

---

## 1. Quick Start Walkthrough

### Step 1: Clone & Install Dependencies
```bash
git clone <repository_url>
cd Startup-Idea-Enhancement
npm install
```

### Step 2: Environment Configuration
Copy the sanitized environment template:
```bash
cp .env.example .env.local
```
Configure your local Supabase credentials and Google PageSpeed API key (optional for local mock testing).

### Step 3: Start Local Supabase Containers
```bash
supabase start
```
This initializes local PostgreSQL, Supabase Auth, Storage, and Studio (accessible at `http://localhost:54323`).

### Step 4: Apply Database Migrations
```bash
supabase db reset
```
Applies all SQL DDL and seeds the default system settings (including the Emergency Kill Switch).

### Step 5: Run Next.js Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to access the Next.js 15 Operator Dashboard.

---

## 2. Running Automated Tests

```bash
# Run unit & integration test suites
npm run test

# Run E2E Playwright browser tests
npx playwright test

# Run type-check and linter
npm run type-check
npm run lint
```
