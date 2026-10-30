import { Request, Response } from "express";
import { IntegrationsService } from "./integrations.service.js";

export class IntegrationsController {
  static getIntegrations = async (_req: Request, res: Response) => {
    const integrations = await IntegrationsService.testAllIntegrations();
    return res.status(200).json({ success: true, integrations });
  };

  static testIntegration = async (req: Request, res: Response) => {
    const { provider, apiKey } = req.body || {};
    const result = await IntegrationsService.testProvider(provider, apiKey);
    return res.status(200).json({ success: true, result });
  };
}

