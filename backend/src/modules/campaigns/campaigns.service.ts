import { CampaignsRepository } from "../../repositories/campaigns.repository.js";
import { CampaignRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class CampaignsService {
  static async getCampaigns(orgId: string): Promise<CampaignRecord[]> {
    return CampaignsRepository.findByOrg(orgId);
  }

  static async getCampaignById(id: string, orgId: string): Promise<CampaignRecord | null> {
    return CampaignsRepository.findById(id, orgId);
  }

  static async createCampaign(data: Record<string, any>, orgId: string): Promise<CampaignRecord> {
    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return CampaignsRepository.create({
      campaignId,
      organizationId: orgId,
      name: data.name || "Outreach Campaign",
      service: data.service || "Web Design & Speed Optimization",
      channel: data.channel || "Email",
      audience: data.audience || "Local Businesses",
      status: data.status || "Active",
      sentCount: data.sentCount || 0,
      openRate: data.openRate || 0,
      replyRate: data.replyRate || 0,
      meetingCount: data.meetingCount || 0,
      leadsTargeted: data.leadsTargeted || 0,
      openedCount: data.openedCount || 0,
      repliedCount: data.repliedCount || 0,
      convertedCount: data.convertedCount || 0,
      templateSubject: data.templateSubject,
      dryRunMode: data.dryRunMode !== undefined ? data.dryRunMode : true,
    });
  }

  static async updateCampaign(id: string, data: Record<string, any>, orgId: string): Promise<CampaignRecord | null> {
    const campaign = await CampaignsRepository.findById(id, orgId);
    if (!campaign) return null;
    return CampaignsRepository.update(campaign.campaignId, orgId, data);
  }

  static async deleteCampaign(id: string, orgId: string): Promise<boolean> {
    const campaign = await CampaignsRepository.findById(id, orgId);
    if (!campaign) return false;
    return CampaignsRepository.delete(campaign.campaignId, orgId);
  }

  static async getCampaignMessages(campaignId: string, orgId: string) {
    return CampaignsRepository.findMessages(campaignId, orgId);
  }

  static async getOutreachMessages(orgId: string, campaignId?: string) {
    return CampaignsRepository.findMessages(campaignId || "", orgId);
  }

  static async createOutreachMessage(data: Record<string, any>, orgId: string) {
    return CampaignsRepository.createMessage({
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId: data.campaignId || "default",
      leadId: data.leadId || "unassigned",
      organizationId: orgId,
      channel: data.channel || "Email",
      subject: data.subject || "Website Performance Audit",
      body: data.body || "",
      status: data.dryRunMode !== false ? "Draft" : "Queued",
    });
  }

  static async createCampaignMessage(campaignId: string, data: Record<string, any>, orgId: string) {
    return CampaignsRepository.createMessage({
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      campaignId,
      leadId: data.leadId || "unassigned",
      organizationId: orgId,
      channel: data.channel || "Email",
      subject: data.subject || "Website Performance Audit",
      body: data.body || "",
      status: data.dryRunMode ? "Draft" : "Queued",
    });
  }
}
