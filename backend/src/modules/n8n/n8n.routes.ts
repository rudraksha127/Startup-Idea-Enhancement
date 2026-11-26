import { Router } from "express";
import { N8nController } from "./n8n.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const n8nRouter = Router();

// Status probe
n8nRouter.get("/status", requireAuth, asyncHandler(N8nController.getSyncStatus));

// Inbound webhooks from n8n (secured via HMAC or webhook secret)
n8nRouter.post("/webhook/lead-audit", asyncHandler(N8nController.handleLeadAuditWebhook));
n8nRouter.post("/webhook/prospect-sync", asyncHandler(N8nController.handleProspectSyncWebhook));

// Outbound trigger to dispatch an n8n workflow execution
n8nRouter.post("/trigger/:workflow", requireAuth, asyncHandler(N8nController.triggerWorkflow));

