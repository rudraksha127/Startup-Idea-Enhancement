import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.cookie) {
      // Parse cookie if present
      const match = req.headers.cookie.match(/agencyos_token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      // Allow unauthenticated fallback for development inspection if header omitted
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    // Return unauthorized for invalid tokens
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired session token",
      requestId: req.id,
    });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication is required to access this resource",
      requestId: req.id,
    });
  }
  next();
}

