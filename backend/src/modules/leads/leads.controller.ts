import { Request, Response } from "express";
import { LeadsService } from "./leads.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class LeadsController {
  static getLeads = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const result = await LeadsService.getLeads({
      orgId,
      search: req.query.search as string,
      status: req.query.status as string,
      category: req.query.category as string,
      location: req.query.location as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder === "asc" ? 1 : -1,
      page: parseInt((req.query.page as string) || "1", 10),
      limit: parseInt((req.query.limit as string) || "10", 10),
    });

    return res.status(200).json(result);
  };

  static getLeadById = async (req: Request, res: Response) => {
    const leadId = extractId(req.params.leadId);
    const orgId = await resolveOrgId(req);

    const lead = await LeadsService.getLeadById(leadId, orgId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    return res.status(200).json({ lead });
  };

  static createLead = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const lead = await LeadsService.createLead(req.body, orgId);
    return res.status(201).json({ success: true, lead });
  };

  static updateLeadStatus = async (req: Request, res: Response) => {
    const leadId = extractId(req.params.leadId);
    const orgId = await resolveOrgId(req);

    const lead = await LeadsService.updateLeadStatus(leadId, req.body.status, orgId);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    return res.status(200).json({ success: true, lead });
  };

  static runLeadAudit = async (req: Request, res: Response) => {
    const leadId = extractId(req.params.leadId);
    const orgId = await resolveOrgId(req);

    const result = await LeadsService.runLeadAudit(leadId, orgId);
    if (!result) {
      return res.status(404).json({ error: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Autonomous audit executed for ${result.lead.businessName}`,
      lead: result.lead,
      audit: result.audit,
    });
  };

  static convertLeadToClient = async (req: Request, res: Response) => {
    const leadId = extractId(req.params.leadId);
    const orgId = await resolveOrgId(req);

    const result = await LeadsService.convertLeadToClient(leadId, orgId, req.body || {});
    if (!result) {
      return res.status(404).json({ error: "Lead not found" });
    }

    return res.status(201).json({
      success: true,
      ...result,
    });
  };
}
