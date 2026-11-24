# 17 — Documentation and ADR Contradictions

**Scope:** `docs/` — 136 files including architecture, planning, execution, and ADRs.

---

## 1. The problem in one sentence

The repository's documentation describes three different products, none of which is the product the code implements, and asserts a test result that is false.

---

## 2. The ADR conflict

### 2.1 ADR-004 — "Next.js MongoDB SaaS Migration"

`SOURCE-VERIFIED`: mandates a migration to Next.js with MongoDB as the application database, on assumptions inherited from an earlier Supabase-era design.

### 2.2 ADR-005 — "Cloudflare Pages + Zoho Express Topology"

`SOURCE-VERIFIED`: mandates Cloudflare **Pages** for the frontend and a Zoho-hosted Express backend.

### 2.3 Reality

| Claim | ADR-004 | ADR-005 | Code |
|---|---|---|---|
| App database | MongoDB | (unstated) | Mongoose **and** Catalyst, both present, neither authoritative |
| Frontend host | (unstated) | Cloudflare **Pages** | Cloudflare **Workers** (`wrangler.json`) |
| Backend host | (unstated) | Zoho Express | Express 5, deployment target unverified |
| Build | — | — | OpenNext Worker |

Both ADRs are in force by convention (no superseding record), and they contradict each other on the hosting target while both contradict the code.

### 2.4 Why contradictory ADRs are worse than none

An ADR exists to end debate. Two incompatible ADRs restart it every time a decision arises. A new engineer reading both will pick whichever they read last; a contractor will pick the simpler one; an auditor will conclude governance is absent.

### 2.5 Resolution (`PROPOSED`, ADR-006)

A new ADR-006 supersedes both, recording:

1. Deployment target is **Cloudflare Workers** via OpenNext. Pages is not used. Rationale: current platform guidance (R4), and the code already does this.
2. **Zoho Catalyst Data Store** is the authoritative business database. MongoDB is removed from the runtime path.
3. Express is retained only for workloads requiring a long-lived Node process (durable workers, scheduled jobs), reached over HTTPS.
4. ADR-004 and ADR-005 are marked `Superseded` with a pointer to ADR-006. They are not deleted — the history is valuable.

`27` provides the content for ADR-006.

---

## 3. The status documents

### 3.1 The false claim

`docs/execution/CURRENT_STATUS.md` and `docs/IMPLEMENTATION_STATUS.md` assert that the test suite passes **72/72** and that modules are `WORKING`.

`TEST-VERIFIED`: the suite is **71/72**, exit code 1.

### 3.2 Why this is a governance failure, not a typo

1. The status document is hand-maintained, so it records intent rather than fact.
2. Nothing regenerates it from CI.
3. Because it says everything works, nobody investigates what does not.
4. It creates a **record** that could be shown to an investor or customer. A false status record shown in diligence is a serious problem.

### 3.3 Correction (`PROPOSED`)

- `CURRENT_STATUS.md` becomes **generated**: a script reads the latest CI run, test counts, coverage, open risks, and known-broken features, and writes the file. A human may add commentary in a clearly separated section.
- A header states the commit SHA and generation timestamp.
- Any hand-written claim of "working" must link to a passing test or be labelled `UNVERIFIED`.
- The current files are replaced, not appended to.

---

## 4. Documentation that describes nonexistent software

| Document | Claims | Reality |
|---|---|---|
| `docs/architecture/DATABASE_DESIGN.md` | PostgreSQL 16 / Supabase, RLS on all tables | Neither PostgreSQL nor Supabase is used |
| `backend/workers/README.md` | BullMQ / Catalyst worker processes | No worker source exists |
| `docs/IMPLEMENTATION_STATUS.md` | All modules WORKING | Most are stubs |
| n8n workflow docs | 25 automations | 4-node placeholders, no execution evidence |
| `ADR-005` | Cloudflare Pages | Worker |

`SOURCE-VERIFIED` for the documents; `SOURCE-VERIFIED` for the absence of corresponding code.

### 4.1 The Supabase document specifically

