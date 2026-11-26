import { Router } from "express";
import { CampaignsController } from "./campaigns.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const campaignsRouter = Router();

campaignsRouter.use(requireAuth);

campaignsRouter.get("/", asyncHandler(CampaignsController.getCampaigns));
campaignsRouter.post("/", asyncHandler(CampaignsController.createCampaign));
campaignsRouter.get("/messages", asyncHandler(CampaignsController.getOutreachMessages));
campaignsRouter.post("/messages", asyncHandler(CampaignsController.createOutreachMessage));
campaignsRouter.get("/:id", asyncHandler(CampaignsController.getCampaignById));
campaignsRouter.patch("/:id", asyncHandler(CampaignsController.updateCampaign));
campaignsRouter.delete("/:id", asyncHandler(CampaignsController.deleteCampaign));

