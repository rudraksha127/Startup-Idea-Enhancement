import { Router, Request, Response } from "express";
import { catalystClient } from "../../infrastructure/persistence/zoho-catalyst/catalyst.client.js";

export const healthRouter = Router();

healthRouter.get("/", async (req: Request, res: Response) => {
  let dbConnected = false;
  try {
    await catalystClient.executeZCQL("SELECT ROWID FROM Leads");
    dbConnected = true;
  } catch (err) {
    dbConnected = catalystClient.isMockMode();
  }

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "agencyos-express-api",
    version: "1.0.0",
    database: {
      provider: "Zoho Catalyst CloudScale Data Store",
      status: dbConnected ? "connected" : "disconnected",
      mockMode: catalystClient.isMockMode(),
    },
  });
});

