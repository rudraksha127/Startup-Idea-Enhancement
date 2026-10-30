import { Router } from "express";
import { registerAllModules } from "../modules/index.js";

export const apiRouter = Router();

// Register all modular vertical slices
registerAllModules(apiRouter);
