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
