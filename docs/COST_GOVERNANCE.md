# Cost Governance — AgencyOS
**Last Updated:** 2026-10-30

## Purpose

This document establishes cost visibility, usage limits, budget alerts, and governance procedures for all cloud providers and third-party services used by AgencyOS.

---

## Service Cost Inventory

### Tier 0 — Free (No Cost)

| Service | Provider | Plan | Limits |
|---------|----------|------|--------|
| GitHub Repository | GitHub | Free | Unlimited public repos |
| GitHub Actions | GitHub | Free | 2,000 min/month (public repo: unlimited) |
| MongoDB Atlas | MongoDB | M0 Free Cluster | 512 MB storage, shared, no dedicated IOPS |

### Tier 1 — Estimated Monthly Costs (Post-GA)

| Service | Provider | Est. Cost | Limits | Notes |
|---------|----------|-----------|--------|-------|
| Cloudflare Pages | Cloudflare | \$0–\$20/mo | 500 builds/month (free), unlimited requests | Free tier adequate for MVP |
| Zoho AppSail (Backend) | Zoho | ~\$10–\$25/mo | Based on compute units | Verify current Zoho pricing |
| MongoDB Atlas M2/M5 | MongoDB | \$9–\$25/mo | 2–5 GB storage, dedicated IOPS | Upgrade from M0 when data > 400MB |
| AI Provider (OpenAI/Gemini) | Variable | Pay-per-use | Per token | Currently no AI calls in production |

### Total Estimated Monthly Cost: **\$20–\$70/mo at MVP scale**

---

## AI Cost Controls

> [!IMPORTANT]
> AI agent calls are the highest variable cost. All calls must go through the AI adapter layer which enforces:

| Control | Implementation | Status |
|---------|----------------|--------|
| Per-request token limits | `maxTokens` cap in AI adapter config | ✅ Designed |
| Per-organization monthly budget | `credits` field on Organization model | ✅ In schema |
| Rate limiting on agent runs | 20 runs/min per IP (`express-rate-limit`) | ✅ Implemented |
| `dry_run = true` default | All campaigns default to dry-run | ✅ Implemented |
| Cost logging per request | TODO: log token counts + model to analytics | ⚠️ PENDING |

**Budget Alert Rule:** If an organization's `credits` drop below 20% of monthly allocation, the system should auto-notify and optionally pause agent runs. (Implementation: TODO)

---

## MongoDB Cost Management

| Trigger | Action |
|---------|--------|
| Storage > 400MB on M0 free cluster | Upgrade to M2 (\$9/mo) |
| Connections > 500 concurrent | Upgrade to M10 (\$57/mo) |
| IOPS becoming bottleneck | Add Atlas Data API or dedicated cluster |

**Optimization practices:**
- Compound indexes on `{organizationId, createdAt}` to reduce scan costs
- TTL indexes on audit logs (90-day retention by default)
- No unbounded queries: all list endpoints use `limit` parameter (default 20, max 100)

---

## GitHub Actions Cost Management

Free tier is generous for an early-stage project:
- Public repos: unlimited minutes
- Private repos: 2,000 min/month (Actions), 500 MB storage

**Current usage estimate:** ~5 min per CI run × 20 PRs/month = ~100 min/month. Well within free tier.

**If private:** Use concurrency cancellation (already configured) to avoid parallel run costs.

---

## Budget Alert Thresholds

| Service | Alert At | Action |
|---------|----------|--------|
| MongoDB Atlas | \$20/mo | Review query patterns, add indexes |
| AI tokens | \$50/mo | Review agent usage, tighten rate limits |
| Cloudflare | >500 builds/mo | Optimize build triggers |
| Total monthly | \$100/mo | Engineering review meeting |

**TODO:** Configure MongoDB Atlas spending alerts in Atlas dashboard → Billing → Alerts.

---

## Cost Review Schedule

| Frequency | Activity |
|-----------|----------|
| Monthly | Review invoices from all providers |
| Quarterly | Evaluate if current tier is still appropriate |
| On new AI feature | Estimate per-request and monthly cost before shipping |
| On major traffic spike | Evaluate auto-scaling costs before enabling |

