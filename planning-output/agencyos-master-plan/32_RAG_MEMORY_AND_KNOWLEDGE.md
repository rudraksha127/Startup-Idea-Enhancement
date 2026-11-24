# 32 — RAG, Memory, and Knowledge

`PROPOSED`. Deliberately conservative: most of this product does not need retrieval, and adding a vector database early is the most common way to add cost without adding value.

---

## 1. What actually needs retrieval

Assessed against the service catalogue (`21`):

| Task | Needs retrieval? | Why |
|---|---|---|
| Audit checks | **No** | Deterministic crawl and rules |
| Audit narrative | **Marginal** | Needs the audit's own findings, not a corpus — pass them in the prompt |
| Qualification scoring | **No** | Formula over signals |
| Outreach drafting | **Yes, lightly** | Needs the prospect's audit findings + the org's tone guide + past successful messages |
| Reply triage | **No** | Classification of one message |
| Report narrative | **Marginal** | Needs the period's records, which are queried, not retrieved |
| Client knowledge Q&A (future) | **Yes** | This is genuine RAG territory |
| Template selection | **Yes, lightly** | Similarity over a small template set |

**Conclusion:** the product needs **small-corpus retrieval over three narrow stores**, not a general knowledge platform.

---

## 2. The three retrieval stores

### 2.1 Evidence store (per prospect)

The audit findings for a specific prospect. Not a vector problem — it is a keyed lookup by `prospectId`.

**Implementation:** direct query. No embeddings. Storing findings in a vector index and retrieving by similarity would be slower, more expensive, and less accurate than fetching by ID.

### 2.2 Organisation knowledge (per org)

Small, curated, human-authored:

- tone-of-voice guide
- service descriptions and pricing language
- objection handling notes
- approved claims (what may and may not be asserted)

**Size:** tens of documents, not millions.
**Implementation:** full-text search plus optional embeddings. At this size, **a keyword index in Catalyst plus a small embedding table is sufficient**; a dedicated vector database is not justified.

### 2.3 Message library (per org)

Past messages that performed well, for few-shot exemplars.

**Size:** hundreds to low thousands per org.
**Implementation:** embeddings over message text, retrieved top-k for a given prospect context.

This is the only store where vector similarity genuinely earns its place.

---

## 3. Decision: no vector database until M6

| Option | When justified |
|---|---|
| **Keyword/full-text in Catalyst** | Now. Sufficient for org knowledge. |
| **Small embedding table in Catalyst + in-app cosine** | M6. Messages are short; top-k over a few thousand vectors is trivial in memory. |
| **Qdrant (Apache-2.0, R8)** | When corpus exceeds ~100k vectors per tenant, or when hybrid search with filtering at scale is required. |

### 3.1 Why defer Qdrant

Qdrant is a good product and correctly licensed. It is deferred because:

1. It is another stateful service to run, back up, and secure.
2. It would hold customer personal data, adding a processor to the DPDP inventory (`39`).
3. At the corpus sizes above, an in-process computation over a Catalyst table is simpler and fast enough.
4. Premature retrieval infrastructure tends to be used because it exists, not because it helps.

**Revisit trigger:** a measured retrieval latency above 300ms p95, or a per-tenant corpus above 100k items. Recorded in `46` D-12.

---

## 4. Memory model

"Memory" is used loosely in agent products. Three distinct things, three different designs.

### 4.1 Run memory (within a run)

The context assembled for one execution: the prospect, the findings, the org knowledge, the task.

**Lifetime:** one run.
**Storage:** in the workflow's activity input, hashed into `RunStep`.
**Rule:** bounded by a token budget; if the context exceeds it, truncate by priority (findings > org knowledge > exemplars) and record what was dropped.

### 4.2 Conversational memory (within a thread)

A reply thread with a prospect. Relevant only for reply handling.

**Lifetime:** the thread.
**Storage:** `Message` records, queried by thread.
**Rule:** summarise older messages rather than sending the full history; store the summary as a derived field.

### 4.3 Long-term memory (across runs, per org)

What the org has learned: which openings get replies, which claims are approved, which segments convert.

