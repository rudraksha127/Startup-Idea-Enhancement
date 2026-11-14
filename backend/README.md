# AgencyOS — Enterprise Backend API (Zoho AppSail Target)

**Deployment Target:** Zoho AppSail (Node.js 20 LTS)  
**Database:** Zoho Catalyst CloudScale Data Store (ZCQL)  
**Framework:** Express 5.3, TypeScript, Zod, Helmet  

---

## 1. Directory Structure

```text
backend/
├── src/
│   ├── app.ts                  # Express application setup, security middleware, and module mounting
│   ├── server.ts               # HTTP server bootstrap and graceful shutdown
│   ├── config/                 # Environment and Zoho Catalyst configuration
│   ├── middleware/             # Auth, audit logging, rate limiting, error handling
│   ├── modules/                # 16 vertical slice domain modules
│   ├── services/               # Cross-cutting business services
│   ├── repositories/           # Abstract data access repositories
│   ├── infrastructure/         # External integrations & persistence:
│   │   ├── persistence/
│   │   │   └── zoho-catalyst/  # Zoho Catalyst CloudScale SDK & ZCQL query engine
│   │   ├── n8n/                # n8n webhook gateway
│   │   ├── google-maps/        # Places API & TOS compliance adapter
│   │   ├── ai-providers/       # Multi-model AI gateway (OpenAI/Anthropic/Gemini)
│   │   ├── email/              # SendGrid/SES email provider
│   │   ├── calendar/           # Cal.com/Google Meet adapter
│   │   ├── payments/           # Stripe billing and webhook listener
│   │   └── hosting/            # Cloudflare Pages release deployment hook
│   ├── jobs/                   # Scheduled task handlers
│   ├── events/                 # Internal event dispatchers
│   └── observability/          # Morgan request logging and audit trails
├── catalyst.json               # Zoho AppSail runtime configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 2. Development Scripts

```bash
# Start backend in watch mode
npm run dev:api

# Build TypeScript to dist/
npm run build:api

# Typecheck API
npm run typecheck:api
```
