import { Router } from "express";
import { CampaignsController } from "./campaigns.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const campaignsRouter = Router();

campaignsRouter.get("/", asyncHandler(CampaignsController.getCampaigns));
campaignsRouter.post("/", requireAuth, asyncHandler(CampaignsController.createCampaign));
campaignsRouter.get("/messages", asyncHandler(CampaignsController.getOutreachMessages));
campaignsRouter.post("/messages", requireAuth, asyncHandler(CampaignsController.createOutreachMessage));
campaignsRouter.get("/:id", asyncHandler(CampaignsController.getCampaignById));
campaignsRouter.patch("/:id", requireAuth, asyncHandler(CampaignsController.updateCampaign));
campaignsRouter.delete("/:id", requireAuth, asyncHandler(CampaignsController.deleteCampaign));
