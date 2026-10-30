import { AppModule } from "../../common/module.interface.js";
import { mapsRouter } from "./maps.routes.js";

export const mapsModule: AppModule = {
  name: "maps",
  routePrefix: "/maps",
  router: mapsRouter,
};

export { MapsService } from "./maps.service.js";
export { MapsController } from "./maps.controller.js";

