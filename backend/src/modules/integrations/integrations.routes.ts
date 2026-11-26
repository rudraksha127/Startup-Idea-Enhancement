import { Router } from "express";
import { IntegrationsController } from "./integrations.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);

integrationsRouter.get("/", asyncHandler(IntegrationsController.getIntegrations));
integrationsRouter.post("/test", asyncHandler(IntegrationsController.testIntegration));
integrationsRouter.get("/diagnostics", asyncHandler(IntegrationsController.getDiagnostics));
integrationsRouter.post("/webhooks/test", asyncHandler(IntegrationsController.testWebhook));
