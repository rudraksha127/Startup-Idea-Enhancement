import { AppModule } from "../../common/module.interface.js";
import { analyticsRouter } from "./analytics.routes.js";

export const analyticsModule: AppModule = {
  name: "analytics",
  routePrefix: "/analytics",
  router: analyticsRouter,
};

export { AnalyticsService } from "./analytics.service.js";
export { AnalyticsController } from "./analytics.controller.js";

