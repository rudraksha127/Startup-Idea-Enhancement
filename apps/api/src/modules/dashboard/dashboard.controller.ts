import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service.js";
import { resolveOrgId } from "../../common/resolve-org.js";

export class DashboardController {
  static getMetrics = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const data = await DashboardService.getMetrics(orgId);
    return res.status(200).json(data);
  };

  static getActivity = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const activities = await DashboardService.getActivities(orgId);
    return res.status(200).json({ activities });
  };
}
