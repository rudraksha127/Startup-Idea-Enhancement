import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service.js";
import { resolveOrgId } from "../../common/resolve-org.js";

export class AnalyticsController {
  static getOverview = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const timeRange = (req.query.range as string) || "30d";
    const data = await AnalyticsService.getOverview(orgId, timeRange);
    return res.status(200).json({ success: true, data });
  };
}
