# AgencyOS Data Flow & Information Architecture

This document describes how data enters, transitions, and is persisted across the AgencyOS platform.

---

## 1. High-Level Data Flow Architecture

```mermaid
flowchart TD
    subgraph Ingestion
        A1[Google Places API] -->|Search Results| B[Data Ingest Controller]
        A2[CSV Upload / PapaParse] -->|Parsed Leads| B
        A3[n8n Webhook /api/leads] -->|JSON Payload| B
    end

    subgraph Validation & Normalization
        B -->|Raw Input| C{Zod Schema Validator}
        C -->|Valid| D[Lead Normalizer & Sanitizer]
        C -->|Invalid| E[400 Bad Request / Error Log]
    end

    subgraph Persistence & Enrichment
        D -->|Persist New Lead| F[(MongoDB: leads)]
        F -->|Trigger Audit| G[Audit & Research Agent]
        G -->|Diagnostic Scores| H[(MongoDB: auditScores)]
    end

    subgraph Presentation & Action
        H -->|Render Table & Rings| I[Dashboard & Dossier UI]
        I -->|Status: Contacted| J[Outreach Sequence Dispatcher]
        J -->|Send Cold Email| K[Resend Email Provider / Dry Run]
    end
```

---

## 2. Lead Lifecycle State Machine

A lead transitions through 6 deterministic states:

```mermaid
stateDiagram-v2
    [*] --> New: Ingested via Places / CSV / Webhook
    New --> Contacted: Outreach Sequence Step 1 Sent
    Contacted --> Replied: Inbound Email / WhatsApp Received
    Replied --> Interested: AI Intent Classifier = Interested
    Interested --> Converted: Founder Closes Deal / Project Created
    Contacted --> Archived: Objection / Unsubscribe / Bounce
    New --> Archived: Low Opportunity Score (<3.0)
    Converted --> [*]
    Archived --> [*]
```

### State Transition Invariants:
1. `New` to `Contacted`: Requires valid email/phone and passed suppression list check.
2. `Contacted` to `Replied`: Triggered automatically by webhook from email/messaging provider.
3. `Replied` to `Archived`: Instant transition if message contains unsubscribe keywords ("stop", "remove", "unsubscribe").
4. `Interested` to `Converted`: Creates a corresponding record in `projects` collection with initial status `Active`.

