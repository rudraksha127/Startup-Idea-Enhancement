import { AppModule } from "../../common/module.interface.js";
import { clientsRouter } from "./clients.routes.js";

export const clientsModule: AppModule = {
  name: "clients",
  routePrefix: "/clients",
  router: clientsRouter,
};

export { ClientsService } from "./clients.service.js";
export { ClientsController } from "./clients.controller.js";

