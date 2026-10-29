import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const reqId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.id = reqId;
  res.setHeader("X-Request-Id", reqId);

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

