import { Request, Response } from "express";
import { CampaignsService } from "./campaigns.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class CampaignsController {
  static getCampaigns = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const campaigns = await CampaignsService.getCampaigns(orgId);
    return res.status(200).json({ success: true, data: campaigns, total: campaigns.length });
  };

  static getCampaignById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const campaign = await CampaignsService.getCampaignById(id, orgId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }
    return res.status(200).json({ success: true, data: campaign });
  };

  static createCampaign = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const campaign = await CampaignsService.createCampaign(req.body, orgId);
    return res.status(201).json({ success: true, data: campaign });
  };

  static updateCampaign = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const campaign = await CampaignsService.updateCampaign(id, req.body, orgId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }
    return res.status(200).json({ success: true, data: campaign });
  };

  static deleteCampaign = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const campaign = await CampaignsService.deleteCampaign(id, orgId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }
    return res.status(200).json({ success: true, message: "Campaign deleted" });
  };

  static getOutreachMessages = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const messages = await CampaignsService.getOutreachMessages(orgId);
    return res.status(200).json({ success: true, data: messages, total: messages.length });
  };

  static createOutreachMessage = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const message = await CampaignsService.createOutreachMessage(req.body, orgId);
    return res.status(201).json({ success: true, data: message });
  };
}
