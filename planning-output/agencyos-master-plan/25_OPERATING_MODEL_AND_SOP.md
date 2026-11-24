# 25 — Operating Model and Standard Operating Procedures

`PROPOSED`. This is how a real agency runs on the system once it works. It exists because software that does not match an operating model becomes shelfware, and because several of the audit findings are only legible as process failures.

---

## 1. The weekly operating rhythm

| Day | Activity | System surface | Human role |
|---|---|---|---|
| Mon | Pipeline review | Prospects, Analytics | Decide which accounts to pursue |
| Mon–Tue | Audit production | Audits | Review narratives, approve reports |
| Wed | Outreach execution | Campaigns, Inbox | Approve messages, handle replies |
| Thu | Delivery | Projects, Reports | Do the work the software does not |
| Fri | Reporting | Reports | Review and send client reports |
| Fri | Cost review | Billing, Ledger | Check margin per client |

The rhythm matters more than the tooling. A product that does not map to a weekly cadence will not be adopted, however good its features.

---

## 2. SOP-01 — Onboarding a client

**Trigger:** a signed engagement.

| Step | Actor | System action | Record created |
|---|---|---|---|
| 1 | Operator | Creates `Client` with domain, contact, package | `Client` |
| 2 | Operator | Sets fit criteria for this client | `ClientConfig` |
| 3 | System | Runs baseline audit of the client's own site | `Audit` |
| 4 | Operator | Reviews baseline, confirms scope | `AuditApproval` |
| 5 | Operator | Defines the target prospect profile | `ProspectProfile` |
| 6 | System | Prepares first prospect batch | `ProspectBatch` |
| 7 | Operator | Approves batch | `BatchApproval` |

**Exit criteria:** client has a baseline audit, a defined profile, and an approved first batch.
**Failure mode:** if step 3 fails, onboarding stops. It does not proceed with an assumed baseline.

---

## 3. SOP-02 — Producing an audit

**Trigger:** a prospect or client requires an assessment.

| Step | Actor | Action |
|---|---|---|
| 1 | Operator | Selects domain, confirms scope |
| 2 | System | Fetches pages, runs 12 deterministic checks, stores evidence per check |
| 3 | System | Computes score from the published rubric |
| 4 | System | Drafts narrative citing check IDs |
| 5 | System | Validates narrative against schema; on failure, retries once |
| 6 | Operator | Reviews, edits, approves |
| 7 | System | Renders report with evidence appendix |
| 8 | Operator | Sends to client |

**Invariants:**
- The score never comes from the model.
- The narrative must cite at least one check ID per recommendation.
- If any check fails to execute, the report is marked `PARTIAL` and says which.
- Regenerating the report for the same audit produces identical output.

**Kill criterion:** if operators edit more than a defined share of narratives, the narrative prompt is not ready and the draft becomes `suggestion only`.

---

## 4. SOP-03 — Approving and sending outreach

**Trigger:** an approved campaign has queued messages.

| Step | Actor | Action |
|---|---|---|
| 1 | System | Verifies consent record for contact + channel; blocks if absent |
| 2 | System | Verifies budget; blocks if insufficient |
| 3 | System | Presents message with the audit evidence it references |
| 4 | Operator | Approves, edits, or rejects — individually or by batch with sampling |
| 5 | System | Records approval with actor and timestamp |
| 6 | System | Sends via connector with idempotency key |
| 7 | System | Records provider message ID and state |
| 8 | System | Schedules follow-up per sequence |

**Hard rules:**
- No consent → `403`, with a reason code shown to the operator.
- No approval → cannot send.
- `dry_run` on → message recorded as suppressed, never sent.
- Batch approval requires a sampling step: the operator sees N messages, not just a count.

**Why sampling:** batch-approving 200 unseen messages is the same failure as not approving at all, and it is the exact behaviour that creates spam complaints.

---

## 5. SOP-04 — Handling a reply

