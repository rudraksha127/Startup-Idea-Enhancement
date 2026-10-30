import { Request, Response } from "express";
import { N8nService } from "./n8n.service.js";
import { resolveOrgId } from "../../common/resolve-org.js";

export class N8nController {
  static handleLeadAuditWebhook = async (req: Request, res: Response) => {
    const result = await N8nService.handleLeadAuditWebhook(req.body);
    return res.status(200).json(result);
  };

  static handleProspectSyncWebhook = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const prospects = req.body.prospects || req.body;
    const result = await N8nService.handleProspectSyncWebhook(orgId, prospects);
    return res.status(200).json(result);
  };

  static triggerWorkflow = async (req: Request, res: Response) => {
    const workflow = Array.isArray(req.params.workflow)
      ? req.params.workflow[0]
      : (req.params.workflow as string);
    const result = await N8nService.triggerWorkflow(workflow, req.body);
    return res.status(200).json(result);
  };

  static getSyncStatus = async (req: Request, res: Response) => {
    const status = await N8nService.getSyncStatus();
    return res.status(200).json(status);
  };
}
