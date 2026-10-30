import { describe, it, expect } from "vitest";
import {
  createClientSchema,
  createProjectSchema,
  createCampaignSchema,
  updateSettingsSchema,
} from "@agencyos/validation";
import {
  formatCurrencyINR,
  slugify,
  calculateOpportunityScore,
  maskApiKey,
} from "@agencyos/utils";
import { APP_CONFIG } from "@agencyos/config";

describe("Shared Packages (@agencyos/*)", () => {
  describe("@agencyos/utils", () => {
    it("formats numbers to Indian Rupee currency format", () => {
      expect(formatCurrencyINR(75000)).toBe("₹75,000");
      expect(formatCurrencyINR(1200000)).toBe("₹12,00,000");
    });

    it("generates URL-safe slugs", () => {
      expect(slugify("AgencyOS Digital Studio & HQ")).toBe("agencyos-digital-studio-hq");
      expect(slugify("Indore Restaurants 2026!")).toBe("indore-restaurants-2026");
    });

    it("calculates realistic opportunity scores bounded between 1.0 and 10.0", () => {
      const scoreNoSite = calculateOpportunityScore(4.5, 350, false);
      expect(scoreNoSite).toBe(10.0);

      const scoreWithSite = calculateOpportunityScore(4.5, 50, true);
      expect(scoreWithSite).toBeLessThan(scoreNoSite);
      expect(scoreWithSite).toBeGreaterThanOrEqual(5.0);
    });

    it("masks sensitive API keys leaving prefix and suffix", () => {
      const masked = maskApiKey("sk-live-1234567890abcdef123456");
      expect(masked).toBe("sk-l••••••••3456");
      expect(maskApiKey("short")).toBe("••••••••");
    });
  });

  describe("@agencyos/validation", () => {
    it("validates client creation payload", () => {
      const valid = createClientSchema.safeParse({
        businessName: "Royal Dine",
        contactPerson: "Rajiv",
        email: "rajiv@royaldine.in",
        phone: "+919876543210",
        address: "Vijay Nagar, Indore",
        monthlyRetainer: 50000,
      });
      expect(valid.success).toBe(true);

      const invalid = createClientSchema.safeParse({
        businessName: "R",
        email: "not-an-email",
      });
      expect(invalid.success).toBe(false);
    });

    it("validates campaign creation payload with default dryRunMode", () => {
      const valid = createCampaignSchema.safeParse({
        name: "Indore Cafes Sprint",
        channel: "Email",
        templateSubject: "Modern website for cafe",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.dryRunMode).toBe(true);
      }
    });

    it("validates workspace settings update schema", () => {
      const valid = updateSettingsSchema.safeParse({
        organizationName: "AgencyOS India",
        currency: "INR (₹)",
        timezone: "Asia/Kolkata",
      });
      expect(valid.success).toBe(true);
    });
  });

  describe("@agencyos/config", () => {
    it("exposes application defaults and safety constraints", () => {
      expect(APP_CONFIG.name).toBe("AgencyOS");
      expect(APP_CONFIG.safety.defaultDryRun).toBe(true);
      expect(APP_CONFIG.safety.allowGoogleMapsScraping).toBe(false);
    });
  });
});
