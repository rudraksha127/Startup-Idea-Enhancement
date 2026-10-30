# Database Migrations — AgencyOS
**Last Updated:** 2026-10-30

## Migration Strategy

AgencyOS uses the **expand-contract pattern** for zero-downtime schema migrations:

1. **Expand** — Add new fields/collections without removing old ones. Old code still works.
2. **Migrate** — Backfill data from old fields to new fields.
3. **Contract** — Once all code uses new fields, remove old fields.

This avoids deploying backend and database changes simultaneously.

---

## Current Schema Version: 1.0.0

All models defined in `apps/api/src/models/`. No breaking migrations have been applied yet.

---

## Migration History

### v1.0.0 — Initial Schema (2026-10-29)

**Status:** `APPLIED` (via Mongoose auto-create on first connect)

Collections created:
- `users` — Authentication and profile
- `organizations` — Multi-tenant root entity
- `leads` — Lead management
- `clients` — Client relationships
- `projects` — Project lifecycle
- `campaigns` — Outreach campaigns
- `outreachmessages` — Individual campaign messages
- `agentconfigs` — AI agent configuration

---

## Pending Migrations

### v1.1.0 — Compound Indexes (PENDING)

**Status:** `NOT_APPLIED`  
**Type:** Non-breaking additive  
**Impact:** Performance improvement; no schema change

Indexes to add:

```javascript
// users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ organizationId: 1 })

// leads
db.leads.createIndex({ organizationId: 1, createdAt: -1 })
db.leads.createIndex({ organizationId: 1, status: 1 })
db.leads.createIndex({ organizationId: 1, category: 1 })

// clients
db.clients.createIndex({ organizationId: 1, status: 1 })

// projects
db.projects.createIndex({ organizationId: 1, status: 1 })
db.projects.createIndex({ organizationId: 1, clientId: 1 })

// campaigns
db.campaigns.createIndex({ organizationId: 1, status: 1 })

// outreachmessages
db.outreachmessages.createIndex({ campaignId: 1, status: 1 })
db.outreachmessages.createIndex({ organizationId: 1, createdAt: -1 })

// agentconfigs
db.agentconfigs.createIndex({ organizationId: 1, type: 1 })
```

**Apply via:**
```bash
# Run against production Atlas (requires mongo shell or Atlas UI)
mongosh "$MONGODB_URI" --eval "load('database/indexes/v1.1.0-compound-indexes.js')"
```

**TODO:** Create `database/indexes/v1.1.0-compound-indexes.js` migration script.

---

### v1.2.0 — Audit Log Collection (PLANNED)

**Status:** `PLANNED`  
**Type:** New collection — additive  
**Impact:** None to existing functionality

```typescript
// AuditLog collection
{
  _id: ObjectId,
  timestamp: Date,
  requestId: string,
  userId: ObjectId | null,
  organizationId: ObjectId | null,
  method: string,        // GET, POST, PATCH, DELETE
  path: string,
  statusCode: number,
  durationMs: number,
  ipAddress: string,     // HASHED in storage (privacy)
  userAgent: string,
  // TTL index: auto-delete after 90 days
}
```

TTL index: `db.auditlogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })`

---

### v1.3.0 — Suppression List (PLANNED)

**Status:** `PLANNED`  
**Type:** New collection — additive  
**Compliance:** Required for DPDP Act 2023 + TRAI TCCCPR

```typescript
// SuppressionList collection
{
  _id: ObjectId,
  organizationId: ObjectId,
  type: "email" | "phone" | "domain",
  value: string,         // HASHED for privacy
  reason: string,        // "opt-out" | "bounce" | "spam-complaint"
  addedAt: Date,
  addedBy: ObjectId,     // userId who added it
}
```

---

## Migration Runbook

### Before Applying Any Migration

1. Take a MongoDB Atlas snapshot: Atlas UI → Cluster → ... → Take Snapshot
2. Verify backup is downloadable (not just queued)
3. Test migration script against a local copy: `mongorestore --drop`
4. Apply to staging first; monitor for 24h before production

### Rollback Procedure

1. Stop backend services
2. Atlas UI → Backups → Restore to point-in-time before migration
3. Redeploy previous backend version
4. Verify health check returns 200

### Emergency Rollback (Data-Loss Risk — Extreme Caution)

Only use if Atlas restore is not available:
```bash
# Drop new collection (non-breaking additions only)
db.newcollection.drop()

# Remove new index (non-breaking)
db.collection.dropIndex("index_name")
```

Never use `db.collection.drop()` on existing collections in production without authorization.

