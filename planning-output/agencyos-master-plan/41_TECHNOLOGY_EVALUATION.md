# 41 — Technology Evaluation

Each candidate assessed against the actual need, not against its own marketing. Licences verified 17 November 2026 (R1–R10).

**Verdict vocabulary:** ADOPT · CONSTRAIN · DEFER · REJECT.

---

## 1. Summary table

| Candidate | Licence | Verdict | Milestone | One-line reason |
|---|---|---|---|---|
| **Temporal** | MIT | **ADOPT** | M4 | Durable execution is the missing primitive; no licence constraint |
| **n8n** | Sustainable Use (**not OSI**) | **CONSTRAIN** | M4 | Internal glue only; hosted multi-tenant use needs a commercial licence |
| **LangGraph** | MIT (library) | **DEFER (conditional)** | M6 | Only once an agent genuinely branches; avoid commercial Platform |
| **LiteLLM** | MIT (+ optional enterprise) | **ADOPT** | M3 | One gateway for routing, budgets, cost tracking |
| **Langfuse** | MIT core, `/ee` separate | **ADOPT** | M3 | Traces + evals + prompt versioning, self-hostable |
| **Qdrant** | Apache-2.0 | **DEFER** | M8 | No corpus justifies it before message library |
| **Hermes Agent** | MIT | **EVALUATE (isolated)** | M7 | Useful runtime; must never hold business state |
| **OpenHands** | MIT | **REJECT for core** | — | Coding agent; not this product |
| **OPA** | Apache-2.0 | **DEFER** | M10 | Correct shape; premature before tenancy exists |
| **OpenFGA** | Apache-2.0 | **DEFER** | M10 | ReBAC is right for enterprise; explicit guards suffice now |

---

## 2. Temporal

**Need:** work that spans minutes to days, waits for humans, survives deploys, retries safely.

**Verdict: ADOPT at M4.**

| For | Against |
|---|---|
| MIT (R5) — no hosted-service restriction | New cluster to operate |
| Durable timers, signals, activities | Determinism constraints are subtle |
| Code-defined, reviewable, testable | Replay debugging is unfamiliar |
| Deterministic replay = audit trail | Workflow versioning discipline required |
| Self-hostable | Needs its own datastore (legitimate infrastructure use, `28` §1.1) |

**Why not Cloudflare Workflows:** avoids a new cluster, but creates deep lock-in for a core capability and constrains long-running Node activities. Recorded as the alternative if Temporal's ops cost proves real.

**Why not n8n:** see §3.

**Revisit trigger:** if the workflow service becomes an operational burden exceeding its value, or if Cloudflare Workflows supports long-running Node activities without lock-in.

---

## 3. n8n

**Licence (R3):** Sustainable Use License — **not OSI-approved**. Permits internal business use; hosted service to third parties requires a commercial agreement.

**Verdict: CONSTRAIN.** Internal operational glue only. Not the product's execution engine.

| Permitted use | Prohibited use |
|---|---|
| Agency staff automating back-office tasks | Customer-facing workflow execution |
| Internal notifications, reporting jobs | Selling workflow automation as a feature |
| Prototyping an integration before coding it | Anything requiring deterministic replay |

**The existing 25 workflows should be deleted** (`10` §3): they are 4-node placeholders with no execution evidence, and keeping them implies a capability that does not exist.

**Why this matters commercially:** an AaaS product that runs customer workflows on company-hosted n8n is providing n8n as a service. That is a licensing question with a real answer, and the answer is not free. `INFERRED` legal reading; counsel required before any customer-facing use.

---

## 4. LangGraph

**Need:** explicit, inspectable control flow for multi-step agent reasoning.

**Verdict: DEFER conditionally to M6**, as a library only, and only when an agent's control flow genuinely branches.

| For | Against |
|---|---|
| MIT library (R6) | Adds a dependency for what is often a simple sequence |
| Explicit graph = inspectable | The commercial Platform is a separate licence and a lock-in |
| Good state management for branching | Overlaps with Temporal for durable state |

### 4.1 The overlap problem

