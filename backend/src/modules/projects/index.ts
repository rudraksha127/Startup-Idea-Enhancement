import { AppModule } from "../../common/module.interface.js";
import { projectsRouter } from "./projects.routes.js";

export const projectsModule: AppModule = {
  name: "projects",
  routePrefix: "/projects",
  router: projectsRouter,
};

export { ProjectsService } from "./projects.service.js";
export { ProjectsController } from "./projects.controller.js";

