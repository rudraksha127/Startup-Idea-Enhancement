# AgencyOS Database Architecture & Specification

## Overview

AgencyOS uses a multi-tenant document and relational data architecture powered by MongoDB 6.0+ (Mongoose ODM) with strict tenant isolation via `orgId` on every collection. It is designed to be fully compatible with PostgreSQL/Supabase via relational mapping or Azure Cosmos DB for MongoDB / AWS DocumentDB.

## Core Collections & Entities

| Collection | Model File | Purpose | Primary Keys & Indexes |
|---|---|---|---|
| `organizations` | `src/models/Organization.ts` | Multi-tenant tenant boundary, credits, plan | `_id`, `slug` (unique) |
| `users` | `src/models/User.ts` | Team members, bcrypt password hash, roles | `_id`, `email` (unique), `orgId` |
| `leads` | `src/models/Lead.ts` | Discovered business opportunities & audit scores | `_id`, `orgId`, `status`, `opportunityScore` |
| `leadnotes` | `src/models/LeadNote.ts` | Internal team comments and AI research notes | `_id`, `leadId`, `orgId` |
| `projects` | `src/models/Project.ts` | Web design contracts, milestones, budgets | `_id`, `orgId`, `clientId`, `status` |
| `agentconfigs` | `src/models/AgentConfig.ts` | AI agents configuration, prompts, schedule | `_id`, `orgId`, `name` |
| `outreachmessages`| `src/models/OutreachMessage.ts`| Email & WhatsApp communication sequence items | `_id`, `orgId`, `leadId`, `status` |

---

## Connection & Pool Management

Connections are managed via a cached singleton pattern in `src/lib/db/mongodb.ts`:
```typescript
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
// Preserves connection across Next.js Hot Module Replacement (HMR)
```

---

## Seeding Pipeline

To initialize a development or staging environment with sanitized mock data:
```bash
npm run seed
```
This executes `src/lib/seed/seed-data.ts`, populating:
- 1 Demo Organization (`AgencyOS Headquarters`)
- 1 Admin User (`founder@agencyos.ai` / password: `Password123!`)
- 27 Verified Indian SMB Leads across Indore, Jaipur, and Delhi
- 4 AI Agent Configurations (Research, Outreach, Reply Manager, Sales)
- 3 Active Client Projects with milestones and task checklists

---

## Backup and Recovery

### Local / Self-Hosted MongoDB
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/agencyos" --out="./database/backups/$(date +%F)"

# Restore
mongorestore --uri="mongodb://localhost:27017/agencyos" "./database/backups/2026-10-29/agencyos"
```

### Managed Atlas / Cloud DocumentDB
Automated point-in-time recovery (PITR) with 7-day retention enabled in production.

