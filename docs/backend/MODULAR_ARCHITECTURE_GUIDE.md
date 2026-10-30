# AgencyOS Backend — Plug-and-Play Modular Architecture Guide

**Document Type:** Architecture & Developer Guide  
**Status:** Canonical & Active  
**Audience:** Backend Engineers, Full-Stack Contributors, AI Agents  

---

## 1. Architectural Philosophy: Plug-and-Play Vertical Slices

In AgencyOS, the backend is strictly organized into **self-contained, isolated vertical slice modules** under `apps/api/src/modules/`.

### 🔑 The Core Rule
> **You do NOT need to read, understand, or modify existing modules to build or integrate a new feature.**
>
> Every module is a standalone package containing its own routes, controller, service, and lifecycle hooks. New modules are plugged in by dropping a folder and adding one entry to the central registry.

```
apps/api/src/
├── common/                  <-- Universal Developer Toolkit (reused everywhere)
│   ├── api-response.ts      (sendSuccess, sendError, sendPaginated)
│   ├── async-handler.ts     (zero try/catch boilerplate)
│   ├── module.interface.ts  (AppModule contract)
│   ├── resolve-org.ts       (safe multi-tenant org resolution)
│   └── validate.middleware.ts (Zod request validation)
│
├── modules/                 <-- Vertical Slice Modules (100% decoupled)
│   ├── health/
│   ├── auth/
│   ├── leads/
│   ├── clients/
│   ├── projects/
│   ├── campaigns/
│   ├── agents/
│   ├── dashboard/
│   ├── analytics/
│   ├── settings/
│   ├── <your-new-module>/   <-- New modules go here!
│   └── index.ts             <-- Central Module Registry (activeModules)
```

---

## 2. Structure of a Module

Every module folder follows the exact same 4-file structure:

```
apps/api/src/modules/<name>/
├── <name>.service.ts    # Business logic & database operations
├── <name>.controller.ts # Express request/response handling
├── <name>.routes.ts     # Route mapping & middleware attachment
└── index.ts            # AppModule definition and public exports
```

### File Responsibilities:

| File | Purpose | Rule |
| :--- | :--- | :--- |
| `<name>.service.ts` | Interacts with database models, external APIs, and business rules. | Never accesses `req` or `res`. Pure data in, pure data out. |
| `<name>.controller.ts` | Extracts params/body from `req`, calls service, formats response. | Always uses `asyncHandler` and `sendSuccess` / `sendError`. |
| `<name>.routes.ts` | Defines URL paths and attaches middleware (`requireAuth`, `validateBody`). | Does not write inline handler logic. Points to controller methods. |
| `index.ts` | Exports the `AppModule` object and public services/controllers. | Implements the `AppModule` interface. |

---

## 3. The 30-Second New Module Workflow (CLI Scaffolder)

You can generate a fully functional, typed, and automatically registered module with a single command:

```bash
npm run new:module <name>
```

### Example: Adding an Invoices Module

```bash
npm run new:module invoices
```

This single command automatically:
1. Creates `apps/api/src/modules/invoices/`
2. Generates `invoices.service.ts` with standard CRUD operations
3. Generates `invoices.controller.ts` with typed handlers
4. Generates `invoices.routes.ts` with REST endpoints
5. Generates `index.ts` exporting `invoicesModule: AppModule`
6. **Registers the module automatically** in `apps/api/src/modules/index.ts`

### Immediately Available Endpoints:
```
GET    /api/v1/invoices       (List all invoices)
POST   /api/v1/invoices       (Create new invoice)
GET    /api/v1/invoices/:id   (Get invoice details)
PATCH  /api/v1/invoices/:id   (Update invoice)
DELETE /api/v1/invoices/:id   (Delete invoice)
```
*(Also accessible via legacy `/api/invoices` without code duplication).*

---

## 4. Universal Developer Toolkit (`apps/api/src/common/`)

All modules share a standard zero-boilerplate toolkit. Never re-invent these utilities.

### 4.1 Async Handler (`async-handler.ts`)
Wraps async controller functions so any thrown errors or rejections automatically flow to the central Express error handler without `try/catch` boilerplate.

```typescript
import { asyncHandler } from "../../common/async-handler.js";

router.get("/", asyncHandler(MyController.getAll));
```

### 4.2 Standard API Responses (`api-response.ts`)
Guarantees consistent JSON shapes across the entire SaaS platform.

```typescript
import { sendSuccess, sendError, sendPaginated } from "../../common/api-response.js";

// Success: { success: true, data: {...}, message?: "..." }
sendSuccess(res, client, "Client created", 201);

// Error: { success: false, error: "..." }
sendError(res, "Item not found", 404);

// Paginated: { success: true, data: [...], pagination: { total, page, limit, totalPages, hasMore } }
sendPaginated(res, items, total, page, limit);
```

### 4.3 Request Validation Middleware (`validate.middleware.ts`)
Validates `req.body` or `req.query` against Zod schemas before hitting the controller:

```typescript
import { validateBody } from "../../common/validate.middleware.js";
import { createInvoiceSchema } from "./invoices.validator.js";

router.post("/", validateBody(createInvoiceSchema), asyncHandler(InvoicesController.create));
```

### 4.4 Organization & Param Helpers (`resolve-org.ts`)
Resolves the active tenant organization ID from authenticated session with safe fallback for testing and development environments:

```typescript
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

const orgId = await resolveOrgId(req);
const id = extractId(req.params.id);
```

---

## 5. AppModule Interface & Lifecycle Hooks

Every module implements the `AppModule` interface:

```typescript
export interface AppModule {
  name: string;        // Unique identifier (e.g. "leads", "billing")
  routePrefix: string; // URL mount point (e.g. "/leads")
  router: Router;      // Express router containing module endpoints
  init?: () => Promise<void> | void; // Optional startup lifecycle hook
}
```

### Using the Optional `init()` Hook:
If your module needs to ensure database indexes, register webhooks, or seed initial configuration when the server boots:

```typescript
export const billingModule: AppModule = {
  name: "billing",
  routePrefix: "/billing",
  router: billingRouter,
  init: async () => {
    // Run one-time initialization safely
    console.log("[Billing Module] Verifying webhook endpoints...");
  },
};
```

---

## 6. Manual Registration (If Not Using CLI)

If you create a module folder manually:
1. Open `apps/api/src/modules/index.ts`
2. Import your module:
   ```typescript
   import { myModule } from "./my-module/index.js";
   ```
3. Add it to the `activeModules` array:
   ```typescript
   export const activeModules: AppModule[] = [
     healthModule,
     // ... existing modules ...
     myModule,
   ];
   ```

No other files in the entire project need to be edited!

---

## 7. Deterministic Safety Invariants

When writing code inside any module:

1. **Strict Source Policy:** Never implement Google Maps scraping. Respect Indian DPDP Act 2023 and TRAI regulations.
2. **Deterministic Outbound Actions:** Any action that sends emails, WhatsApp messages, or spends money must default to `dry_run = true` unless explicit authorization is verified.
3. **NodeNext Import Conventions:** In `apps/api/`, always write explicit `.js` extensions for relative TypeScript imports (e.g., `import { LeadsService } from "./leads.service.js";`).
