import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { ENV } from "../../config/env.js";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    try {
      const result = await AuthService.registerUser(req.body);

      res.cookie("agencyos_token", result.token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        token: result.token,
        user: {
          ...result.user,
          organization: result.organization,
        },
      });
    } catch (err: any) {
      if (err.message === "ACCOUNT_EXISTS") {
        return res.status(409).json({
          error: "Account already exists",
          message: "An account with this email address is already registered.",
        });
      }
      throw err;
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const result = await AuthService.loginUser(req.body);

      res.cookie("agencyos_token", result.token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === "production",
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        token: result.token,
        user: {
          ...result.user,
          organization: result.organization,
        },
      });
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          error: "Invalid credentials",
          message: "No account found matching this email and password.",
        });
      }
      throw err;
    }
  };

  static logout = (_req: Request, res: Response) => {
    res.clearCookie("agencyos_token");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  };

  static me = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const profile = await AuthService.getUserProfile(req.user.userId);
    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        ...profile.user,
        organization: profile.organization,
      },
    });
  };
}
