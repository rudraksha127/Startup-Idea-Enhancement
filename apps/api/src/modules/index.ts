import { Router } from "express";
import { AppModule } from "../common/module.interface.js";

// Active core modules
import { healthModule } from "./health/index.js";
import { authModule } from "./auth/index.js";
import { leadsModule } from "./leads/index.js";
import { clientsModule } from "./clients/index.js";
import { projectsModule } from "./projects/index.js";
import { campaignsModule } from "./campaigns/index.js";
import { agentsModule } from "./agents/index.js";
import { dashboardModule } from "./dashboard/index.js";
import { analyticsModule } from "./analytics/index.js";
import { settingsModule } from "./settings/index.js";
import { mapsModule } from "./maps/index.js";
import { templatesModule } from "./templates/index.js";
import { billingModule } from "./billing/index.js";
import { integrationsModule } from "./integrations/index.js";

/**
 * Central Module Registry
 * -----------------------
 * To add a new module to AgencyOS:
 * 1. Create a new folder under `apps/api/src/modules/<module-name>/`
 * 2. Implement routes, controller, service, and export an `AppModule` from its `index.ts`
 * 3. Add the exported module to the `activeModules` array below (or run `npm run new:module <name>`)
 *
 * You NEVER have to modify or read through existing modules to add a new feature!
 */
export const activeModules: AppModule[] = [
  healthModule,
  authModule,
  leadsModule,
  clientsModule,
  projectsModule,
  campaignsModule,
  agentsModule,
  dashboardModule,
  analyticsModule,
  settingsModule,
  mapsModule,
  templatesModule,
  billingModule,
  integrationsModule,
];

/**
 * Automatically mounts all registered modules onto the provided Express router.
 */
export function registerAllModules(rootRouter: Router): void {
  for (const mod of activeModules) {
    rootRouter.use(mod.routePrefix, mod.router);

    // Run optional lifecycle initialization
    if (typeof mod.init === "function") {
      Promise.resolve(mod.init()).catch((err) => {
        console.error(`[Module Registry] Error initializing module "${mod.name}":`, err);
      });
    }
  }
}

/**
 * Retrieve a registered module by name (useful for testing and introspection)
 */
export function getModule(name: string): AppModule | undefined {
  return activeModules.find((m) => m.name.toLowerCase() === name.toLowerCase());
}
