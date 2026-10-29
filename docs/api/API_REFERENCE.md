# AgencyOS REST API Reference

**Base URL:** `http://localhost:3000/api` (Development) / `https://app.agencyos.ai/api` (Production)  
**Standard Response Envelope:**
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new organization and root founder user.
- **Payload:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!",
    "orgName": "Agency X"
  }
  ```
- **Response (201 Created):** Sets `token` in HttpOnly cookie; returns user profile object.

### `POST /api/auth/login`
Authenticates an existing user and issues a signed JWT token cookie.
- **Payload:** `{ "email": "user@example.com", "password": "..." }`
- **Response (200 OK):** Sets JWT cookie.

### `GET /api/auth/me`
Retrieves currently authenticated session user and tenant organization.
- **Headers:** Requires valid session JWT cookie.
- **Response (200 OK):** Returns `{ user: { id, name, email, role, org } }`.

### `POST /api/auth/logout`
Clears session JWT cookie.
- **Response (200 OK):** `{ "success": true, "message": "Logged out successfully" }`.

---

## 2. Dashboard Endpoints

### `GET /api/dashboard/metrics`
Returns aggregated operational metrics for the top KPI cards and Recharts visualizations.
- **Response (200 OK):**
  ```json
  {
    "metrics": { "totalLeads": 2847, "activeOutreach": 892, "activeClients": 38, "monthlyRevenue": 1420000 },
    "growthHistory": [{ "month": "Jan", "leads": 420 }, ...],
    "sources": [{ "name": "Google Maps", "value": 42 }, ...]
  }
  ```

### `GET /api/dashboard/activity`
Returns the recent execution stream of AI agent tasks and client state changes.

---

## 3. Leads Endpoints

### `GET /api/leads`
Lists leads with server-side pagination, status filtering, category filtering, search, and sorting.
- **Query Parameters:**
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `10`)
  - `status`: Filter by status (`All`, `New`, `Contacted`, `Interested`, `Replied`, `Converted`, `Archived`)
  - `category`: Filter by category
  - `sortBy`: Sort field (`createdAt`, `opportunityScore`, `rating`, `reviewCount`)
  - `search`: Case-insensitive search query

### `POST /api/leads`
Creates a single lead record with deterministic validation.
- **Payload:** `{ "businessName": "...", "category": "...", "location": "...", "rating": 4.5, "reviewCount": 120 }`

### `GET /api/leads/[leadId]`
Retrieves full lead dossier including 6 score rings and audit findings.

### `PATCH /api/leads/[leadId]`
Updates lead status or business information.
- **Payload:** `{ "status": "Contacted" }`

### `DELETE /api/leads/[leadId]`
Deletes a lead from the database.

### `GET /api/leads/export`
Generates and downloads a CSV export of filtered leads.

### `POST /api/leads/import`
Accepts multipart form-data or JSON with parsed CSV rows; validates each record via Zod.

---

## 4. Projects & AI Agents Endpoints

### `GET /api/projects`
Lists all active, completed, or on-hold client projects.

### `POST /api/projects`
Creates a new project record and generates milestone checklist.

### `GET /api/agents`
Retrieves AI agent fleet configurations and operational statuses.

### `POST /api/agents`
Updates agent parameters (model, temperature, maxTokens, systemPrompt).

---

## 5. System Health

### `GET /api/health`
Returns system status, database connection state, and uptime.
- **Response (200 OK):** `{ "status": "healthy", "timestamp": "...", "database": "connected" }`.

