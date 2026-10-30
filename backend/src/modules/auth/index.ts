import { AppModule } from "../../common/module.interface.js";
import { authRouter } from "./auth.routes.js";

export const authModule: AppModule = {
  name: "auth",
  routePrefix: "/auth",
  router: authRouter,
};

export { AuthService } from "./auth.service.js";
export { AuthController } from "./auth.controller.js";

