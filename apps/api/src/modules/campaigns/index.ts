import { AppModule } from "../../common/module.interface.js";
import { campaignsRouter } from "./campaigns.routes.js";

export const campaignsModule: AppModule = {
  name: "campaigns",
  routePrefix: "/campaigns",
  router: campaignsRouter,
};

export { CampaignsService } from "./campaigns.service.js";
export { CampaignsController } from "./campaigns.controller.js";

