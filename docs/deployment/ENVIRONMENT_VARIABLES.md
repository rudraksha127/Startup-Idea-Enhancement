# AgencyOS Environment Variables Specification

This document details all environment variables supported by AgencyOS, their expected types, defaults, security requirements, and operational behavior.

---

## 1. Environment Variable Reference Matrix

| Variable | Required? | Default (Development) | Type | Purpose & Description |
| :--- | :---: | :--- | :--- | :--- |
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/agencyos` | URI | MongoDB connection string. Must include authentication credentials and replica set parameters in production. |
| `JWT_SECRET` | **Yes** | `replace-with-a-secure-random...` | String | Cryptographic secret key used by `jsonwebtoken` for signing and verifying authentication tokens. Must be $\ge 32$ characters in production. |
| `NEXT_PUBLIC_APP_URL` | Optional | `http://localhost:3000` | URL | Canonical URL of the web dashboard. Exposed to frontend client code for constructing redirects and shareable links. |
| `NODE_ENV` | Optional | `development` | Enum | Execution environment: `development`, `test`, or `production`. Controls React error overlays and logging verbosity. |
| `AI_RESEARCH_PROVIDER` | Optional | `mock` | Enum | AI provider backend: `mock`, `gemini`, or `openai`. In `mock` mode, returns deterministic audit schemas without network spend. |
| `GEMINI_API_KEY` | Conditional | `""` (Empty string) | String | API key for Google Gemini (required when `AI_RESEARCH_PROVIDER=gemini`). Never commit this key to version control. |
| `OPENAI_API_KEY` | Conditional | `""` (Empty string) | String | API key for OpenAI (required when `AI_RESEARCH_PROVIDER=openai`). |
| `EMAIL_PROVIDER` | Optional | `mock` | Enum | Email delivery adapter: `mock` or `resend`. In `mock` mode, outbound dispatches log to console without transmitting live mail. |
| `RESEND_API_KEY` | Conditional | `""` (Empty string) | String | Resend API key for outbound cold email campaigns and transactional notifications. |
| `MAPS_PROVIDER` | Optional | `mock` | Enum | Map discovery data provider: `mock` or `google`. Adheres to Section 3.2.3 of Google Maps TOS (no scraping/caching). |
| `GOOGLE_MAPS_API_KEY` | Conditional | `""` (Empty string) | String | Official Google Maps Platform Places API key for real-time exploratory map searches. |

---

## 2. Mock Mode vs. Production Mode

AgencyOS is designed to operate immediately out-of-the-box in **Zero-Cost Mock Mode** without external paid API keys.

```mermaid
graph TD
    A[Environment Variables] --> B{External Keys Present?}
    B -- No / Omitted --> C[Mock Providers Active]
    C --> C1[Deterministic Synthetic Audits]
    C --> C2[Console-Logged Mock Emails]
    C --> C3[Synthetic Geo Discovery]
    B -- Yes --> D[Live Providers Active]
    D --> D1[Gemini / OpenAI API Calls]
    D --> D2[Resend Outbound SMTP/API]
    D --> D3[Google Maps Places API]
```

### Safety Rules for Live Providers
1. In non-production environments, outbound connectors must enforce `dry_run = true` to prevent accidental messaging to live recipients.
2. Production credentials must be supplied via secure secrets managers (Vercel Project Settings, Docker secrets, AWS Secrets Manager, or Railway variables).
3. Never check a `.env` file containing live credentials into Git.

---

## 3. Example Configuration Templates

### Local Development (`.env.local`)
```env
MONGODB_URI="mongodb://127.0.0.1:27017/agencyos"
JWT_SECRET="dev-secret-only-not-for-production-use-32ch"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
AI_RESEARCH_PROVIDER="mock"
EMAIL_PROVIDER="mock"
MAPS_PROVIDER="mock"
```

### Production Setup (`.env.production`)
```env
MONGODB_URI="mongodb+srv://agency_user:StrongPassword123@cluster0.mongodb.net/agencyos?retryWrites=true&w=majority"
JWT_SECRET="7a8f9b4c1e2d3f0a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
NEXT_PUBLIC_APP_URL="https://app.agencyos.dev"
NODE_ENV="production"
AI_RESEARCH_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSyYourProductionGeminiKeyHere"
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_123456789_abcdefg"
MAPS_PROVIDER="google"
GOOGLE_MAPS_API_KEY="AIzaSyYourProductionGoogleMapsKeyHere"
```

