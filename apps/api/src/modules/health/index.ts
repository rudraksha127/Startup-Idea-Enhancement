import { AppModule } from "../../common/module.interface.js";
import { healthRouter } from "./health.routes.js";

export const healthModule: AppModule = {
  name: "health",
  routePrefix: "/health",
  router: healthRouter,
};

