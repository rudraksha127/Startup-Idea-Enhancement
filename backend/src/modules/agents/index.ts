import { AppModule } from "../../common/module.interface.js";
import { agentsRouter } from "./agents.routes.js";

export const agentsModule: AppModule = {
  name: "agents",
  routePrefix: "/agents",
  router: agentsRouter,
};

export { AgentsService } from "./agents.service.js";
export { AgentsController } from "./agents.controller.js";

