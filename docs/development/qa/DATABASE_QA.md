# Independent QA Report: Database, Storage & Persistence Architecture
**Document Reference:** `docs/development/qa/DATABASE_QA.md`  
**Auditor Workstream:** Database & Persistence QA Specialist (Specialist Agent D)  
**Audited Commit:** `3be5222e48abe8c000c88009ae4cfb83749b97ad` (Branch: `agent/antigravity/audit-repository`)  
**Status:** Canonical Evidence-Backed Audit  
**Classification Standard:** `PRODUCTION_READY` | `IN_MEMORY_FALLBACK` | `ARCHITECTURAL_CONTRADICTION` | `DEFECT`

---

## 1. Executive Summary

This independent quality audit evaluates the data layer, persistence strategy, multi-tenant data isolation, referential integrity, and database tooling across AgencyOS.

### Critical Findings:
1. **Architectural Contradiction (MongoDB vs Zoho Catalyst Data Store):**
   - Architectural Decision Record `docs/architecture/decisions/ADR-004-nextjs-mongodb-saas-migration.md` and `docs/architecture/DATABASE_DESIGN.md` document **MongoDB 7.0 with Mongoose ODM** as the canonical system database.
   - `package.json` installs `"mongoose": "^8.9.3"` as a production dependency.
   - Conversely, Architectural Decision Record `ADR-005` and the actual TypeScript backend in `backend/src/infrastructure/persistence/zoho-catalyst/` implement a **Zoho Catalyst CloudScale Data Store / ZCQL client**.
   - Mongoose is **never imported** anywhere in `backend/src/`! The entire modular backend executes against the Zoho Catalyst client adapter.
2. **Volatile In-Memory Fallback (P0 — Data Loss Risk):**
   - In `backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` lines 27–33:
     ```typescript
     // In-Memory ZCQL Store for offline local development and CI tests
     private inMemoryStore: Map<string, Map<string, Record<string, any>>> = new Map();
     ```
   - When running locally or outside an authentic Zoho Catalyst AppSail environment, `isLiveMode` is `false`.
   - **All database operations (leads, organizations, users, agents, projects, invoices) are stored in volatile Node.js process memory (`inMemoryStore`).**
   - As a result, restarting the Express server (`npm run dev:api`) instantly destroys all created users, leads, team members, and outreach records.
3. **Database Scripts & Migration Readiness:**
   - `package.json` defines database management commands:
     - `"db:indexes": "tsx database/scripts/manage.ts indexes"`
     - `"db:migrate": "tsx database/scripts/manage.ts migrate"`
     - `"db:seed": "tsx database/scripts/manage.ts seed"`
     - `"db:health": "tsx database/scripts/manage.ts health"`
   - These scripts are implemented under `database/scripts/manage.ts`. However, they are designed to interact with MongoDB, further exposing the architectural contradiction with Zoho Catalyst.

---

## 2. Data Store Table Schemas & Entities

The Zoho Catalyst client maintains 10 logical tables in its ZCQL schema:

| Table Name | Entity | Primary Key | Tenant Key | Key Columns | Indexes / Constraints |
|---|---|---|---|---|---|
| `organizations` | Tenant Workspace | `orgId` / `ROWID` | `orgId` | `name`, `slug`, `credits`, `status` | Unique `orgId` |
| `users` | User Account | `userId` / `ROWID` | `organizationId` | `email`, `passwordHash`, `role` | Unique `email` per org |
| `leads` | Discovered Prospect | `leadId` / `ROWID` | `organizationId` | `businessName`, `category`, `score` | Index `(orgId, status)` |
| `agents` | System AI Agent | `agentId` / `ROWID` | `organizationId` | `name`, `role`, `status`, `model` | Index `(orgId, agentId)` |
| `agent_executions` | Execution Log | `executionId` | `organizationId` | `agentId`, `status`, `tokens`, `latency` | Index `(orgId, createdAt)` |
| `projects` | Delivery Project | `projectId` / `ROWID`| `organizationId` | `name`, `clientId`, `budget`, `status`| Index `(orgId, status)` |
| `invoices` | Billing Record | `invoiceId` / `ROWID`| `organizationId` | `amount`, `currency`, `status`, `due` | Index `(orgId, status)` |
| `clients` | Client CRM | `clientId` / `ROWID` | `organizationId` | `name`, `company`, `retainerTier` | Index `(orgId, clientId)` |
| `templates` | Website Template | `templateId` | System / Org | `name`, `industry`, `pagespeed` | System global table |
| `settings` | Workspace Config | `settingId` | `organizationId` | `compliance`, `killSwitch`, `apiKeys`| Unique per org |

---

## 3. Data Integrity & Persistence Gaps

1. **Absence of Hard Multi-Tenant Foreign Keys:**
   - Because Catalyst Data Store is a cloud relational store with limited cross-table cascading, referential integrity between `leads` and `agent_executions` or `projects` and `clients` is managed via software-level repository checks rather than hard database foreign key constraints.
2. **Soft Delete Inconsistency:**
   - `LeadsRepository` and `TeamsRepository` implement `deletedAt: new Date()` soft deletes, but `ProjectsRepository` and `InvoicesRepository` perform hard deletes (`DELETE FROM Table WHERE ROWID = ...`).
3. **Suppression List & Privacy Persistence:**
   - DPDP 2023 compliance requires a persistent suppression list (`do_not_contact`). Currently, the suppression list is stored as a column within `settings`, meaning in-memory mode wipes suppression lists on restart.

---

## 4. Prioritized Persistence Recommendations
1. **P0 Resolution of Architecture Contradiction:**
   - Formalize an Architecture Decision Record (ADR-007) that explicitly settles whether AgencyOS will run on **Zoho Catalyst Data Store (CloudScale)** or **MongoDB Atlas / DocumentDB**.
   - If Zoho Catalyst is the final production target:
     - Remove `mongoose` from `package.json`.
     - Update `database/scripts/manage.ts` to operate against Catalyst Data Store via ZCQL.
   - If MongoDB is the desired database:
     - Implement real Mongoose schemas in `backend/src/models/` and connect via `connectDB()`.
2. **P0 Local Persistence Engine:**
   - For local development and testing, replace the volatile `inMemoryStore` Map with an SQLite or embedded file-backed database (e.g. `sqlite3` or `better-sqlite3`) to prevent data loss across restarts when offline.
3. **P1 Standardize Deletions:**
   - Enforce soft-delete invariants across all tables (`deletedAt: Date | null`) to prevent accidental data destruction.
