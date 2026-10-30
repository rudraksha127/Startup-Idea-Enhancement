import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";
import { asyncHandler } from "../../common/async-handler.js";

export const analyticsRouter = Router();

analyticsRouter.get("/", asyncHandler(AnalyticsController.getOverview));
analyticsRouter.get("/overview", asyncHandler(AnalyticsController.getOverview));

