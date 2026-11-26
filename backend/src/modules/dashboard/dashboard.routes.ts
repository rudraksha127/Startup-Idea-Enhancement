import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/metrics", asyncHandler(DashboardController.getMetrics));
dashboardRouter.get("/activity", asyncHandler(DashboardController.getActivity));

