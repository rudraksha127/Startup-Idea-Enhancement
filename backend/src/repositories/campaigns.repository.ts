import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { CampaignRecord, OutreachMessageRecord, ReplyRecord, MeetingRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class CampaignsRepository {
  static async findByOrg(orgId: string): Promise<CampaignRecord[]> {
    return catalystClient.find<CampaignRecord>("Campaigns", { organizationId: orgId });
  }

  static async findById(campaignId: string, orgId?: string): Promise<CampaignRecord | null> {
    const query: Record<string, any> = { campaignId };
    if (orgId) query.organizationId = orgId;
    const camps = await catalystClient.find<CampaignRecord>("Campaigns", query);
    if (camps.length > 0) return camps[0];

    const byRow = await catalystClient.find<CampaignRecord>("Campaigns", orgId ? { ROWID: campaignId, organizationId: orgId } : { ROWID: campaignId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async create(data: Omit<CampaignRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<CampaignRecord> {
    const campaignId = data.campaignId || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<CampaignRecord>("Campaigns", { ...data, campaignId });
  }

  static async update(campaignId: string, orgId: string, data: Partial<CampaignRecord>): Promise<CampaignRecord> {
    return catalystClient.updateRow<CampaignRecord>("Campaigns", campaignId, data);
  }

  static async delete(campaignId: string, orgId: string): Promise<boolean> {
    return catalystClient.deleteRow("Campaigns", campaignId);
  }

  static async findMessages(campaignId: string, orgId: string): Promise<OutreachMessageRecord[]> {
    const filter: Record<string, any> = { organizationId: orgId };
    if (campaignId) filter.campaignId = campaignId;
    return catalystClient.find<OutreachMessageRecord>("OutreachMessages", filter);
  }

  static async createMessage(data: Omit<OutreachMessageRecord, "ROWID" | "createdAt">): Promise<OutreachMessageRecord> {
    const messageId = data.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<OutreachMessageRecord>("OutreachMessages", { ...data, messageId });
  }

  static async findReplies(orgId: string): Promise<ReplyRecord[]> {
    return catalystClient.find<ReplyRecord>("Replies", { organizationId: orgId });
  }

  static async createReply(data: Omit<ReplyRecord, "ROWID">): Promise<ReplyRecord> {
    const replyId = data.replyId || `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<ReplyRecord>("Replies", { ...data, replyId });
  }

  static async findMeetings(orgId: string): Promise<MeetingRecord[]> {
    return catalystClient.find<MeetingRecord>("Meetings", { organizationId: orgId });
  }

  static async createMeeting(data: Omit<MeetingRecord, "ROWID" | "createdAt">): Promise<MeetingRecord> {
    const meetingId = data.meetingId || `meet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<MeetingRecord>("Meetings", { ...data, meetingId });
  }
}