| Step | Actor | Action |
|---|---|---|
| 1 | Connector | Receives reply, records it, updates contact state |
| 2 | System | Classifies intent (interested / not now / not interested / unsubscribe / wrong person) |
| 3 | System | Stops sequence on any terminal intent |
| 4 | System | On unsubscribe: creates suppression record immediately, globally |
| 5 | Operator | Reviews classification, responds personally where warranted |

**Hard rule:** suppression is immediate and global. There is no queue, no batch, no review step. A person who asks not to be contacted must not receive another message, ever, from any campaign.

---

## 6. SOP-05 — Producing a client report

**Trigger:** end of reporting period.

| Step | Actor | Action |
|---|---|---|
| 1 | System | Queries ledger, run log, audit store for the period |
| 2 | System | Generates report: work performed, outcomes, costs |
| 3 | System | Optionally drafts a narrative summarising the data with citations |
| 4 | Operator | Reviews, edits, approves |
| 5 | System | Records the report version and its data snapshot |

**Invariant:** the report is a query, not a composition. Re-running it for the same period reproduces the same numbers. A number in a report that cannot be reproduced from stored data is a defect, not a rounding difference.

---

## 7. SOP-06 — Incident response

**Trigger:** any of — readiness failing, error rate above threshold, spend above 90%, a customer reports wrong data.

| Phase | Action | Owner |
|---|---|---|
| Detect | Alert or customer report | On-call |
| Contain | Disable the affected connector or agent capability via a feature flag | On-call |
| Assess | Determine whether customer data was affected | Founder |
| Notify | If personal data affected, follow `39` breach path (72h) | Founder |
| Remediate | Fix, test, re-enable | Engineering |
| Review | Written post-incident note in the repo | Founder |

**Kill switch requirement:** every connector and every agent capability must be individually disableable at runtime without a deploy. This is an M2 requirement, not a nice-to-have: without it, containing an incident requires shipping code, which takes hours instead of seconds.

---

## 8. SOP-07 — Changing a prompt or model

| Step | Action |
|---|---|
| 1 | Create a new prompt version with a stated hypothesis |
| 2 | Run against the agent's eval set |
| 3 | Compare against the current version on quality, cost, and latency |
| 4 | If improved: deploy to a subset (one org, or internal only) |
| 5 | Monitor corrections and schema failures for a defined period |
| 6 | Promote or roll back |

**Never** edit a prompt in place on a live agent. Prompt change without evaluation is an uncontrolled behaviour change on a system that acts on customer data.

---

## 9. Roles in the operating model

| Role | Can | Cannot |
|---|---|---|
| Owner | Everything in the org | Cross-org access |
| Admin | Manage team, settings, approve | Delete org, change billing |
| Operator | Run audits, draft, approve within limits | Manage team, change integrations |
| Viewer | Read reports, read dashboards | Any mutation |
| Client viewer | Own account's reports only | Anything else |

Approval limits are per role: an Operator may approve up to a configured message count per day; above that, an Admin approves. This prevents both bottleneck and runaway.

---

## 10. Process-to-capability trace

Every SOP step that requires a system capability maps to `22`. Steps that require **no** capability today are the backlog's source of truth:

| SOP step | Capability | State |
|---|---|---|
| SOP-01.3 baseline audit | Audit engine | `FAKE` |
| SOP-02.2 checks + evidence | Crawler + check library | `ABSENT` |
| SOP-02.3 rubric score | Scoring | `FAKE` |
| SOP-03.1 consent verification | Consent store | `ABSENT` |
| SOP-03.5 approval record | Approval engine | `FAKE` |
| SOP-03.6 idempotent send | Connector contract | `ABSENT` |
| SOP-04.4 global suppression | Suppression store | `ABSENT` |
| SOP-05.1 ledger query | Ledger | `ABSENT` |
| SOP-06 containment | Kill switches | `ABSENT` |
| SOP-07.2 eval sets | Evaluation | `ABSENT` |

Ten of ten absent or fake. The operating model is therefore not a description of the product — it is the specification for it, and the fastest way to see which milestone matters is to find the earliest SOP step that cannot be executed.

Today that step is **SOP-01.3**.
