import { AppModule } from "../../common/module.interface.js";
import { teamsRouter } from "./teams.routes.js";

export const teamsModule: AppModule = {
  name: "teams",
  routePrefix: "/teams",
  router: teamsRouter,
  init: async () => {
    // Initialization lifecycle hook for teams module
  },
};

export * from "./teams.service.js";
export * from "./teams.controller.js";
