import { Router } from "express";
import { TeamsController } from "./teams.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const teamsRouter = Router();

teamsRouter.get("/members", requireAuth, asyncHandler(TeamsController.listMembers));
teamsRouter.post("/invite", requireAuth, asyncHandler(TeamsController.inviteMember));
teamsRouter.patch("/members/:id", requireAuth, asyncHandler(TeamsController.updateRole));
teamsRouter.delete("/members/:id", requireAuth, asyncHandler(TeamsController.removeMember));

