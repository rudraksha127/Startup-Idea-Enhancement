# SBOM & Supply Chain Security — AgencyOS
**Last Updated:** 2026-10-30  
**Status:** PARTIAL — manual SBOM; automated generation pending

## What Is This Document?

This document inventories all direct and transitive dependencies for supply-chain risk awareness, following SLSA Level 1 principles.

## Frontend Dependencies (Root `package.json`)

### Production Dependencies

| Package | Version | Purpose | License | Risk |
|---------|---------|---------|---------|------|
| next | ^15.1.4 | React SSR/SSG framework | MIT | LOW |
| react | ^19.0.0 | UI library | MIT | LOW |
| react-dom | ^19.0.0 | React DOM renderer | MIT | LOW |
| typescript | ^5.7.2 | Type system | Apache-2.0 | LOW |
| tailwindcss | ^3.4.17 | CSS utility framework | MIT | LOW |
| lucide-react | ^0.468.0 | Icon library | ISC | LOW |
| recharts | ^2.15.0 | Chart library | MIT | LOW |
| next-themes | ^0.4.6 | Theme switching | MIT | LOW |
| zod | ^3.24.1 | Schema validation | MIT | LOW |
| clsx | ^2.1.1 | Class name utility | MIT | LOW |
| tailwind-merge | ^2.5.5 | Tailwind class merging | MIT | LOW |
| papaparse | ^5.4.1 | CSV parser | MIT | LOW |
| bcryptjs | ^2.4.3 | Password hashing | MIT | LOW |
| jsonwebtoken | ^9.0.2 | JWT generation/verification | MIT | LOW |
| mongoose | ^8.9.3 | MongoDB ODM | MIT | LOW |
| express | ^5.3.0 | HTTP server framework | MIT | LOW |
| cors | ^2.8.6 | CORS middleware | MIT | LOW |
| dotenv | ^18.0.9 | Env var loading | BSD-2-Clause | LOW |
| express-rate-limit | ^7.x | Rate limiting middleware | MIT | LOW |
| helmet | ^8.x | Security headers | MIT | LOW |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^2.1.8 | Test runner |
| @playwright/test | ^1.49.1 | E2E test framework |
| supertest | ^7.3.1 | HTTP test client |
| eslint | ^9.17.0 | Linter |
| @testing-library/react | ^16.1.0 | React component testing |
| jsdom | ^25.0.1 | DOM simulation |
| tsx | ^4.19.2 | TypeScript execution |

## GitHub Actions Pinning

> [!WARNING]
> Current workflows use version tags (e.g., `actions/checkout@v4`), not SHA-pinned commits.
> For supply-chain hardening, pin to commit SHAs.

| Action | Current | SHA-Pinned (Recommended) |
|--------|---------|--------------------------|
| `actions/checkout` | `@v4` | `@11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2) |
| `actions/setup-node` | `@v4` | `@39370e3970a6d050c480ffad4ff0ed4d3fdee5af` (v4.1.0) |
| `actions/upload-artifact` | `@v4` | `@65c4c4a1ddee5b72f698fdd19549f0f0fb45cf08` (v4.6.0) |

**TODO:** Update `.github/workflows/ci.yml` to use SHA-pinned actions before production.

## Vulnerability Scanning

Run manually:
```bash
npm audit                     # Check all dependencies
npm audit --audit-level=high  # Only high/critical (CI threshold)
npm audit fix                 # Auto-fix compatible vulnerabilities
```

## Generating a Machine-Readable SBOM

```bash
# Generate CycloneDX SBOM (install once)
npm install -g @cyclonedx/cyclonedx-npm

# Generate SBOM
cyclonedx-npm --output-format json --output-file sbom.json
```

**TODO:** Add SBOM generation to CI pipeline and store artifact on each release.

## Key Supply Chain Risks

| Risk | Mitigation | Status |
|------|------------|--------|
| Dependency confusion | Scoped packages (`@agencyos/*`) | PARTIAL |
| Typosquatting | Lockfile (`package-lock.json`) committed | ✅ DONE |
| GitHub Actions supply chain | Version-pinned actions | ⚠️ SHA-pin TODO |
| Malicious PR dependency changes | CI `npm audit` check | ✅ DONE |
| Outdated dependencies with CVEs | `npm audit` in CI | ✅ DONE |
| Secrets in dependencies | No secret scanning on deps | ⚠️ TODO |