`DATABASE_DESIGN.md` specifies a PostgreSQL schema with Row Level Security on every table. This is a **good design** — RLS is the correct isolation mechanism — applied to a stack the company is not using. Its value is as a **design reference**: the tables, relationships, and RLS policies are a reasonable starting model for the Catalyst schema.

**Recommendation:** retain it as `docs/archive/DATABASE_DESIGN_supabase-era.md` with a header explaining its status, and mine it when authoring the Catalyst manifest.

---

## 5. Documentation that is accurate and valuable

Not everything is defective. Worth preserving:

| Document | Why |
|---|---|
| `AGENTS.md` | Clear operating rules; the source policy and dry-run requirements are sound and this plan adopts them |
| `docs/architecture/API_SPECIFICATION.md` | Describes intended contracts; useful as input to `33` even where unimplemented |
| `docs/planning/BACKLOG.md` | Historical task record |
| Individual ADRs 001–003 | Encode real earlier decisions |

---

## 6. The documentation debt rule (`PROPOSED`)

Adopt a rule from `AGENTS.md` §4 and enforce it:

> A change that alters behaviour must update the doc that describes that behaviour **in the same commit**. A doc that describes behaviour must name the file that implements it. If it cannot name one, it is marked `ASPIRATIONAL`.

Add a CI check: every architecture doc must contain at least one `Implements: path/to/file` reference that resolves. This mechanically prevents documents from describing software that does not exist.

---

## 7. Naming and taxonomy inconsistencies

Observed (`SOURCE-VERIFIED`):

| Inconsistency | Instances |
|---|---|
| Framework version | "Next.js 15" in docs; `next@^16.4.6` installed |
| Hosting | "Cloudflare Pages" vs Workers |
| Database | PostgreSQL vs Supabase vs MongoDB vs Catalyst |
| Lead status enum | 4 variants (`07`) |
| Opportunity score scale | 1–10 vs 0–100 |
| Shared packages | `shared-types`/`utilities` vs `contracts`/`utils` |
| Backend name | "Express API", "AppSail backend", "Zoho Express" |

Each is small. Together they mean no document can be trusted to describe the current state without cross-checking code.

---

## 8. Recommended documentation target state

```
docs/
├── README.md                     # what this repo is, how to run it, what is real
├── architecture/
│   ├── SYSTEM_OVERVIEW.md        # generated diagram + narrative
│   ├── DATA_MODEL.md             # generated from Catalyst manifest
│   ├── API_SPECIFICATION.md      # generated from route/contract definitions
│   └── decisions/
│       ├── ADR-001..005          # historical, ADR-004/005 marked Superseded
│       └── ADR-006-target-architecture.md
├── operations/
│   ├── RUNBOOK_DEPLOY.md
│   ├── RUNBOOK_ROLLBACK.md
│   ├── RUNBOOK_INCIDENT.md
│   └── RUNBOOK_SCHEMA_CHANGE.md
├── compliance/
│   ├── DATA_PROCESSING_INVENTORY.md
│   ├── RETENTION_POLICY.md
│   └── CONSENT_MODEL.md
├── execution/
│   ├── CURRENT_STATUS.md         # GENERATED
│   └── KNOWN_LIMITATIONS.md      # hand-written, brutally honest
└── archive/                      # superseded designs, clearly marked
```

Key principle: **anything that can be generated from code should be generated**. Prose that restates code drifts; prose that explains *why* does not.

---

## 9. Verdict

| Dimension | Assessment |
|---|---|
| ADR governance | **Broken** — two conflicting ADRs in force |
| Status accuracy | **False** — claims a passing suite |
| Architecture docs | Describe an unused stack |
| Operational runbooks | Absent |
| Compliance docs | Absent |
| `AGENTS.md` | **Good** — adopt and enforce |
| Historical value | Real — archive, don't delete |

Documentation is the cheapest place to fix credibility and the fastest signal to an auditor that the team is now serious. Rewriting four files and adding ADR-006 is roughly two days of work with disproportionate effect.
