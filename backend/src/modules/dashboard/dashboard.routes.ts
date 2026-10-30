import { Router } from "express";
import { DashboardController } from "./dashboard.controller.js";
import { asyncHandler } from "../../common/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/metrics", asyncHandler(DashboardController.getMetrics));
dashboardRouter.get("/activity", asyncHandler(DashboardController.getActivity));

