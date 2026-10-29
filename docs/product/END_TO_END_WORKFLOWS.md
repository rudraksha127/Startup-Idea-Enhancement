# AgencyOS End-to-End Operational Workflows

This document outlines the standard operating procedures and technical workflows across the full agency lifecycle.

---

## Workflow 1: Market Prospecting to Qualified Lead Dossier

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant UI as AgencyOS Web (/map-explorer)
    participant API as /api/leads
    participant AI as Gemini 2.5 Flash
    participant DB as MongoDB / Supabase

    Founder->>UI: Selects city "Indore" & category "Restaurant"
    UI->>API: POST /api/leads (Initiate Batch Scan)
    API->>AI: Evaluate Google Places listings & website health
    AI-->>API: Return Opportunity Score (8.5/10) + Diagnostic
    API->>DB: Persist Lead Record with 6 Score Rings
    DB-->>UI: Display Lead in Table with "New" status
    UI-->>Founder: Show toast & update Dashboard KPI counts
```

---

## Workflow 2: Outreach Campaign to Meeting Scheduled

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant Outreach as /outreach Sequence Builder
    participant Engine as Email Dispatcher (Resend)
    actor Client as Business Owner

    Founder->>Outreach: Selects Campaign "Indore Restaurants"
    Outreach->>Engine: Queue Step 1: Initial Technical Audit Pitch (Dry Run or Live)
    Engine-->>Client: Deliver Personalized Cold Email
    Client-->>Outreach: Inbound Email Reply ("Sounds interesting, what is pricing?")
    Outreach->>Outreach: AI Reply Manager classifies as "Interested"
    Outreach-->>Founder: Notify founder & draft booking response
    Founder->>Client: Send Cal.com meeting booking link
```

---

## Workflow 3: Converted Client to Website Delivery Handoff

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Agency Founder
    participant Leads as /leads/[leadId]
    participant Projects as /projects
    participant Dev as Engineering Team

    Founder->>Leads: Change status to "Converted"
    Leads->>Projects: Auto-generate Project Record & Developer Brief
    Projects->>Projects: Select template "Restaurant Pro" & define milestones
    Projects-->>Dev: Export Developer Brief (Markdown / PDF)
    Dev->>Projects: Update milestones (Design -> Frontend -> Backend -> QA -> Go Live)
    Projects-->>Founder: Update Billing & MRR metrics
```

---

## Exception Handling & Safeguards

1. **Suppression List Guard:** If a business owner requests "Unsubscribe", the AI Reply Manager immediately changes their status to `Archived`, updates the suppression list, and cancels all pending sequence steps.
2. **AI Rate Limiting / Budget Guard:** If monthly LLM token spend exceeds `$250` (or configured budget in `/settings`), background agents pause automatically, preventing unexpected billing spikes.
3. **Dry-Run Default:** All outbound connectors remain in simulation mode unless explicitly enabled in workspace settings.

