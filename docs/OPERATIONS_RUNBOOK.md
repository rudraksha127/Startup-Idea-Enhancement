# AgencyOS Production Operations Runbook

## 1. System Overview & Service Ports

| Component | Technology | Default Port | Health Check Endpoint |
|---|---|:---:|---|
| Frontend | Next.js 15 (App Router) | `3000` | `GET /` |
| Backend API | Express 4.21 | `4000` | `GET /api/v1/health` |
| Application DB | MongoDB 7.0+ | `27017` | `rs.status()` |
| Automation Layer | n8n | `5678` | `GET /healthz` |
| Queue Manager | Redis 7.0 | `6379` | `redis-cli ping` |
| n8n Database | PostgreSQL 16 | `5432` | `pg_isready` |

---

## 2. Common Operational Procedures

### Health & Connectivity Verification
```bash
# Check backend health probe
curl -i http://localhost:4000/api/v1/health

# Check all 7 integrations & webhook inventory
curl -i http://localhost:4000/api/v1/integrations/diagnostics

# Check n8n automation engine status
curl -i http://localhost:4000/api/v1/n8n/status
```

### Rotating Secrets
1. **JWT Secret**: Update `JWT_SECRET` in environment variables. Existing sessions will expire gracefully, requiring re-login.
2. **Stripe Webhook Secret**: Update `STRIPE_WEBHOOK_SECRET` in both Stripe Dashboard and AgencyOS backend `.env`.
3. **Google Maps API Keys**: Regenerate key in Google Cloud Console with referrer restrictions for browser and IP restrictions for server.

### Incident Remediation: Failed Webhook Delivery
If n8n reports webhook delivery failures to AgencyOS:
1. Verify Express process is listening on `PORT=4000`.
2. Inspect backend logs for `[AUDIT]` entries or rate-limiting triggers (`HTTP 429`).
3. Check `IntegrationsService.getDiagnostics()` to verify webhook route registration.

