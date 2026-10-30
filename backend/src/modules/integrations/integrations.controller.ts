import { Request, Response } from "express";
import { IntegrationsService } from "./integrations.service.js";

export class IntegrationsController {
  static getIntegrations = async (_req: Request, res: Response) => {
    const integrations = await IntegrationsService.testAllIntegrations();
    return res.status(200).json({ success: true, integrations, data: integrations });
  };

  static testIntegration = async (req: Request, res: Response) => {
    const { provider, apiKey } = req.body || {};
    const result = await IntegrationsService.testProvider(provider, apiKey);
    return res.status(200).json({ success: true, result, data: result });
  };

  static getDiagnostics = async (_req: Request, res: Response) => {
    const diagnostics = await IntegrationsService.getDiagnostics();
    return res.status(200).json({ success: true, data: diagnostics, ...diagnostics });
  };

  static testWebhook = async (req: Request, res: Response) => {
    const { targetUrl = "https://agencyos.io/api/v1/billing/webhook", payload = {}, endpoint = "stripe" } = req.body || {};
    const result = await IntegrationsService.testWebhook(targetUrl, payload);
    return res.status(200).json({
      success: true,
      data: {
        ...result,
        endpoint,
        dispatched: true,
      },
      ...result,
    });
  };
}
