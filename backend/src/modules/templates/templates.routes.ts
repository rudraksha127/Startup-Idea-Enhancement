import { Router } from "express";
import { TemplatesController } from "./templates.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const templatesRouter = Router();

templatesRouter.use(requireAuth);

templatesRouter.get("/", asyncHandler(TemplatesController.listTemplates));
templatesRouter.get("/:id", asyncHandler(TemplatesController.getTemplateById));
templatesRouter.post("/", asyncHandler(TemplatesController.createTemplate));
templatesRouter.post("/:id/apply", asyncHandler(TemplatesController.applyTemplate));

