# AgencyOS — Zoho Catalyst CloudScale Data Store Architecture

**Platform:** Zoho Catalyst CloudScale Data Store  
**Query Interface:** ZCQL (Zoho Catalyst Query Language)  
**SDK:** `zcatalyst-sdk-node`  

---

## 1. Architecture Overview

Zoho Catalyst CloudScale Data Store is the sole authoritative business database for AgencyOS. All business entities (Organizations, Users, Leads, Audits, Campaigns, Invoices, Projects, Tasks, Templates, Agent Executions) are stored in Catalyst tables.

```text
database/zoho-catalyst/
├── manifests/       # JSON table manifests for Catalyst console/CLI provisioning
├── schema/          # Zod schema definitions and TypeScript entity interfaces
├── migrations/      # Idempotent table migration scripts
├── provisioning/    # Provisioning automation scripts using Catalyst SDK
├── indexes/         # Column index definitions and uniqueness rules
├── constraints/     # Foreign key and column validation constraints
├── seed/            # Seed data fixtures for local testing
├── validation/      # Schema integrity check scripts
└── backup/          # Export and backup procedures
```

## 2. Table Manifest Inventory (17 Tables)

1. `Organizations` — Multi-tenant organization boundaries, tier, and billing identifiers.
2. `Users` — User profiles, password hashes, roles (Owner, Admin, PM, Specialist, Viewer).
3. `Leads` — Business leads, category, city, address, rating, review count, opportunity score.
4. `LeadAudits` — Technical website audit data (Lighthouse, SEO, mobile, detected tech).
5. `LeadNotes` — Activity notes and internal audit logs on individual leads.
6. `Campaigns` — Outreach campaigns, audience, channels, status, approval state.
7. `OutreachMessages` — Individual generated drafts, sent emails, delivery tracking.
8. `Replies` — Inbound webhook replies, intent classification, sentiment.
9. `Meetings` — Scheduled calendar bookings, video links, attendee emails.
10. `Proposals` — Scopes of work, milestone pricing, deliverable specs.
11. `Clients` — Converted paying clients, contact persons, lifetime value.
12. `Projects` — Active client projects, budgets, deadlines, status.
13. `Tasks` — Kanban tasks, milestone assignments, status.
14. `Templates` — Reusable website and proposal templates.
15. `Invoices` — Stripe invoices, line items, status, payment transaction IDs.
16. `AgentConfigs` — Configuration and model assignments for 13 canonical agents.
17. `AgentExecutions` — Execution run logs, token usage, duration, output payloads.
18. `AuditLogs` — Immutable security, HTTP audit, and permission event records.
