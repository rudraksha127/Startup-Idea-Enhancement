# AgencyOS Backup & Disaster Recovery Specification

## 1. Recovery Objectives

- **Recovery Point Objective (RPO)**: < 1 hour for transactional business data (Leads, Invoices, Clients).
- **Recovery Time Objective (RTO)**: < 15 minutes for complete backend and frontend service restoration.

---

## 2. Backup Schedules & Mechanics

### Authoritative Application Store (MongoDB)
- **Automated Snapshots**: Daily continuous incremental backups managed via MongoDB Atlas.
- **Local & Self-Hosted Fallback**: Automated `mongodump` script in `database/backup/backup.sh` executed via cron every 6 hours with gzip compression.
- **Retention Policy**:
  - Hourly snapshots retained for 48 hours.
  - Daily backups retained for 30 days.
  - Monthly archives retained for 1 year in encrypted cold storage.

### n8n Execution State (PostgreSQL)
- Automated `pg_dump` of `n8n_execution_db` daily.
- All 24 workflow topologies are version-controlled in Git (`n8n/workflows/`), enabling instant re-import via `n8n/scripts/import/import-workflows.ts` in case of total execution database loss.

---

## 3. Disaster Recovery Execution Runbook

### Step 1: Database Restoration
```bash
# Execute restore from backup archive
./database/restore/restore.sh ./backups/latest/
```

### Step 2: Index & Migration Verification
```bash
# Re-apply compound indexes
npm run db:indexes

# Verify schema migrations
npm run db:migrate
```

### Step 3: Re-Import n8n Workflows
```bash
# Redeploy all version-controlled workflows
npx tsx n8n/scripts/deploy/deploy-workflows.ts production
```
