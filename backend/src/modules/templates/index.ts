import { AppModule } from "../../common/module.interface.js";
import { templatesRouter } from "./templates.routes.js";

export const templatesModule: AppModule = {
  name: "templates",
  routePrefix: "/templates",
  router: templatesRouter,
};

export { TemplatesService } from "./templates.service.js";
export { TemplatesController } from "./templates.controller.js";

