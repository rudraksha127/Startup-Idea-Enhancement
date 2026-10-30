# AgencyOS — Technology Stack & Version Governance Matrix

**Document Version:** 1.0.0  
**Status:** Approved Standard  
**Last Verified:** 30 October 2026  
**Auditor:** DevSecOps & Architecture Governance Board  

---

## 1. Technology Selection Principles

AgencyOS adheres to the **Latest Stable Technology Policy**:
1. **Prefer Verified Stable LTS:** Maintain system reliability by selecting active LTS and stable major versions.
2. **Deterministic Monorepo Harmony:** Ensure core libraries (React, TypeScript, Zod) share compatible version boundaries across frontend, backend, packages, and tests.
3. **No Unvalidated Prereleases in Production:** Avoid canary/beta builds in core production paths without explicit ADR signoff.
4. **Zero Unpatched High/Critical CVEs:** Continuously audit npm lockfiles against the National Vulnerability Database (NVD).

---

## 2. Core Dependency Matrix

| Technology / Package | Installed Version | Latest Stable Checked | Official Source URL | Support Status | Why Selected | Breaking Changes & Security Notes | Upgrade Recommendation |
| :--- | :---: | :---: | :--- | :---: | :--- | :--- | :---: |
| **Node.js Runtime** | `v20.18.0` | `v22.11.0` (Active LTS) | [nodejs.org](https://nodejs.org) | Active LTS | Exceptional enterprise stability across Windows, Linux, and Cloudflare/Zoho runtimes. | V22 introduces native WebSocket & test runner enhancements. | Upgrade to Node 22 on next infrastructure release cycle. |
| **Next.js** | `15.1.4` | `15.1.4` | [nextjs.org](https://nextjs.org) | Active Stable | Industry-standard React framework; App Router, React Server Components (RSC), optimized build traces. | Async Request APIs (`headers()`, `cookies()`) require `await`. | Pin to `15.1.x` patch updates. |
| **React & React-DOM**| `19.0.0` | `19.0.0` | [react.dev](https://react.dev) | Active Stable | Modern component primitives, Actions, `useActionState`, native optimistic UI. | Removed deprecated legacy lifecycle hooks; strict hydration matching. | Maintain `19.0.x` stable. |
| **Express** | `5.3.0` | `5.3.0` | [expressjs.com](https://expressjs.com) | Active Stable | Ubiquitous Node.js REST API engine with native Promise / `async-await` error rejection handling. | `req.query` parser behavior streamlined; rejected promises automatically pass to error middleware. | Maintain on `5.x`. |
| **TypeScript** | `5.7.2` | `5.7.2` | [typescriptlang.org](https://typescriptlang.org)| Active Stable | Strict compile-time type safety across monorepo packages. | Strict mode enabled; TS2783 duplicate object properties strictly prohibited. | Keep current with `5.7.x`. |
| **MongoDB Driver / Mongoose** | `8.9.3` | `8.9.3` | [mongoosejs.com](https://mongoosejs.com) | Active Stable | Schema validation, compound index definitions, population, and connection pooling. | Mongoose 8 enforces strict schema queries and modern driver connection options by default. | Pin to `8.9.x`. |
| **Zod** | `3.24.1` | `3.24.1` | [zod.dev](https://zod.dev) | Active Stable | Runtime schema validation for webhook payloads, external API contracts, and user inputs. | Zero-dependency, type-inferrable schema definitions. | Maintain on `3.24.x`. |
| **Tailwind CSS** | `3.4.17` | `3.4.17` | [tailwindcss.com](https://tailwindcss.com) | Active Stable | Utility-first styling with high-performance CSS compilation and custom agency color tokens. | V4 CSS-first engine evaluated; V3.4 chosen for seamless Next.js 15 Tailwind plugins compatibility. | Evaluate V4 transition in Milestone 5. |
| **Vitest** | `2.1.8` | `2.1.8` | [vitest.dev](https://vitest.dev) | Active Stable | Blazing fast ESM-native test runner with JSDOM support for component and unit testing. | Instant test transform times (transform $<3$s for 72 tests). | Maintain on `2.1.x`. |
| **Playwright** | `1.49.1` | `1.49.1` | [playwright.dev](https://playwright.dev) | Active Stable | Cross-browser end-to-end and staging visual regression testing. | Reliable headless Chromium testing with automatic trace recording on failure. | Maintain on `1.49.x`. |
| **Helmet** | `8.3.0` | `8.3.0` | [helmetjs.github.io](https://helmetjs.github.io)| Active Stable | HTTP security headers (CSP, X-Frame-Options: DENY, HSTS, Sniff protection). | Zero configuration baseline hardening against XSS and clickjacking. | Maintain on `8.3.x`. |
| **JSONWebToken** | `9.0.2` | `9.0.2` | [github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)| Active Stable | Stateless JWT bearer token authentication for multi-tenant API requests. | Cryptographically signed with HMAC-SHA256. | Maintain on `9.0.x`. |
| **Bcryptjs** | `2.4.3` | `2.4.3` | [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js)| Active Stable | Pure JavaScript password hashing with zero native compilation dependencies. | Safe across all OS platforms (Windows, macOS, Linux, Alpine). | Maintain on `2.4.x`. |
| **Lucide React** | `0.468.0` | `0.468.0` | [lucide.dev](https://lucide.dev) | Active Stable | Consistent, clean SVG iconography across the entire dashboard interface. | Tree-shakeable SVG icons. | Maintain on `0.468.x`. |
| **Recharts** | `2.15.0` | `2.15.0` | [recharts.org](https://recharts.org) | Active Stable | Declarative chart rendering for executive analytics, revenue, and lead funnels. | Compatible with React 19. | Maintain on `2.15.x`. |
| **n8n Automation Engine**| `1.70.0+` | `1.72.0` | [n8n.io](https://n8n.io) | Production LTS | Multi-agent workflow orchestrator, webhook coordinator, and integration connector. | Self-hosted via Docker Compose with PostgreSQL 16 state storage and Redis queuing. | Pin to stable `1.x` production line. |

---

## 3. Dependency Governance & CI Checks

1. **Automated Audit:** Every pull request executes `npm audit --omit=dev` to verify zero known high/critical CVEs.
2. **Lockfile Enforcement:** All deployments require `npm ci` rather than `npm install` to ensure bit-for-bit reproducibility.
3. **No Phantom Dependencies:** All shared utilities must be declared in root `package.json` or within `packages/*`.
4. **Single Source of Truth:** `package-lock.json` at root is the sole authoritative lockfile for the repository.
