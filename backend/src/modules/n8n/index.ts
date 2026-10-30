import { AppModule } from "../../common/module.interface.js";
import { n8nRouter } from "./n8n.routes.js";

export const n8nModule: AppModule = {
  name: "n8n",
  routePrefix: "/n8n",
  router: n8nRouter,
  init: async () => {
    // Initialization lifecycle hook for n8n module
  },
};

export * from "./n8n.service.js";
export * from "./n8n.controller.js";
