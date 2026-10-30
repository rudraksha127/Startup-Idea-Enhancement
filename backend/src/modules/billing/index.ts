import { AppModule } from "../../common/module.interface.js";
import { billingRouter } from "./billing.routes.js";

export const billingModule: AppModule = {
  name: "billing",
  routePrefix: "/billing",
  router: billingRouter,
};

export { BillingService } from "./billing.service.js";
export { BillingController } from "./billing.controller.js";

