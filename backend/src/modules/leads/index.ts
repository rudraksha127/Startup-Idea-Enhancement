import { AppModule } from "../../common/module.interface.js";
import { leadsRouter } from "./leads.routes.js";

export const leadsModule: AppModule = {
  name: "leads",
  routePrefix: "/leads",
  router: leadsRouter,
};

export { LeadsService } from "./leads.service.js";
export { LeadsController } from "./leads.controller.js";

