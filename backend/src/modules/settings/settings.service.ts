import { OrganizationsRepository } from "../../repositories/organizations.repository.js";

export class SettingsService {
  static async getSettings(orgId: string) {
    const org = await OrganizationsRepository.findById(orgId);

    return {
      organization: {
        id: org?.orgId || orgId,
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
        zohoCatalystCloudScale: true,
      },
      notifications: {
        emailAlerts: true,
        weeklyDigest: true,
        highOpportunityLeadFound: true,
      },
      integrations: {
        zohoCatalystConnected: true,
        stripeWebhookConfigured: true,
        n8nWebhookConfigured: true,
        googleMapsConnected: Boolean(process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY),
      },
    };
  }

  static async updateSettings(data: Record<string, any>, orgId: string) {
    if (data.organizationName) {
      await OrganizationsRepository.update(orgId, { name: data.organizationName });
    }
    return this.getSettings(orgId);
  }
}
