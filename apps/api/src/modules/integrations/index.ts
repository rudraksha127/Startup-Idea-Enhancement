import { AppModule } from "../../common/module.interface.js";
import { integrationsRouter } from "./integrations.routes.js";

export const integrationsModule: AppModule = {
  name: "integrations",
  routePrefix: "/integrations",
  router: integrationsRouter,
};

export { IntegrationsService } from "./integrations.service.js";
export { IntegrationsController } from "./integrations.controller.js";

