export const APP_CONFIG = {
  name: "AgencyOS",
  tagline: "Autonomous Agency Operating System",
  version: "1.0.0",
  defaultCurrency: "INR",
  currencySymbol: "₹",
  defaultTimezone: "Asia/Kolkata",
  defaultOrganizationSlug: "agencyos-demo",
  supportEmail: "support@agencyos.in",
  apiPrefix: "/api/v1",
  tokenExpiry: "7d",
  rateLimits: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300,
  },
  aiModels: {
    defaultLeadFinder: "gemini-2.5-flash",
    defaultOutreachWriter: "gemini-2.5-flash",
    defaultAuditor: "gemini-2.5-pro",
  },
  safety: {
    defaultDryRun: true,
    allowGoogleMapsScraping: false,
  },
} as const;

