export interface BusinessDiscoveryResult {
  name: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  website?: string;
  rating: number;
  reviewCount: number;
  source: string;
}

export interface BusinessDiscoveryProvider {
  searchBusinesses(params: {
    query: string;
    location: string;
    category?: string;
  }): Promise<BusinessDiscoveryResult[]>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode: "live" | "mock";
}

export interface EmailDeliveryProvider {
  sendEmail(params: {
    to: string;
    subject: string;
    body: string;
    from?: string;
  }): Promise<EmailDeliveryResult>;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  pitchAngle: string;
  opportunityScore: number;
  websiteScore: number;
  mode: "live" | "mock";
}

export interface AIResearchProvider {
  analyzeLead(params: {
    businessName: string;
    website?: string;
    category: string;
    location: string;
  }): Promise<AIAnalysisResult>;
}

// -------------------------------------------------------------
// Mock Providers (Active in dev or when API keys are absent)
// -------------------------------------------------------------

export class MockBusinessDiscoveryProvider implements BusinessDiscoveryProvider {
  async searchBusinesses(params: { query: string; location: string; category?: string }): Promise<BusinessDiscoveryResult[]> {
    return [
      {
        name: `${params.query || "Sunrise"} ${params.category || "Cafe"}`,
        category: params.category || "Cafe",
        location: params.location || "New Delhi",
        address: `Block C, ${params.location || "Connaught Place, New Delhi"}`,
        phone: "+91 98765 11223",
        website: "https://example.com",
        rating: 4.4,
        reviewCount: 85,
        source: "Local Search",
      },
    ];
  }
}

export class MockEmailDeliveryProvider implements EmailDeliveryProvider {
  async sendEmail(params: { to: string; subject: string; body: string }): Promise<EmailDeliveryResult> {
    console.log(`[MockEmailDeliveryProvider] Saved email draft to ${params.to}: "${params.subject}"`);
    return {
      success: true,
      messageId: `mock-msg-${Date.now()}`,
      mode: "mock",
    };
  }
}

export class MockAIResearchProvider implements AIResearchProvider {
  async analyzeLead(params: { businessName: string; website?: string; category: string; location: string }): Promise<AIAnalysisResult> {
    return {
      summary: `${params.businessName} has substantial local foot traffic in ${params.location}, but their online visibility and booking infrastructure lag behind top-tier competitors.`,
      strengths: ["Strong regional word-of-mouth reputation", "Prime central commercial district accessibility"],
      weaknesses: ["Mobile page load latency exceeds acceptable thresholds", "No direct transactional digital reservation portal"],
      pitchAngle: `Present a modern, accessible web redesign engineered with Next.js, featuring direct booking to eliminate 3rd party commission fees.`,
      opportunityScore: 88,
      websiteScore: 58,
      mode: "mock",
    };
  }
}

// -------------------------------------------------------------
// Provider Registry
// -------------------------------------------------------------

export class ResendEmailDeliveryProvider implements EmailDeliveryProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail || process.env.RESEND_FROM_EMAIL || "AgencyOS <onboarding@resend.dev>";
  }

  async sendEmail(params: { to: string; subject: string; body: string; from?: string }): Promise<EmailDeliveryResult> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: params.from || this.fromEmail,
          to: [params.to],
          subject: params.subject,
          text: params.body,
        }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) {
        return {
          success: false,
          error: data?.message || `Resend returned HTTP ${res.status}`,
          mode: "live",
        };
      }
      return {
        success: true,
        messageId: data?.id || `resend_${Date.now()}`,
        mode: "live",
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Resend transport error",
        mode: "live",
      };
    }
  }
}

export function getEmailProvider(options?: { dryRun?: boolean }): EmailDeliveryProvider {
  const dryRun = options?.dryRun !== false && process.env.ALLOW_LIVE_EMAIL !== "true";
  const resendKey = process.env.RESEND_API_KEY;
  if (!dryRun && resendKey && resendKey.length > 10 && !resendKey.includes("placeholder")) {
    return new ResendEmailDeliveryProvider(resendKey);
  }
  return new MockEmailDeliveryProvider();
}

export function getAIResearchProvider(): AIResearchProvider {
  // If GEMINI_API_KEY / OPENAI_API_KEY is configured, real provider can be returned here
  return new MockAIResearchProvider();
}

export function getBusinessDiscoveryProvider(): BusinessDiscoveryProvider {
  return new MockBusinessDiscoveryProvider();
}

