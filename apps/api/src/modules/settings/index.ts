import { AppModule } from "../../common/module.interface.js";
import { settingsRouter } from "./settings.routes.js";

export const settingsModule: AppModule = {
  name: "settings",
  routePrefix: "/settings",
  router: settingsRouter,
};

export { SettingsService } from "./settings.service.js";
export { SettingsController } from "./settings.controller.js";
