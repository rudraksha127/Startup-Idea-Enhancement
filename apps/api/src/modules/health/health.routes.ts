import { Router, Request, Response } from "express";
import mongoose from "mongoose";

export const healthRouter = Router();

healthRouter.get("/", (req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "agencyos-express-api",
    version: "1.0.0",
    database: {
      status: dbConnected ? "connected" : "disconnected",
    },
  });
});