**Lifetime:** indefinite.
**Storage:** an `OrgInsight` entity, written by scheduled analysis, not by agents autonomously.
**Rule:** an agent may **read** long-term memory. It may not **write** to it. Insights are promoted by a scheduled job that aggregates outcomes and requires a minimum sample size before asserting a pattern.

### 4.4 The anti-pattern avoided

Many agent products let agents write to a shared memory that other agents read. This creates a channel where a compromised or hallucinating run can influence future runs — a persistence mechanism for bad output.

**Rule:** agents read memory; only deterministic, sampled, human-reviewable jobs write it.

---

## 5. Context assembly

The function that builds a prompt's context, and the place where most quality is won or lost.

```
assembleContext(run):
  1. task definition        (always, small)
  2. subject record         (prospect or client, keyed, always)
  3. subject evidence       (audit findings, keyed, always)
  4. org knowledge          (retrieved top-k, budgeted)
  5. exemplars              (retrieved top-k, budgeted)
  6. untrusted content      (delimited, labelled, budgeted last)
  
  Budget: maxContextTokens per model class.
  Overflow: drop in reverse priority (6 → 5 → 4), record what was dropped
            in RunStep, never silently truncate mid-document.
```

### 5.1 Why priority order matters

Findings must never be dropped, because a narrative without findings is fabrication. Exemplars are the first thing to lose, because they affect style, not truth.

### 5.2 Provenance in context

Each context block carries its source ID. The model is instructed to cite source IDs in its output (`citations: string[]`). The output validator checks that every cited ID exists in the provided context — a cheap, effective hallucination check.

---

## 6. Chunking and embedding (when it is built)

For the org knowledge and message library, at M6:

| Parameter | Choice | Reason |
|---|---|---|
| Chunk size | ~500 tokens, 10% overlap | Documents are short; larger chunks lose precision |
| Embedding model | Cheap embedding model via gateway | Cost; quality is sufficient for short text |
| Storage | Catalyst table: `{ id, orgId, sourceId, chunkIndex, text, vectorJson }` | No new service |
| Search | Cosine in application, top-k=8, filtered by `orgId` | Corpus is small |
| Re-index | On document change, via workflow | Deterministic, auditable |

### 6.1 The tenancy trap

Embedding tables are the most common place multi-tenant isolation breaks, because similarity search ignores filters unless explicitly applied. **Every retrieval must filter by `orgId` before computing similarity**, and a test must assert that a query from org A never returns a chunk from org B, even when the text is identical.

---

## 7. Evaluation of retrieval

Retrieval quality is measurable and must be measured before it is trusted:

| Metric | Target |
|---|---|
| Recall@8 on a labelled query set | ≥ 0.85 |
| Cross-tenant leakage | 0 |
| p95 retrieval latency | < 300ms |
| Empty-result rate on answerable queries | < 5% |

A labelled set of ~50 query→expected-source pairs per org-knowledge collection is enough to detect regression. Without it, retrieval changes are unverifiable (`37`).

---

## 8. What is explicitly not built

| Not built | Reason |
|---|---|
| General-purpose vector database | No corpus justifies it |
| Agent-writable shared memory | Persistence channel for bad output |
| Automatic document ingestion from the web | Copyright and quality risk |
| Cross-tenant knowledge sharing | Isolation and confidentiality |
| Fine-tuning | Cost and maintenance exceed benefit at this scale |
| Semantic caching of prompts | Correctness risk; a similar prompt is not the same prompt |

---

## 9. Sequencing

| Milestone | Retrieval work |
|---|---|
| M3 | None. Audit narrative receives findings directly in the prompt. |
| M4 | Org knowledge: keyword search only. |
| M6 | Message library embeddings; context assembly with budgets and provenance. |
| M7 | `OrgInsight` aggregation job with sample-size gating. |
| M8+ | Revisit vector database if triggers met. |

The ordering reflects a simple judgement: retrieval improves drafting quality, and drafting is not the product's bottleneck until the audit is real. Building it earlier would optimise the wrong stage.

---

## 10. Verdict

The product needs **evidence lookup**, not retrieval-augmented generation, for its core value. The one genuine RAG surface — drafting from an org's own style and history — arrives at M6 and is solvable without new infrastructure.

The discipline this document imposes: **do not add a vector store because agents are involved.** Add it when a measured corpus, latency, or quality problem demands it, and record the trigger.
