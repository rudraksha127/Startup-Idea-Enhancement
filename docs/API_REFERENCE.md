# AgencyOS — API Reference Manual

**API Version:** v1  
**Protocols:** REST over HTTPS  
**Payload Format:** `application/json`  

---

## 1. Authentication & Security Headers

All protected endpoints require a Bearer token or active session cookie:
```http
Authorization: Bearer <jwt-token>
```
Standard Response Envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable notice"
}
```
Error Response Envelope:
```json
{
  "success": false,
  "error": "Validation error or reason string",
  "requestId": "d639b30b-91cc-4eb9-bcef-04785b59a8c5"
}
```

---

## 2. Express Headless Backend API (`/api/v1/*`)

Base Path: `http://localhost:8080/api/v1` or `https://api.agencyos.in/api/v1`

### 2.1. System & Health Probes

#### `GET /`
Returns service metadata and active API version.
- **Response:** `200 OK`
```json
{
  "service": "AgencyOS API Server",
  "version": "1.0.0",
  "status": "operational"
}
```

#### `GET /api/v1/health`
Structured health probe for load balancers and deployment orchestrators (Zoho Catalyst / Kubernetes).
- **Response:** `200 OK` (when DB connected) or `503 Service Unavailable`
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 128.4,
  "requestId": "df4148ec-ed86-4bf8-8d33-a6b6867ee768"
}
```

### 2.2. Authentication Module

#### `POST /api/v1/auth/register`
Creates a new tenant organization and owner user account.
- **Request Body:**
```json
{
  "name": "Rudraksh",
  "email": "rudraksh@apexdigital.com",
  "password": "strongPassword123!",
  "organizationName": "Apex Digital Studio"
}
```
- **Response:** `201 Created`

#### `POST /api/v1/auth/login`
Authenticates user credentials and issues a signed JWT token.
- **Request Body:**
```json
{
  "email": "rudraksh@apexdigital.com",
  "password": "strongPassword123!"
}
```
- **Response:** `200 OK` with token and user details.

### 2.3. Leads Module

#### `GET /api/v1/leads`
Lists leads for the authenticated organization with pagination and filtering.
- **Query Parameters:** `page`, `limit`, `status`, `category`, `search`
- **Response:** `200 OK`

#### `POST /api/v1/leads`
Creates a new lead with validated schema and deterministic opportunity score.
- **Request Body:**
```json
{
  "businessName": "The Urban Kitchen",
  "category": "Restaurant",
  "location": "Indore, MP",
  "rating": 4.6,
  "reviewCount": 1234,
  "hasWebsite": true
}
```
- **Response:** `201 Created`

### 2.4. Clients Module

#### `GET /api/v1/clients`
Retrieves clients list for the workspace.

#### `POST /api/v1/clients`
Onboards a new client with monthly retainer agreement and plan details.

---

## 3. Next.js Internal Route Handlers (`/api/*`)

These endpoints power client interactions directly within the Next.js application runtime.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/metrics` | Returns live workspace KPI summary and recent activities |
| `GET, POST` | `/api/leads` | Lists and creates leads |
| `GET, PATCH` | `/api/leads/[id]` | Fetches single lead or updates status / notes |
| `GET, POST` | `/api/clients` | Lists and onboards clients |
| `PATCH, DELETE`| `/api/clients/[id]` | Updates retainer/status or removes client |
| `GET, POST` | `/api/projects` | Lists deliverables or generates a new dev-ready brief |
| `GET, POST` | `/api/outreach/campaigns` | Lists and creates outreach campaigns |
| `PATCH` | `/api/outreach/campaigns/[id]` | Toggles campaign status (`Active` / `Paused`) |
| `POST` | `/api/outreach/send-test` | Dry-run simulated message dispatcher |
| `GET, PATCH` | `/api/agents` | Fetches agent statuses or updates active state |
| `POST` | `/api/agents/[id]/run` | Dispatches single AI agent task and updates telemetry |
| `GET` | `/api/analytics/overview` | Aggregated lead/client/campaign performance metrics |
| `GET, PATCH` | `/api/settings` | Fetches and updates workspace settings and API keys |
