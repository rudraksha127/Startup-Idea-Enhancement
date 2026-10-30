import { Request, Response } from "express";
import { TemplatesService } from "./templates.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class TemplatesController {
  static listTemplates = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const category = req.query.category as string | undefined;
    const templates = await TemplatesService.listTemplates(orgId, category);
    return res.status(200).json({ success: true, templates });
  };

  static getTemplateById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const template = await TemplatesService.getTemplateById(id, orgId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    return res.status(200).json({ success: true, template });
  };

  static createTemplate = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const template = await TemplatesService.createTemplate(orgId, req.body);
    return res.status(201).json({ success: true, template });
  };

  static applyTemplate = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const { projectName, clientName } = req.body || {};
    const result = await TemplatesService.applyTemplate(id, orgId, projectName, clientName);
    return res.status(200).json({ success: true, ...result });
  };
}

