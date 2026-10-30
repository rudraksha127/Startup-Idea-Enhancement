import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateBody } from "../../common/validate.middleware.js";
import { asyncHandler } from "../../common/async-handler.js";
import { loginSchema, registerSchema } from "../../validators/auth.validator.js";
import { authRateLimit } from "../../middleware/rate-limit.js";

export const authRouter = Router();

// Stricter rate limit on auth endpoints (10 req / 15 min per IP)
authRouter.post("/register", authRateLimit, validateBody(registerSchema), asyncHandler(AuthController.register));
authRouter.post("/login", authRateLimit, validateBody(loginSchema), asyncHandler(AuthController.login));
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", asyncHandler(AuthController.me));

