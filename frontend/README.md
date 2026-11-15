# AgencyOS — Frontend Application (Next.js 15 App Router)

**Deployment Target:** Cloudflare Pages / Containerized Edge  
**Framework:** Next.js 15.1.4, React 19, Tailwind CSS 3.4, Lucide Icons  

---

## 1. Directory Structure

```text
frontend/
├── public/          # Static assets (images, template thumbnails, banners)
├── src/
│   ├── app/         # App router pages: (marketing), (auth), (dashboard)
│   ├── components/  # Layout, navigation, UI primitives
│   ├── features/    # Feature slices: dashboard, leads, map-explorer, etc.
│   ├── hooks/       # Custom React hooks
│   ├── services/    # API client services
│   ├── stores/      # Client-side state stores
│   ├── lib/         # Shared utilities
│   ├── types/       # Component & domain prop types
│   ├── styles/      # Global CSS and themes
│   └── config/      # Client configuration constants
├── package.json     # Frontend dependencies
├── next.config.ts   # Next.js build configuration
├── tailwind.config.ts # Tailwind CSS configuration with custom agency tokens
└── Dockerfile       # Production container specification
```

## 2. Development Scripts

```bash
# Start frontend development server
npm run dev

# Production build
npm run build

# Typecheck frontend
npm run typecheck
```
