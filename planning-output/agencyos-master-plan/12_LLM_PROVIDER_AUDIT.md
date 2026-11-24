# 12 — LLM Provider Audit

**Scope:** provider abstraction, credential posture, model strategy.
**All findings `SOURCE-VERIFIED` unless labelled otherwise.**

---

## 1. The central finding

Four LLM providers have credentials configured. **The application calls none of them.**

`frontend/src/lib/providers/index.ts` returns mock implementations unconditionally. There is no environment check, no key check, and no feature flag. The abstraction exists; the implementations do not.

```
Requested provider  →  factory  →  MockProvider  (always)
```

### 1.1 Why the abstraction is nonetheless valuable

The interface boundary is correct in shape: a provider factory that returns a typed client. What is missing is one `if` and real implementations. This is a **30-line fix** in isolation — but it must not be applied before the gateway decision in `31`, because wiring four providers directly would create the sprawl the plan is trying to prevent.

---

## 2. Credential posture

| Provider | Key configured | Called today |
|---|---|---|
| Google Gemini | Yes | No |
| OpenAI | Yes | No |
| NVIDIA NIM | Yes | No |
| OpenRouter | Yes | No |

`SOURCE-VERIFIED` key *names* present in env files; values never read.

### 2.1 Observations

1. **Four providers is sprawl before value.** No routing policy exists, so there is no principled reason to hold four.
2. **Unused live keys are a liability.** Unrotated keys held for future use are attack surface with no benefit. Rotate or revoke until the gateway exists.
3. **No key isolation by environment** was observed (`INFERRED` — the existence of separate `.env.production` files suggests intent, but there is no evidence that production keys differ from local ones).
4. **OpenRouter in front of other providers** means two billing relationships for the same model. Unless OpenRouter is being used specifically for model breadth, it is redundant with a direct provider key.

### 2.2 Recommendation (`PROPOSED`)

- Launch with **two** active providers: one frontier model for synthesis, one cheap/fast model for classification and extraction.
- Route through a single gateway (`31`) so provider choice is configuration, not code.
- Rotate all LLM keys at the moment the gateway is deployed, and store them in a secret manager rather than a file.
- Revoke credentials that are not in the active set.

---

## 3. What is missing for LLM use at all

| Requirement | Status | Consequence of absence |
|---|---|---|
| Model call implementation | Absent | No AI feature works |
| Structured output enforcement | Absent | Free-text output cannot be persisted or validated |
| Retry/timeout policy | Absent | A hung provider hangs the request |
| Token accounting | Fabricated | No cost visibility, no budget enforcement |
| Cost caps per org/run | Absent | One runaway loop can produce an unbounded bill |
| Prompt versioning | Absent (prompts are string constants) | No reproducibility, no rollback |
| PII redaction before send | Absent | Customer personal data leaves to a third-party model |
| Provider failover | Absent | Single-provider outage breaks the product |
| Evaluation harness | Absent | Model/prompt changes are untested |
| Data-retention configuration | Absent | Unknown provider-side retention of customer data |

### 3.1 The PII issue deserves emphasis

The product handles leads: names, emails, phone numbers, sometimes personal social profiles. Sending those to a model provider is a **data transfer to a third party** and, under DPDP (`39`), requires a lawful basis, notice, and a processor arrangement. There is currently no redaction layer and no processor agreement evidence (`BLOCKED` on agreements).

**Correction (`PROPOSED`):** a redaction step in the gateway that replaces direct identifiers with tokens, sends the tokenised prompt, and re-hydrates on return. Persisted traces store tokenised text (`37`).

---

## 4. Prompt quality

The 13 agent prompts in `backend/src/modules/agents/definitions/index.ts` are written as instructions with no output contract.

### 4.1 Problems

1. **No schema.** Nothing specifies the JSON shape expected back, so output cannot be validated or stored.
2. **No grounding instruction.** Prompts do not require citation of retrieved evidence, which is how a model produces confident unsupported claims — the exact failure the product must avoid.
3. **No refusal instruction.** Nothing tells the model to say "insufficient evidence" rather than invent.
4. **No version.** Editing the prompt silently changes behaviour for every future run with no record.
5. **No few-shot examples** with verified-correct outputs.

### 4.2 Correction (`PROPOSED`)

Every agent prompt becomes a versioned artefact with:

```
{
  id, version, model_class,
  system, user_template,
  output_schema,          // JSON Schema
  grounding_required,     // must cite evidence ids
  refusal_policy,         // what to do with insufficient evidence
  examples[],             // verified input→output pairs
  eval_set_id
}
```

Stored in the database, loaded at runtime, versioned in git on change, and regression-tested against its eval set (`37`, `44`).

---

## 5. Model selection principles (`PROPOSED`)

Not a vendor recommendation — a decision procedure.

| Task class | Model class | Rationale |
|---|---|---|
| Classification, extraction, tagging | Cheap/fast | High volume, low complexity; errors are cheap and correctable |
| Draft generation | Mid-tier | Volume moderate; quality matters but is human-reviewed |
| Synthesis, audit narrative, strategy | Frontier | Low volume, high consequence; worth the cost |
| Deterministic checks (crawl, parse, score by rule) | **No model** | Reproducibility is required; an LLM makes it non-deterministic |

### 5.1 The determinism rule

Any output that feeds a **score**, a **financial number**, a **compliance decision**, or a **gate** must be computed deterministically. The model may explain, summarise, or draft around a deterministic result; it may not produce the result. This rule is the direct correction for the fabricated audit scores in `14`.

---

## 6. Provider abstraction target (`PROPOSED`)

```
Application
    │
    ▼
LlmGateway (internal interface)
    │   - model class resolution
    │   - budget check (pre-call)
    │   - redaction
    │   - structured output validation
    │   - retry/timeout/circuit breaker
    │   - trace emission
    ▼
LiteLLM proxy  (MIT, self-hosted)          ← `31`, `41`
    │
    ├── Provider A (frontier)
    └── Provider B (cheap/fast)
```

The application never imports a provider SDK. It imports `LlmGateway`. This makes provider migration a configuration change and guarantees every call passes through budget and redaction.

---

## 7. Cost control

Because token accounting is fabricated today (`09` §2.2), there is no basis for a cost model. The plan requires (`PROPOSED`):

1. **Pre-call estimation** — approximate token count from prompt length; reject if it exceeds the remaining run budget.
2. **Post-call reconciliation** — record actual tokens from the provider response.
3. **Per-run ceiling**, **per-org monthly ceiling**, and **platform daily ceiling**.
4. **Circuit breaker** on repeated failures.
5. **Alert** at 70% and 90% of any ceiling.

The credits ledger (`36`) consumes these records. Without accurate token accounting there is no defensible pricing (`24`) and no margin protection.

---

## 8. Verdict

| Dimension | Assessment |
|---|---|
| Provider interface | Correct shape, zero implementations |
| Providers configured | 4 — sprawl, none used |
| Calls made | **None** |
| Token accounting | Fabricated |
| Cost caps | Absent |
| Structured output | Absent |
| Prompt versioning | Absent |
| PII handling | Absent |
| Evaluation | Absent |

The LLM layer is the least-built part of a product whose identity is "AI agents". That is worth stating plainly: the company has built the interface of an AI product and none of the AI. The good news is that the correct sequence is to build the data, permission, and ledger substrate first — which is M1–M4 — and the LLM layer becomes straightforward once the substrate can be trusted.
