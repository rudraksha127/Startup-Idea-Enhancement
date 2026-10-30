import { Router } from "express";
import { AgentsController } from "./agents.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";
import { agentRunRateLimit } from "../../middleware/rate-limit.js";

export const agentsRouter = Router();

agentsRouter.get("/", asyncHandler(AgentsController.getAgents));
agentsRouter.get("/:id", asyncHandler(AgentsController.getAgentById));
agentsRouter.patch("/:id", requireAuth, asyncHandler(AgentsController.updateAgent));
agentsRouter.post("/:id/run", requireAuth, agentRunRateLimit, asyncHandler(AgentsController.runAgent));

