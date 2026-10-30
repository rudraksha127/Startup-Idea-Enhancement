import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateBody } from "../../common/validate.middleware.js";
import { asyncHandler } from "../../common/async-handler.js";
import { loginSchema, registerSchema } from "../../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(AuthController.register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(AuthController.login));
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", asyncHandler(AuthController.me));
