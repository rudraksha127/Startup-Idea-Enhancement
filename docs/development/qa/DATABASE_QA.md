# Independent QA Report: Database, Storage & Persistence Architecture
**Document Reference:** `docs/development/qa/DATABASE_QA.md`  
**Auditor Workstream:** Database & Persistence QA Specialist (Specialist Agent D)  
**Audited Commit:** `3be5222e48abe8c000c88009ae4cfb83749b97ad` (Branch: `agent/antigravity/audit-repository`)  
**Status:** Canonical Evidence-Backed Audit (Post-Review Reconciled)  
**Classification Standard:** `PRODUCTION_READY` | `IN_MEMORY_FALLBACK` | `ARCHITECTURAL_DEVIATION` | `DEFECT`

---

## 1. Executive Summary

This independent quality audit evaluates the data layer, persistence strategy, multi-tenant data isolation, referential integrity, and database tooling across AgencyOS.

### Critical Findings:
1. **Canonical Target Architecture vs Current-State Deviations:**
   - **Canonical Project Target (`AGENTS.md`):** The authoritative technical guidelines mandate **Supabase (PostgreSQL 16) with Row Level Security (RLS) on all tables, Supabase Auth, and Edge Functions**.
   - **Current-State Deviation 1 (MongoDB):** Stated in legacy ADR-004, dependencies in `package.json` (`mongoose`), and directly queried in Next.js handlers (`frontend/src/app/api/teams/members/route.ts`).
   - **Current-State Deviation 2 (Zoho Catalyst Data Store):** Stated in ADR-005 and implemented in `backend/src/infrastructure/persistence/zoho-catalyst/` via a custom ZCQL adapter.
   - **Remediation Requirement:** Maintainers must recognize both MongoDB and Zoho Catalyst as intermediate deviations and converge the persistence tier on the canonical Supabase PostgreSQL 16 stack.
2. **Volatile In-Memory Fallback (P0 — Data Loss Risk):**
   - In `backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` lines 27–33:
     ```typescript
     // In-Memory ZCQL Store for offline local development and CI tests
     private inMemoryStore: Map<string, Map<string, Record<string, any>>> = new Map();
     ```
   - When running locally or outside an authentic Zoho Catalyst AppSail environment, `isLiveMode` is `false`.
   - **All database operations execute against process-local Node.js memory (`inMemoryStore`).**
   - As a result, restarting the Express server (`npm run dev:api`) instantly destroys all created organizations, users, leads, team members, and projects.
3. **Failed Live Writes Masked as Phantom Success (P0):**
   - In `backend/src/infrastructure/persistence/zoho-catalyst/catalyst.client.ts` lines 178–184 and 210–216:
     ```typescript
     if (this.isLiveMode && this.catalystApp) {
       try {
         const catalystTable = datastore.table(tableName);
         await catalystTable.updateRow(updated);
       } catch (err) {
         console.warn(`[Catalyst DataStore] updateRow live warning for ${tableName}:`, err);
       }
     }
     table.set(String(rowId), updated);
     return updated as T;
     ```
   - When a live Catalyst write fails (due to network timeout, schema violation, or quota exhaustion), the error is caught, logged as a warning, and swallowed. The record is then written to the local in-memory Map and returned as success!
   - Subsequent live reads still query Catalyst, where the row does not exist, causing data divergence and phantom writes.
4. **Permanent Hard Deletions in LeadsRepository (P1):**
   - In `backend/src/repositories/leads.repository.ts` line 34:
     ```typescript
     static async delete(leadId: string, orgId: string): Promise<boolean> {
       return catalystClient.deleteRow("Leads", leadId);
     }
     ```
     Lead deletion is a **HARD DELETE**. The row is permanently removed from the data store without setting `deletedAt`. Deleted leads are unrecoverable.
5. **No Persistent Suppression List Storage (P1):**
   - Neither the Catalyst table manifest nor MongoDB schemas define a suppression list table. Opt-outs and "do not contact" requests cannot be persisted across restarts.

---

## 2. Actual Catalyst Table Manifest & Schema Inventory

The checked-in Catalyst table manifest (`database/zoho-catalyst/manifests/tables.json`) and `catalyst.client.ts` initialize exactly **18 tables** (PascalCase):

| Table Name | Entity Description | Primary Identifier | Tenant Identifier Column |
|---|---|---|---|
| `Organizations` | Tenant Workspaces & Credit Balance | `orgId` / `ROWID` | `orgId` |
| `Users` | Operator Accounts & Password Hashes | `userId` / `ROWID` | `organizationId` |
| `Leads` | Discovered Business Leads & Scores | `leadId` / `ROWID` | `organizationId` |
| `LeadAudits` | Performance, SEO & CWV Scores | `auditId` / `ROWID` | `organizationId` |
| `LeadNotes` | Internal Team Collaboration Notes | `noteId` / `ROWID` | `organizationId` |
| `Campaigns` | Multi-Channel Outreach Campaigns | `campaignId` / `ROWID` | `organizationId` |
| `OutreachMessages`| Dispatched Email / Channel Messages | `messageId` / `ROWID` | `organizationId` |
| `Replies` | Inbound Prospect Email Responses | `replyId` / `ROWID` | `organizationId` |
| `Meetings` | Scheduled Prospect Appointments | `meetingId` / `ROWID` | `organizationId` |
| `Proposals` | Generated Business Proposals | `proposalId` / `ROWID` | `organizationId` |
| `Clients` | Converted Paying Client Directory | `clientId` / `ROWID` | `organizationId` |
| `Projects` | Delivery Pipelines & Scope Meters | `projectId` / `ROWID` | `organizationId` |
| `Tasks` | Delivery Milestones & Checkpoints | `taskId` / `ROWID` | `organizationId` |
| `Templates` | Website Builder Industry Starter Designs| `templateId` / `ROWID` | System / Global |
| `Invoices` | Billing & Retainer Invoices | `invoiceId` / `ROWID` | `organizationId` |
| `AgentConfigs` | Autonomous AI Agent Configurations | `agentId` / `ROWID` | `organizationId` |
| `AgentExecutions` | Execution Logs & Token Telemetry | `executionId` / `ROWID`| `organizationId` |
| `AuditLogs` | System & Operator Audit Trails | `logId` / `ROWID` | `organizationId` |

*Note: There is NO `Settings` table in the Catalyst Data Store manifest; workspace configuration is currently unpersisted in the Catalyst schema.*

---

## 3. Prioritized Persistence Recommendations
1. **P0 Target Architecture Convergence (Supabase PostgreSQL 16):**
   - Align the persistence tier with `AGENTS.md`: Provision Supabase PostgreSQL 16 with Row Level Security (RLS) policies on all tables.
   - Deprecate both the MongoDB schemas and the custom Catalyst ZCQL adapter.
2. **P0 Eliminate Swallowed Write Errors:**
   - Throw fatal errors when database writes fail in `catalyst.client.ts` rather than masking failures with local in-memory writes.
3. **P1 Implement Soft Deletion:**
   - Add `deletedAt: Date | null` to `Leads` and update `LeadsRepository.delete` to mark records as deleted rather than executing hard removal.
4. **P1 Persistent Suppression List Table:**
   - Create a dedicated `suppression_list` table with columns `(id, organizationId, email, phone, domain, reason, createdAt)` to guarantee DPDP Act 2023 compliance.
