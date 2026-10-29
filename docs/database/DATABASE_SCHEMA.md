# AgencyOS Database Schema Specification

**Engine:** MongoDB 6.0+ / Mongoose ODM (Relational-compatible)  
**Multi-Tenant Model:** Strict `orgId` isolation across all collections  

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : contains
    ORGANIZATION ||--o{ LEAD : discovers
    ORGANIZATION ||--o{ PROJECT : delivers
    ORGANIZATION ||--o{ AGENT_CONFIG : configures
    LEAD ||--o{ LEAD_NOTE : logs
    LEAD ||--o{ OUTREACH_MESSAGE : receives
    LEAD ||--o| PROJECT : converts_to

    ORGANIZATION {
        string _id PK
        string name
        string slug UK
        string plan
        number creditsUsed
        number creditsLimit
        date createdAt
    }

    USER {
        string _id PK
        string orgId FK
        string name
        string email UK
        string passwordHash
        string role
        boolean twoFactor
        date createdAt
    }

    LEAD {
        string _id PK
        string orgId FK
        string businessName
        string slug UK
        string category
        string location
        string website
        number rating
        number reviewCount
        number opportunityScore
        string status
        object auditScores
        date createdAt
    }

    PROJECT {
        string _id PK
        string orgId FK
        string clientId FK
        string name
        number budget
        number amountPaid
        number amountDue
        number progress
        string status
        array milestones
        date deadline
    }

    AGENT_CONFIG {
        string _id PK
        string orgId FK
        string name
        string category
        string model
        number temperature
        number maxTokens
        string systemPrompt
        string cronSchedule
        string status
    }
```

---

## 2. Collection Definitions & Indexes

### `leads` Collection
- **Indexes:**
  - `{ orgId: 1, status: 1 }` (Status tab filtering)
  - `{ orgId: 1, opportunityScore: -1 }` (Score sorting)
  - `{ orgId: 1, businessName: "text", category: "text", location: "text" }` (Search)
- **Validation Constraints:**
  - `opportunityScore`: Number between 1.0 and 10.0
  - `status`: Enum (`['New', 'Contacted', 'Interested', 'Replied', 'Converted', 'Archived']`)

### `projects` Collection
- **Indexes:**
  - `{ orgId: 1, status: 1 }`
  - `{ orgId: 1, deadline: 1 }`
- **Fields:**
  - `budget`, `amountPaid`, `amountDue` (in INR currency units)
  - `progress` (0 to 100 percentage)

