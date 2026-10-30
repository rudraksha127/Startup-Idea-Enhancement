# AgencyOS Database Management & Lifecycle

AgencyOS uses **MongoDB** as its authoritative application data store, with strict schema enforcement, multi-tenant isolation boundaries, and automated index management.

## Directory Structure

```text
database/
├── schemas/       # Zod & JSON validation contracts for entities
├── models/        # Mongoose database models & interfaces
├── indexes/       # Production compound & text index definitions
├── migrations/    # Idempotent migration scripts & runner
├── seed/          # Realistic multi-tenant seed data
├── scripts/       # Database CLI management utility
├── backup/        # Automated mongodump backup scripts
├── restore/       # Automated mongorestore recovery scripts
└── README.md      # This specification
```

## Multi-Tenant Isolation

All core collections (`leads`, `users`, `projects`, `clients`, `invoices`, `campaigns`, `agentexecutions`) are partitioned by `organizationId`. Every query and mutation executed by backend controllers and n8n webhooks strictly resolves and enforces `organizationId`.

## Commands

```bash
# Verify connection & list collections
npm run db:health

# Apply compound and unique indexes
npm run db:indexes

# Run pending database migrations
npm run db:migrate

# Seed demo workspace with realistic Indian SMB leads & clients
npm run db:seed
```