LangGraph and Temporal both manage state across steps. Using both naively produces two sources of execution truth.

**Resolution (`PROPOSED`):**
- **Temporal** owns *durability*: retries, timers, human waits, cross-deploy survival.
- **LangGraph** owns *within-call reasoning topology*: branching, tool selection loops, self-correction.

Concretely: one Temporal activity may internally run a LangGraph graph that takes seconds. Temporal never models the graph's internal nodes; LangGraph never models a multi-day wait.

If a graph needs to wait for a human, the wait is a Temporal signal, not a LangGraph interrupt.

### 4.2 When not to use it

For the first real agent (`audit.narrative`), a simple sequence of fetch → assemble → call → validate is clearer as plain TypeScript. **Adopt LangGraph when an agent genuinely branches** — the reply-triage and multi-tool agents at M6–M7 — not before. Adding a graph framework to a linear pipeline is a cost with no benefit.

---

## 5. LiteLLM

**Need:** one path to multiple providers, with budgets, cost accounting, and structured output.

**Verdict: ADOPT at M3.**

| For | Against |
|---|---|
| MIT core (R8) | Another service to run |
| Multi-provider normalisation | Some advanced features are enterprise-licensed |
| Per-key budgets and rate limits | Adds a network hop |
| Cost tracking per request | Configuration surface is large |
| Self-hostable | |

**The decisive argument:** `frontend/src/lib/providers/index.ts` is an unfinished attempt to build exactly this. Completing it would cost more than deploying a maintained MIT proxy, and would be worse.

**Requirement:** verify that every feature used is in the MIT core. Do not adopt an enterprise feature implicitly.

---

## 6. Langfuse

**Need:** traces, prompt versioning, eval datasets, human feedback capture for AI quality.

**Verdict: ADOPT at M3**, self-hosted.

| For | Against |
|---|---|
| MIT core, no usage limits (R7) | Four stateful dependencies (Postgres, ClickHouse, Redis, S3) |
| Traces + evals + prompt management in one | Ops weight for a small team |
| Self-hostable — keeps PII in controlled infrastructure | |
| Open data, standard SQL | |
| Enterprise features not required | |

**Why self-hosted rather than Cloud:** traces contain prompts and outputs derived from customer data. Sending them to a third-party SaaS adds a processor to the DPDP inventory for a non-essential function. Self-hosting is a compliance simplification, not a preference.

**Why not LangSmith:** proprietary, self-hosting is enterprise-only (R7 comparison).

---

## 7. Qdrant

**Need:** similarity search over messages and org knowledge.

**Verdict: DEFER to M8.** Apache-2.0 (R8), excellent product, wrong time.

At M6 the corpus is: tens of org-knowledge documents and low thousands of messages per org. That is computable in-process from a Catalyst table (`32` §3).

**Why deferring is the right call:**
1. Another stateful service to secure, back up, and monitor.
2. It would hold customer personal data — another processor in the DPDP inventory.
3. Premature infrastructure tends to be used because it exists.

**Revisit triggers (either):** retrieval p95 > 300ms, or per-tenant corpus > 100k vectors.

---

## 8. Hermes Agent

**Licence:** MIT, Nous Research. Actively maintained (R1).

**Verdict: EVALUATE at M7, in isolation.**

| Strength | Risk |
|---|---|
| MIT, active development | A general agent runtime with broad tool access |
| MCP client and server | Unrestricted tool access is the opposite of this product's gate model |
| Subagents, plugin ecosystem | "Plugin marketplace" is a supply-chain surface |
| Good local execution story | Not designed around consent, approval, or budget gates |

### 8.1 The framing that matters

Hermes is a capable general-purpose agent runtime. **It is not a business orchestrator**, and it must never hold business state.

Legitimate uses:
- An internal engineering tool for repetitive repo tasks.
- An isolated capability worker that receives a narrow task, returns a result, and has **no access to customer data beyond the task payload**.
- Experimenting with MCP-based tool integration.

Illegitimate uses:
- Driving customer-facing workflows.
- Holding or mutating business records.
- Receiving broad credential access.
- Being the thing that decides whether to send a message.

