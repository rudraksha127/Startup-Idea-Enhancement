import mongoose from "mongoose";
import { Organization } from "../../models/Organization.js";

export class SettingsService {
  static async getSettings(orgId: string) {
    let org = null;
    if (mongoose.connection.readyState === 1) {
      try {
        org = await Organization.findById(orgId);
      } catch {
        org = null;
      }
    }

    return {
      organization: {
        id: org?._id?.toString() || orgId,
        name: org?.name || "AgencyOS Pro",
        slug: org?.slug || "agencyos-demo",
        plan: org?.plan || "Pro",
        credits: org?.credits ?? 250,
      },
      compliance: {
        dpdpActCompliant: true,
        traiOptOutHonored: true,
        noGoogleMapsScraping: true,
        defaultDryRun: true,
      },
      notifications: {
        emailAlerts: true,
        weeklyDigest: true,
        highOpportunityLeadFound: true,
      },
      integrations: {
        smtpConfigured: true,
        whatsappBusinessConnected: false,
        n8nWebhookConfigured: true,
      },
    };
  }

  static async updateSettings(data: Record<string, any>, orgId: string) {
    if (data.organizationName && mongoose.connection.readyState === 1) {
      await Organization.findByIdAndUpdate(orgId, { name: data.organizationName });
    }
    return this.getSettings(orgId);
  }
}
