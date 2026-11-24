# Architecture Decision Log — AgencyOS Engineering

**Document Reference:** `docs/engineering/DECISION_LOG.md`  
**Governance:** AgencyOS Multi-Agent Architecture Board (Rudraksh, ChatGPT, Antigravity)  
**Status:** ACTIVE  
**Last Updated:** 2026-11-24  

---

## Index of Architectural Decisions

| ADR ID | Date | Title | Deciders | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | 2026-10-29 | Core Tech Stack Selection (Next.js, Tailwind, Node.js) | Principal Architect | `Accepted` |
| **ADR-002** | 2026-10-29 | Audit Engine Inward Pivot (Self-Hosted Workers vs 3rd Party) | Full-Stack Lead | `Accepted` |
| **ADR-003** | 2026-10-29 | Client Headless CMS Integration Architecture | Frontend Architect | `Accepted` |
| **ADR-004** | 2026-10-29 | Monolithic Next.js Deployment Model | Systems Architect | `Superseded by ADR-005` |
| **ADR-005** | 2026-10-30 | Dual-Tier Topology: Cloudflare Pages (Frontend) & Zoho Catalyst (Express API) | Enterprise Architecture Team | `Accepted` |
| **ADR-006** | 2026-11-24 | GitHub-Mediated Multi-Agent Collaboration Protocol (ChatGPT × Antigravity × GitHub) | Rudraksh, ChatGPT, Antigravity | `Accepted` |

---

## Detailed Records

### ADR-006: GitHub-Mediated Multi-Agent Collaboration Protocol

- **Status:** Accepted  
- **Date:** 24 November 2026  
- **Deciders:** Rudraksh (Project Owner), Antigravity (Implementation Agent), ChatGPT (Architecture & Review Agent)  

#### 1. Context and Problem Statement
AgencyOS requires high-velocity engineering, continuous technical audits, and cross-functional reviews. The development workflow involves:
- **ChatGPT:** High-level product architecture, technical planning, threat modeling, code review, and QA strategy.
- **Google Antigravity:** Direct local repository implementation, terminal execution, debugging, and testing inside the Windows development workspace.
- **Rudraksh:** Project owner, business decision-maker, and final release gatekeeper.

Because live agent-to-agent inter-process memory does not exist natively across disparate IDE/model vendor boundaries, a durable, deterministic, and auditable synchronization mechanism is required to prevent context degradation and duplicate work.

#### 2. Alternatives Considered
1. **Option A: Custom Local Webhook / Socket Server:**
   - *Pros:* Near real-time message exchange.
   - *Cons:* Fragile, ephemeral, requires opening local ports, zero persistent history outside active sessions, no native code-diff review tools.
2. **Option B: Manual Copy-Paste via Chat Prompts:**
   - *Pros:* No tool setup required.
   - *Cons:* Extremely high human fatigue, prone to truncated files, loss of commit lineage, impossible to maintain 77-screen architectural fidelity.
3. **Option C: Git-Mediated Synchronization via PRs, Work Queues, and Root Handoff (Selected):**
   - *Pros:* Leverages GitHub as the single immutable source of truth; git commits preserve exact SHAs; GitHub PR reviews provide native diffs, inline comments, and CI/CD triggers; Markdown handoffs (`AGENT_HANDOFF.md`, `WORK_QUEUE.md`) persist across all restarts.
   - *Cons:* Requires discipline around atomic commits and clean branch management.

#### 3. Decision
We accept **Option C**:
1. All agent handoffs are persisted in root `AGENT_HANDOFF.md` and tracked in `docs/engineering/WORK_QUEUE.md`.
2. Antigravity operates on isolated branches (`agent/antigravity/*`) and submits changes via GitHub Pull Requests.
3. ChatGPT reviews committed diffs and specifications via GitHub PRs and persistent repository markdown files.
4. Rudraksh holds sole authority to merge pull requests into `main` and execute production deployments.

#### 4. Consequences
- **Positive:** Absolute auditability, strict policy prohibiting committing or pushing secrets (mitigating exposure risk), resilient to IDE restarts, seamless asynchronous coordination.
- **Negative:** Agents must conscientiously update handoff documents and git logs upon completing each task.
