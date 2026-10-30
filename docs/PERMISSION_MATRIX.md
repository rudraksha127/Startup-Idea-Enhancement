# AgencyOS Role-Based Access Control (RBAC) & Permission Matrix

AgencyOS enforces strict, deterministic permission boundaries. No state mutation or integration call relies purely on client-side state or LLM heuristics.

## Roles

1. **Founder**: Full ownership of the tenant workspace. Can manage billing, approve financial commitments, invite/revoke team members, and configure API secrets.
2. **Admin**: Operational administrator. Can manage campaigns, trigger audits, update clients, assign projects, and view financial metrics. Cannot modify billing subscriptions or revoke the Founder.
3. **Operator**: Day-to-day agency staff. Can review leads, draft outreach messages, update project tasks, and trigger agent executions. Cannot dispatch live unapproved outreach or view sensitive integration secrets.
4. **Developer**: Technical staff. Can manage project tasks, inspect website QA reports, view webhook diagnostics, and test integrations. Cannot access financial or client billing data.

---

## Detailed Permission Matrix

| Resource / Capability | Founder | Admin | Operator | Developer |
|---|:---:|:---:|:---:|:---:|
| **Leads & Intelligence** |
| View Leads & Audit Scores | ✅ | ✅ | ✅ | ✅ |
| Create / Edit Leads | ✅ | ✅ | ✅ | ❌ |
| Run Automated Website Audit | ✅ | ✅ | ✅ | ✅ |
| Delete / Archive Leads | ✅ | ✅ | ❌ | ❌ |
| **Outreach & Communication** |
| Create & Edit Campaigns | ✅ | ✅ | ✅ | ❌ |
| Generate Personalized AI Drafts | ✅ | ✅ | ✅ | ❌ |
| Approve & Send Live Outreach | ✅ | ✅ | ❌ | ❌ |
| View Reply Analytics & Intent | ✅ | ✅ | ✅ | ❌ |
| **Clients & Projects** |
| Create Client & Contract SOW | ✅ | ✅ | ❌ | ❌ |
| Edit Client Information | ✅ | ✅ | ✅ | ❌ |
| Create Project Backlog & Tasks | ✅ | ✅ | ✅ | ✅ |
| Mark Project Delivered | ✅ | ✅ | ❌ | ❌ |
| Run Website QA Staging Audits | ✅ | ✅ | ✅ | ✅ |
| **AI Agents & Workflows** |
| Trigger Agent Workflows | ✅ | ✅ | ✅ | ✅ |
| Cancel Running Workflow | ✅ | ✅ | ✅ | ✅ |
| Configure Agent Thresholds | ✅ | ✅ | ❌ | ❌ |
| Approve High-Stakes Agent Gate | ✅ | ✅ | ❌ | ❌ |
| **Billing & Payments** |
| View Invoices & Revenue Metrics | ✅ | ✅ | ❌ | ❌ |
| Create & Issue Invoices | ✅ | ✅ | ❌ | ❌ |
| Manage Stripe / Razorpay Account | ✅ | ❌ | ❌ | ❌ |
| **Team & Settings** |
| Invite New Team Member | ✅ | ✅ | ❌ | ❌ |
| Update Member Role | ✅ | ❌ | ❌ | ❌ |
| Revoke / Remove Member | ✅ | ❌ | ❌ | ❌ |
| View Integration Secrets | ✅ | ❌ | ❌ | ❌ |
| Run Integration Health Checks | ✅ | ✅ | ✅ | ✅ |
