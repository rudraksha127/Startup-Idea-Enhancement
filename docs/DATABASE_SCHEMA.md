# AgencyOS — MongoDB Database Schema Specification

**Database Engine:** MongoDB 7.0+ (Atlas / Local Docker)  
**Object Document Mapper:** Mongoose 8.9+  
**Target Database Name:** `agencyos`  

---

## 1. Entity-Relationship Model

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : "has members"
    ORGANIZATION ||--o{ LEAD : "owns leads"
    ORGANIZATION ||--o{ CLIENT : "manages clients"
    ORGANIZATION ||--o{ PROJECT : "manages projects"
    ORGANIZATION ||--o{ CAMPAIGN : "runs campaigns"
    ORGANIZATION ||--o{ AGENT_CONFIG : "configures agents"
    ORGANIZATION ||--o{ AGENT_EXECUTION : "logs agent runs"
    ORGANIZATION ||--o{ INVOICE : "issues invoices"
    ORGANIZATION ||--o{ TEMPLATE : "maintains templates"
    LEAD ||--o{ LEAD_NOTE : "has notes"
    LEAD ||--o{ OUTREACH_MESSAGE : "receives dispatches"
    CAMPAIGN ||--o{ OUTREACH_MESSAGE : "tracks messages"
    CLIENT ||--o{ PROJECT : "commissions"
    CLIENT ||--o{ INVOICE : "billed via"
```

---

## 2. Collections & Field Specifications

### 2.1. `organizations` Collection
Represents tenant agency workspaces.

| Field | Type | Required | Constraints / Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `name` | String | Yes | Trimmed, min 2 chars | Business name of agency |
| `slug` | String | Yes | Unique, index | URL-safe slug identifier |
| `plan` | String | Yes | `Starter` \| `Pro` \| `Agency` | Subscription tier |
| `credits` | Number | Yes | Default: `250` | AI execution credits |
| `settings` | Object | No | `{ dryRunMode: true }` | Global safety flags |
| `createdAt` | Date | Yes | Auto timestamp | Creation timestamp |
| `updatedAt` | Date | Yes | Auto timestamp | Last updated timestamp |

### 2.2. `users` Collection
Represents agency team members and system operators.

| Field | Type | Required | Constraints / Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Auto | Unique identifier |
| `organizationId` | ObjectId | Yes | Ref: `Organization` | Tenant boundary |
| `name` | String | Yes | Trimmed | User's full name |
| `email` | String | Yes | Unique, lowercase | Primary login email |
| `passwordHash` | String | Yes | Bcrypt hash | Encrypted password |
| `role` | String | Yes | `owner` \| `admin` \| `member` | Access control role |
| `isActive` | Boolean | Yes | Default: `true` | Account active state |

### 2.3. `leads` Collection
Discovered business prospects undergoing research, outreach, or qualification.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `businessName` | String | Yes | Name of target business |
| `category` | String | Yes | Business vertical (Restaurant, Clinic, Cafe, etc.) |
| `location` | String | Yes | City, State or Address |
| `rating` | Number | No | Google rating (e.g. 4.6) |
| `reviewCount` | Number | No | Total review count |
| `hasWebsite` | Boolean | Yes | Whether business currently has an active website |
| `websiteUrl` | String | No | Existing website URL if applicable |
| `opportunityScore`| Number | Yes | Computed score 1.0 - 10.0 |
| `status` | String | Yes | `New` \| `Audited` \| `Contacted` \| `Replied` \| `Converted` \| `Archived` |
| `phone` | String | No | Business phone number |
| `email` | String | No | Contact email address |

### 2.4. `clients` Collection
Converted local businesses with signed retainers and active services.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `businessName` | String | Yes | Client business name |
| `contactPerson` | String | Yes | Primary representative |
| `email` | String | Yes | Official email address |
| `phone` | String | Yes | Phone / WhatsApp number |
| `address` | String | Yes | Physical business location |
| `status` | String | Yes | `Active` \| `Onboarding` \| `Retainer` \| `Past` |
| `monthlyRetainer`| Number | Yes | Monthly recurring fee in INR |
| `plan` | String | Yes | Service package description |

### 2.5. `projects` Collection
Active and completed client deliverable engagements.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `title` | String | Yes | Project name / scope |
| `clientName` | String | Yes | Associated client name |
| `budget` | Number | Yes | Total budget in INR |
| `deadline` | String | Yes | Expected completion date |
| `status` | String | Yes | `Discovery` \| `In Progress` \| `Review` \| `Delivered` |
| `features` | [String]| No | Scope items & deliverables |
| `tasks` | [Object]| No | Task breakdown items with completion status |

### 2.6. `campaigns` Collection
Multi-channel automated outreach sequences.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `name` | String | Yes | Campaign campaign identifier |
| `channel` | String | Yes | `Email` \| `WhatsApp` \| `Multi-channel` |
| `status` | String | Yes | `Active` \| `Paused` \| `Draft` \| `Completed` |
| `sentCount` | Number | Yes | Dispatched counter |
| `openedCount` | Number | Yes | Opened counter |
| `repliedCount` | Number | Yes | Replied counter |
| `dryRunMode` | Boolean | Yes | Safety flag (default: true) |

### 2.7. `agent_configs` Collection
Configurations and execution telemetry for AI agent workers.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `agentId` | String | Yes | Agent type (`researcher`, `auditor`, `outreach`, `followup`, etc.) |
| `name` | String | Yes | Human-readable title |
| `status` | String | Yes | `active` \| `paused` |
| `model` | String | Yes | Model identifier (`gemini-2.5-flash`, etc.) |
| `processedToday` | Number | Yes | Daily action count |
| `dailyCap` | Number | Yes | Maximum allowed runs per day |
| `lastRunAt` | Date | No | Timestamp of most recent execution |

### 2.8. `agent_executions` Collection
Comprehensive audit trail, lifecycle state transitions, tokens, and approval records for all 13 AI agents.

| Field | Type | Required | Description |
|---|---|---|---|
| `agentId` | String | Yes | Canonical agent identifier (e.g. `market-researcher`, `audit-analyst`) |
| `agentName` | String | Yes | Human-readable agent title |
| `organizationId` | ObjectId | Yes | Tenant boundary reference |
| `triggeredBy` | String | Yes | `USER` \| `SCHEDULE` \| `WEBHOOK` \| `PIPELINE` |
| `status` | String | Yes | `CREATED` \| `QUEUED` \| `VALIDATING` \| `RUNNING` \| `AWAITING_APPROVAL` \| `COMPLETED` \| `FAILED` \| `REJECTED` |
| `requiresApproval` | Boolean | Yes | True for supervised agents (outreach, code deploy) |
| `approvalStatus` | String | Yes | `NOT_REQUIRED` \| `PENDING` \| `APPROVED` \| `REJECTED` |
| `inputPayload` | Object | Yes | Validated Zod input parameters |
| `outputPayload` | Object | No | Structured JSON execution result |
| `executionMetrics` | Object | Yes | Duration (ms), token usage, estimated cost, attempts count |
| `creditsDeducted` | Number | Yes | System credits deducted |

### 2.9. `invoices` Collection
Financial ledger tracking client milestones, payment gateway sessions, and tax invoices.

| Field | Type | Required | Description |
|---|---|---|---|
| `invoiceNumber` | String | Yes | Formatted sequential ID (e.g. `INV-2024-001`) |
| `organizationId` | ObjectId | Yes | Tenant reference |
| `clientId` | ObjectId / String | Yes | Client reference |
| `clientName` | String | Yes | Client or business name |
| `amount` | Number | Yes | Total milestone amount in INR |
| `currency` | String | Yes | `INR` \| `USD` (default: `INR`) |
| `status` | String | Yes | `PAID` \| `PENDING` \| `OVERDUE` \| `DRAFT` |
| `dueDate` | Date | Yes | Payment deadline timestamp |
| `paidAt` | Date | No | Payment completion timestamp |
| `items` | Array | Yes | Line items with description, quantity, and unit price |

### 2.10. `templates` Collection
Industry website templates and component scaffolds ready for one-click project initialization.

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Template title (e.g. `Restaurant & Cafe Bistro`) |
| `slug` | String | Yes | URL slug identifier |
| `category` | String | Yes | `Restaurant` \| `Clinic` \| `Fitness` \| `Salon` \| `Hotel` \| `Corporate` |
| `description` | String | Yes | Architectural summary and tech stack |
| `features` | Array | Yes | Included interactive capabilities |
| `isCustom` | Boolean | Yes | Whether created by user or built-in system template |
| `downloads` | Number | Yes | Count of projects spawned |

### 2.11. `lead_notes` Collection
Activity timeline, internal notes, and team collaboration records on individual leads.

| Field | Type | Required | Description |
|---|---|---|---|
| `leadId` | ObjectId | Yes | Reference to target lead |
| `organizationId` | ObjectId | Yes | Tenant boundary |
| `author` | String | Yes | Name of note creator |
| `content` | String | Yes | Note text content |
| `type` | String | Yes | `note` \| `call_log` \| `status_change` \| `audit` |

### 2.12. `outreach_messages` Collection
Outbound and inbound communication dispatches across Email, WhatsApp, and SMS with dry-run safety flags.

| Field | Type | Required | Description |
|---|---|---|---|
| `organizationId` | ObjectId | Yes | Tenant reference |
| `leadId` | ObjectId | Yes | Reference to lead prospect |
| `toEmail` | String | Yes | Recipient email address |
| `recipientName` | String | Yes | Recipient contact or business name |
| `subject` | String | Yes | Email subject line |
| `body` | String | Yes | Dispatched message body |
| `status` | String | Yes | `Sent` \| `Delivered` \| `Opened` \| `Replied` \| `Bounced` |
| `templateUsed` | String | No | Template identifier |
| `sentAt` | Date | Yes | Dispatch timestamp |

---

## 3. Database Indexes

- `organizations.slug`: Unique index
- `users.email`: Unique index
- `leads.organizationId_1_status_1`: Compound index for fast tenant filtering
- `clients.organizationId_1_status_1`: Compound index
- `campaigns.organizationId_1_status_1`: Compound index
- `projects.organizationId_1_status_1`: Compound index
- `agent_configs.organizationId_1_agentId_1`: Unique compound index
- `agent_executions.organizationId_1_agentId_1_createdAt_-1`: Fast audit search index
- `invoices.organizationId_1_status_1`: Invoicing ledger compound index
- `templates.organizationId_1_category_1`: Template filtering index
- `outreach_messages.organizationId_1_leadId_1`: Prospect communication timeline index

