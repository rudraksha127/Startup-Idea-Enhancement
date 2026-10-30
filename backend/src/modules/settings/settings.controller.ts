import { Request, Response } from "express";
import { SettingsService } from "./settings.service.js";
import { resolveOrgId } from "../../common/resolve-org.js";

export class SettingsController {
  static getSettings = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const data = await SettingsService.getSettings(orgId);
    return res.status(200).json({ success: true, data });
  };

  static updateSettings = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const data = await SettingsService.updateSettings(req.body, orgId);
    return res.status(200).json({ success: true, data });
  };
}
