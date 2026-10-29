# API Specification & Contracts — Autonomous Agency OS

**Version:** 1.0.0-draft  
**Protocol:** REST (HTTPS / JSON) + Asynchronous Webhooks  
**Status:** PROPOSED (Pending Gate 5 Approval)  

---

## 1. Authentication & Security Headers

All administrative API endpoints require an authenticated Supabase session JWT passed via standard Bearer token or signed session cookie:
```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: application/json
```
Webhooks dispatched to or from n8n use a pre-shared cryptographic HMAC secret passed in the `X-Agency-Signature` header.

---

## 2. API Endpoints

### 2.1 Prospect Management

#### `POST /api/prospects`
Create a new prospect record with deterministic suppression validation.

**Request Payload:**
```json
{
  "businessName": "Indore Coding Academy",
  "websiteUrl": "https://indorecoding.example.com",
  "locality": "Vijay Nagar",
  "category": "SKILL_TRAINING",
  "phone": "+919826012345",
  "email": "contact@indorecoding.example.com",
  "sourceProvenance": "DIRECT_COMMERCIAL_DIRECTORY"
}
```

**Responses:**
- `201 Created`:
  ```json
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "status": "DISCOVERED",
    "createdAt": "2026-10-18T10:00:00Z"
  }
  ```
- `409 Conflict`: Target domain or phone is in `suppression_list` (cannot be added).
- `400 Bad Request`: Validation failure (invalid URL or unapproved source).

---

### 2.2 Programmatic Audit Execution

#### `POST /api/audits/trigger`
Dispatch a headless audit job for an approved prospect.

**Request Payload:**
```json
{
  "prospectId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

**Responses:**
- `202 Accepted`: Audit job queued for background execution via n8n webhook.
  ```json
  {
    "jobId": "job_998124_audit",
    "status": "QUEUED",
    "estimatedDurationSeconds": 45
  }
  ```
- `403 Forbidden`: Emergency kill switch is currently active.

---

### 2.3 n8n Webhook Ingest (Audit Result Callback)

#### `POST /api/webhooks/audit-completed`
Webhook receiver called by n8n when PageSpeed and DOM analysis finish.

**Request Payload:**
```json
{
  "prospectId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "performanceScore": 38.0,
  "lcpSeconds": 5.4,
  "clsScore": 0.18,
  "hasWhatsappCta": false,
  "hasContactForm": true,
  "hasValidSsl": true,
  "auditPdfUrl": "https://storage.supabase.co/audits/indore-coding-audit.pdf",
  "leadFitScore": 82
}
```

**Responses:**
- `200 OK`: Database updated, prospect moved to `QUALIFIED`, real-time event broadcast to dashboard.
- `401 Unauthorized`: Invalid `X-Agency-Signature`.

---

### 2.4 Emergency System Control

#### `POST /api/system/kill-switch`
Instantly halt or resume all automated workflows.

**Request Payload:**
```json
{
  "isActive": true,
  "reason": "Investigating suspicious external API rate limit spikes"
}
```

**Response:**
- `200 OK`:
  ```json
  {
    "emergencyKillSwitch": true,
    "timestamp": "2026-10-18T12:30:00Z",
    "activeWorkflowsTerminated": true
  }
  ```


---

## 3. Next.js App Router Application API Contracts (Implemented)

The following 15 Route Handlers are implemented and verified in `src/app/api/`:

### 3.1 Authentication
- `POST /api/auth/login`: Accepts `{ email, password }`, verifies bcrypt hash, sets HTTP-only `agencyos_session` JWT cookie.
- `POST /api/auth/register`: Accepts `{ name, email, password, orgName }`, creates organization & user, sets cookie.
- `GET /api/auth/me`: Reads session cookie, returns sanitized current user & organization context.
- `POST /api/auth/logout`: Clears session cookie.

### 3.2 Dashboard & Metrics
- `GET /api/dashboard/metrics`: Returns aggregated KPIs (`totalLeads`, `contactedLeads`, `convertedClients`, `pipelineRevenue`, `leadsGrowth` 6-month array, `leadsBySource` array, `agentSummary`).
- `GET /api/dashboard/activity`: Returns recent activity events with icons, timestamps, and status badges.

### 3.3 Leads Pipeline
- `GET /api/leads`: Paginated, filtered, and sorted lead query. Query parameters: `page`, `limit`, `status`, `category`, `search`, `sortBy`, `sortOrder`. Returns `{ leads, pagination, counts }`.
- `POST /api/leads`: Validates body against `createLeadSchema` (Zod), stores new lead with default scores.
- `GET /api/leads/[leadId]`: Retrieves complete intelligence dossier by MongoDB ObjectId or lead slug.
- `PATCH /api/leads/[leadId]`: Partial update with `updateLeadSchema` validation (e.g. status transition, notes, scores).
- `DELETE /api/leads/[leadId]`: Soft-archives or removes lead.
- `GET /api/leads/export`: Streams or downloads CSV file using PapaParse. Supports optional `?ids=` or filter params.
- `POST /api/leads/import`: Ingests CSV file payload, parses rows, validates required fields, inserts leads.
- `GET /api/leads/[leadId]/notes`: Lists chronological activity notes for a lead.
- `POST /api/leads/[leadId]/notes`: Creates a new activity note (`note`, `call`, `email`, `meeting`, `audit`).
- `POST /api/leads/[leadId]/outreach`: Dispatches email/WhatsApp message using pluggable provider interface (mock provider by default).

### 3.4 Projects & Autonomous Fleet
- `GET /api/projects`: Lists delivery projects with task checklists and budget trackers.
- `POST /api/projects`: Generates dev-ready project brief and pipeline card.
- `GET /api/agents`: Returns status and daily metrics for the 4 autonomous agents.
- `PATCH /api/agents`: Toggles agent running state or updates daily quota.

### 3.5 System Health
- `GET /api/health`: Returns `{ status: 'ok', timestamp, database: 'connected' }`.
