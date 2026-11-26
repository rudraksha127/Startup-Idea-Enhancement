import { Router } from "express";
import { AgentsController } from "./agents.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { agentRunRateLimit } from "../../middleware/rate-limit.js";

export const agentsRouter = Router();

agentsRouter.use(requireAuth);

agentsRouter.get("/", asyncHandler(AgentsController.getAgents));
agentsRouter.get("/runs", asyncHandler(AgentsController.getRunHistory));
agentsRouter.post("/runs/:runId/approve", asyncHandler(AgentsController.approveRun));
agentsRouter.get("/:id", asyncHandler(AgentsController.getAgentById));
agentsRouter.get("/:id/runs", asyncHandler(AgentsController.getRunHistory));
agentsRouter.patch("/:id", asyncHandler(AgentsController.updateAgent));
agentsRouter.post("/:id/run", agentRunRateLimit, asyncHandler(AgentsController.runAgent));
