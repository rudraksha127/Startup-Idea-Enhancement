import mongoose from "mongoose";
import { Campaign } from "../../models/Campaign.js";
import { OutreachMessage } from "../../models/OutreachMessage.js";

const DEMO_CAMPAIGNS = [
  {
    _id: "demo-camp-1",
    name: "Indore Cafes & Fine Dining Outreach",
    channel: "Email",
    status: "Active",
    leadsTargeted: 45,
    sentCount: 38,
    openedCount: 24,
    repliedCount: 9,
    convertedCount: 3,
    templateSubject: "Website performance upgrade for {{businessName}}",
    dryRunMode: true,
  },
  {
    _id: "demo-camp-2",
    name: "Dental Clinics Speed Audit Pitch",
    channel: "WhatsApp",
    status: "Active",
    leadsTargeted: 30,
    sentCount: 28,
    openedCount: 22,
    repliedCount: 7,
    convertedCount: 2,
    templateSubject: "Google Core Web Vitals audit for {{businessName}}",
    dryRunMode: true,
  },
];

export class CampaignsService {
  static async getCampaigns(orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return DEMO_CAMPAIGNS;
    }
    return Campaign.find({ organizationId: orgId }).sort({ createdAt: -1 });
  }

  static async getCampaignById(id: string, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return DEMO_CAMPAIGNS.find((c) => c._id === id) || null;
    }
    return Campaign.findOne({ _id: id, organizationId: orgId });
  }

  static async createCampaign(data: Record<string, any>, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: "mock-camp-" + Date.now(),
        organizationId: orgId,
        ...data,
        dryRunMode: data.dryRunMode !== undefined ? data.dryRunMode : true,
      };
    }
    return Campaign.create({
      ...data,
      organizationId: orgId,
      dryRunMode: data.dryRunMode !== undefined ? data.dryRunMode : true,
    });
  }

  static async updateCampaign(id: string, data: Record<string, any>, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return { _id: id, organizationId: orgId, ...data };
    }
    return Campaign.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      data,
      { new: true }
    );
  }

  static async deleteCampaign(id: string, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return { _id: id };
    }
    return Campaign.findOneAndDelete({ _id: id, organizationId: orgId });
  }

  static async getOutreachMessages(orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return [];
    }
    return OutreachMessage.find({ organizationId: orgId }).sort({ createdAt: -1 });
  }

  static async createOutreachMessage(data: Record<string, any>, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: "mock-msg-" + Date.now(),
        organizationId: orgId,
        ...data,
        status: data.dryRun ? "Draft" : (data.status || "Queued"),
      };
    }
    return OutreachMessage.create({
      ...data,
      organizationId: orgId,
      status: data.dryRun ? "Draft" : (data.status || "Queued"),
      sentAt: data.dryRun ? undefined : new Date(),
    });
  }
}