### 8.2 The evaluation criteria (M7)

If evaluated, it must satisfy:
1. Runs in a sandbox with no network egress beyond an allowlist.
2. Receives only the task payload — never a database connection.
3. Returns structured output validated against a schema.
4. Every tool it can reach is enumerated and reviewed.
5. It cannot initiate an external action; it can only propose one.

If it fails any of the five, it is not adopted.

### 8.3 Honest assessment

The expected outcome is **not adopted**, because this product's value comes from narrow, gated, evaluated agents (`29`), and a general runtime is the wrong shape. The evaluation is worth doing for the MCP patterns, not for the runtime.

---

## 9. OpenHands

**Licence:** MIT (R9).

**Verdict: REJECT for the product core.**

OpenHands is a coding agent. It writes code, runs commands, and edits repositories. That is a valuable engineering tool and has nothing to do with lead generation, auditing, or outreach.

**Permitted:** as an internal development tool, if the team wants one.
**Rejected:** any role in the product's runtime.

Including it would be technology adoption for its own sake — exactly the sprawl this document exists to prevent.

---

## 10. OPA and OpenFGA

**Licences:** Apache-2.0 both (R10).

**Verdict: DEFER to M10.**

| Tool | What it solves | Why not now |
|---|---|---|
| **OPA** | Policy as code, externalised decisions | The policy engine in `35` §4 is a pure function with ~10 rules. A separate policy service adds a network hop and a deployment for something that fits in a file. |
| **OpenFGA** | Relationship-based access control at scale | Five roles and org scoping are expressible in a static capability map. ReBAC earns its place with nested resources and per-object sharing. |

**Revisit triggers:**
- OPA: policy rules exceed ~50 or must be changed without deploy.
- OpenFGA: customers need per-object sharing (e.g. sharing a single report with a specific external viewer).

Until then, `35`'s pure function is simpler, faster, and fully testable.

---

## 11. Combinations and conflicts

| Combination | Conflict | Resolution |
|---|---|---|
| Temporal + LangGraph | Two state managers | Temporal for durability, LangGraph inside a single activity (`41` §4.1) |
| Temporal + n8n | Two orchestrators | Temporal is the engine; n8n internal only |
| LiteLLM + Langfuse | Both can proxy | LiteLLM proxies; Langfuse observes via metadata |
| LiteLLM + direct SDKs | Bypasses budgets | Lint rule: no provider SDK outside the gateway |
| Langfuse + DPDP | Traces contain PII | Redact at write (`31` §6) |
| Qdrant + Catalyst | Two stores for retrieval | Defer Qdrant (`32`) |

---

## 12. Anti-recommendations

Technologies deliberately **not** adopted, with reasons:

| Not adopted | Reason |
|---|---|
| Kubernetes | Two deployables |
| Kafka / event bus | Modules + workflow engine suffice |
| GraphQL | Typed REST + server components cover the surface |
| Custom model serving | Provider economics are better at this scale |
| Data warehouse | Catalyst + rollups until volume demands otherwise |
| Microservices | Five contexts, one deployment |
| A second vector store | See §7 |
| Fine-tuning | Cost and maintenance exceed benefit |
| A no-code canvas for customers | Different product (`19` §2) |

---

## 13. Adoption sequence and total surface

| Milestone | Adds | Running services after |
|---|---|---|
| M3 | LiteLLM, Langfuse, (LangGraph if branching) | Worker, Catalyst, workflow service, LiteLLM, Langfuse |
| M4 | Temporal | + Temporal cluster |
| M6 | — | (unchanged) |
| M8 | Qdrant *if triggered* | conditionally +1 |

**Expanded service topology at maturity (including PostgreSQL, ClickHouse, and Redis backing Langfuse)** (Worker, Catalyst, workflow service, Temporal, LiteLLM, Langfuse, object storage). That is a manageable surface for a small team, and every one of the seven is justified by a capability the product sells.

The discipline that produced this list: **each technology must be the cheapest way to obtain a capability the product already promises.** Not a capability the product could add. The one it already promises, and currently fakes.
