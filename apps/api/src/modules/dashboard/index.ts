import { AppModule } from "../../common/module.interface.js";
import { dashboardRouter } from "./dashboard.routes.js";

export const dashboardModule: AppModule = {
  name: "dashboard",
  routePrefix: "/dashboard",
  router: dashboardRouter,
};

export { DashboardService } from "./dashboard.service.js";
export { DashboardController } from "./dashboard.controller.js";
