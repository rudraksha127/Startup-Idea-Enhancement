# Release Checklist — AgencyOS
**Last Updated:** 2026-10-30

Use this checklist for every production release. Each item must be explicitly verified (not assumed).

---

## Gate 1: Code Quality ✅

- [ ] All TypeScript errors resolved (`npm run typecheck && npm run typecheck:api` → 0 errors)
- [ ] All tests passing (`npm run test` → N/N tests pass)
- [ ] ESLint passing (`npm run lint` → 0 errors)
- [ ] No console.log statements in production code (except structured logging)
- [ ] No TODO/FIXME comments blocking this release (review and convert to GitHub issues)
- [ ] Code reviewed by at least one team member (PR approval on GitHub)

## Gate 2: Security ✅

- [ ] `npm audit --audit-level=high` → 0 high/critical vulnerabilities
- [ ] No `.env` files committed (`git ls-files | grep -E "^\.env"` → empty)
- [ ] No secrets in source code (grep scan clean)
- [ ] Rate limiting verified on auth and agent run endpoints
- [ ] Helmet security headers confirmed in response headers
- [ ] JWT expiry is appropriate for the risk level (currently 7d)
- [ ] All CORS origins are explicitly allowlisted (no wildcard `*` in production)
- [ ] `dry_run = true` confirmed as default for all outreach modules

## Gate 3: Environment Variables ✅

- [ ] All required vars from `.env.example` are set in:
  - [ ] Cloudflare Pages (frontend) environment variables
  - [ ] Zoho AppSail (backend) environment variables
- [ ] `NODE_ENV=production` confirmed in production environments
- [ ] `MONGODB_URI` points to production Atlas cluster (not localhost or test)
- [ ] `JWT_SECRET` is at least 32 characters, randomly generated, not shared with staging

## Gate 4: Database ✅

- [ ] MongoDB Atlas production cluster running and reachable
- [ ] All Mongoose models have appropriate indexes deployed
- [ ] No pending breaking schema changes without migration
- [ ] Atlas connection string uses SRV format with TLS
- [ ] Atlas IP allowlist includes only backend server IPs (not 0.0.0.0/0)

## Gate 5: Build & Deploy ✅

- [ ] `npm run build` completes with 0 errors (all N routes compiled)
- [ ] `npm run build:api` completes with 0 TypeScript errors
- [ ] Next.js build deployed to Cloudflare Pages staging slot
- [ ] Express API deployed to Zoho AppSail staging
- [ ] Health check `GET /api/v1/health` returns `200` on staging backend
- [ ] Frontend API client points to correct staging/production API base URL

## Gate 6: Smoke Tests ✅

- [ ] Login with test credentials works end-to-end
- [ ] Leads list loads (not empty error state)
- [ ] Dashboard metrics load (API responding)
- [ ] Agent list loads
- [ ] No broken images or missing fonts
- [ ] No JavaScript console errors on page load
- [ ] Theme toggle (light/dark) works in production build

## Gate 7: Compliance ✅

- [ ] All outbound email/WhatsApp/SMS campaigns confirmed `dryRun: true`
- [ ] No Google Maps API scraping triggered
- [ ] Privacy policy page accessible
- [ ] DPDP Act 2023: No personal data collected without consent flow
- [ ] Audit log `[AUDIT]` entries visible in backend logs

## Gate 8: Rollback Plan ✅

- [ ] Previous production Git tag identified (e.g., `v0.0.9`)
- [ ] Rollback command documented and tested:
  ```bash
  # Frontend: revert Cloudflare Pages to previous deployment
  # Backend: redeploy previous Zoho AppSail container/build
  ```
- [ ] Database rollback plan documented (if schema changed)
- [ ] On-call engineer identified and notified

## Gate 9: Monitoring ✅

- [ ] Backend health check endpoint monitored (uptime alert if 503)
- [ ] Cloudflare Analytics enabled for frontend traffic
- [ ] MongoDB Atlas monitoring alerts configured
- [ ] Error logs accessible (Zoho AppSail log viewer or connected aggregator)

## Gate 10: Documentation ✅

- [ ] `CHANGELOG.md` updated with this release notes
- [ ] `docs/PRODUCTION_GO_NO_GO_REPORT.md` updated with current status
- [ ] `docs/execution/CURRENT_STATUS.md` reflects deployed state
- [ ] API version bump if breaking changes introduced

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Engineering Lead | | | |
| Security Reviewer | | | |
| QA Lead | | | |
| Product Owner | | | |

---

> [!IMPORTANT]
> Do not mark any gate as ✅ without running the actual command or performing the actual check.
> "It should work" is not evidence. Running the command and seeing the output is.

