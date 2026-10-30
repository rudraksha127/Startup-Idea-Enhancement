# Production Deployment Pipeline

AgencyOS deploys across a split-topology infrastructure:
1. **Frontend**: Cloudflare Pages (Edge SSR / Static bundle)
2. **Backend**: Zoho-hosted Node.js / Express container runtime
3. **Database**: MongoDB Atlas Cluster with replica sets
4. **Automation**: Self-hosted n8n instance with PostgreSQL & Redis workers

