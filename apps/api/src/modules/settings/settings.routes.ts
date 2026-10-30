import { Router } from "express";
import { SettingsController } from "./settings.controller.js";
import { asyncHandler } from "../../common/async-handler.js";
import { requireAuth } from "../../middleware/auth.js";

export const settingsRouter = Router();

settingsRouter.get("/", asyncHandler(SettingsController.getSettings));
settingsRouter.patch("/", requireAuth, asyncHandler(SettingsController.updateSettings));

