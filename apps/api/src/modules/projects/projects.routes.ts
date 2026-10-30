import { Router } from "express";
import { ProjectsController } from "./projects.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const projectsRouter = Router();

projectsRouter.get("/", asyncHandler(ProjectsController.getProjects));
projectsRouter.post("/", requireAuth, asyncHandler(ProjectsController.createProject));
projectsRouter.get("/:id", asyncHandler(ProjectsController.getProjectById));
projectsRouter.patch("/:id", requireAuth, asyncHandler(ProjectsController.updateProject));

