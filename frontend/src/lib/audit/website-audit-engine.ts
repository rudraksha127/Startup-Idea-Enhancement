export type AuditDataMode = "live_pagespeed" | "live_html" | "no_website" | "unreachable";

export interface AuditIssueItem {
  type: "critical" | "warning" | "passed";
  title: string;
  detail: string;
}

export interface RealWebsiteAuditReport {
  url: string;
  normalizedUrl: string;
  auditedAt: string;
  dataMode: AuditDataMode;
  httpStatus?: number;
  reachable: boolean;
  error?: string;
  overallScore: number;
  opportunityScore: number; // 0 - 100
  performanceScores: {
    website: number;
    seo: number;
    performance: number;
    mobile: number;
    accessibility: number;
    security: number;
  };
  metrics: {
    lcp: string;
    fcp: string;
    cls: string;
    fid: string;
    ttfbMs: number;
    htmlBytes: number;
  };
  detectedTech: string[];
  signals: {
    hasHttps: boolean;
    hasHsts: boolean;
    hasCsp: boolean;
    hasViewportMeta: boolean;
    hasTitle: boolean;
    hasMetaDescription: boolean;
    hasH1: boolean;
    hasCanonical: boolean;
    hasOpenGraph: boolean;
    hasLocalBusinessSchema: boolean;
    hasLeadCaptureOrBooking: boolean;
    imageCount: number;
    imagesWithoutAlt: number;
  };
  issues: AuditIssueItem[];
  actionPlan: Array<{
    phase: string;
    title: string;
    description: string;
    timeEstimate: string;
  }>;
  aiInsights: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    pitchAngle: string;
  };
}

export class UnsafeAuditUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeAuditUrlError";
  }
}

function isPrivateOrReservedIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4 || !parts.every((p) => /^\d{1,3}$/.test(p))) {
    return false;
  }
  const nums = parts.map(Number);
  if (nums.some((n) => n < 0 || n > 255)) return true;

  const [a, b] = nums;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // AWS/GCP/Azure IMDS link-local
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

function isPrivateOrReservedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) return true;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".localdomain") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }
  if (/^\d+$/.test(host) || /^0x[0-9a-f]+$/i.test(host)) {
    return true; // Reject integer/hex IP encodings
  }
  if (host.includes(":")) {
    // IPv6 literal checks: loopback (::1), unspecified (::), ULA (fc/fd), link-local (fe80)
    if (
      host === "::1" ||
      host === "::" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe80") ||
      host.startsWith("::ffff:127.") ||
      host.startsWith("::ffff:10.") ||
      host.startsWith("::ffff:169.254.") ||
      host.startsWith("::ffff:192.168.")
    ) {
      return true;
    }
  }
  if (isPrivateOrReservedIpv4(host)) return true;
  if (!host.includes(".")) return true; // Reject single-label internal service names
  return false;
}

/**
 * Validates and normalizes an external website URL while blocking SSRF targets.
 */
export function validatePublicAuditUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new UnsafeAuditUrlError("Website URL is empty");
  }
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new UnsafeAuditUrlError(`Malformed URL: ${rawUrl}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeAuditUrlError(`Unsupported URL protocol: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new UnsafeAuditUrlError("Embedded credentials in URL are not permitted");
  }
  if (isPrivateOrReservedHost(parsed.hostname)) {
    throw new UnsafeAuditUrlError(`Blocked private or internal host: ${parsed.hostname}`);
  }

  return parsed;
}

async function fetchWithSsrfRedirectGuard(
  initialUrl: URL,
  timeoutMs = 7000
): Promise<{ response: Response; finalUrl: URL; ttfbMs: number }> {
  let currentUrl = initialUrl;
  const start = Date.now();

  for (let hop = 0; hop <= 3; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(currentUrl.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "AgencyOS-AuditBot/1.0 (+https://agencyos.ai)",
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) {
          return { response: res, finalUrl: currentUrl, ttfbMs: Date.now() - start };
        }
        const resolvedNext = new URL(location, currentUrl);
        currentUrl = validatePublicAuditUrl(resolvedNext.toString());
        continue;
      }

      return { response: res, finalUrl: currentUrl, ttfbMs: Date.now() - start };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("Exceeded maximum redirect hops during website audit");
}

function detectTechStack(html: string, headers: Headers): string[] {
  const stack = new Set<string>();
  const lower = html.toLowerCase();
  const poweredBy = (headers.get("x-powered-by") || "").toLowerCase();
  const server = (headers.get("server") || "").toLowerCase();

  if (lower.includes("/_next/static") || poweredBy.includes("next.js")) stack.add("Next.js");
  if (lower.includes("wp-content") || lower.includes("wp-includes")) stack.add("WordPress");
  if (lower.includes("cdn.shopify.com")) stack.add("Shopify");
  if (lower.includes("wixstatic.com")) stack.add("Wix");
  if (lower.includes("webflow")) stack.add("Webflow");
  if (lower.includes("jquery")) stack.add("jQuery");
  if (lower.includes("tailwindcss") || lower.includes("tailwind")) stack.add("Tailwind CSS");
  if (server.includes("cloudflare")) stack.add("Cloudflare");
  if (server.includes("nginx")) stack.add("Nginx");
  if (server.includes("vercel")) stack.add("Vercel");
  return Array.from(stack);
}

interface PageSpeedResult {
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  lcp?: string;
  fcp?: string;
  cls?: string;
  fid?: string;
}

async function fetchPageSpeedInsights(targetUrl: string): Promise<PageSpeedResult | null> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey || apiKey.includes("placeholder")) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    endpoint.searchParams.set("url", targetUrl);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.append("category", "performance");
    endpoint.searchParams.append("category", "seo");
    endpoint.searchParams.append("category", "accessibility");
    endpoint.searchParams.set("key", apiKey);

    const res = await fetch(endpoint.toString(), { signal: controller.signal });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const categories = data.lighthouseResult?.categories;
    const audits = data.lighthouseResult?.audits;

    return {
      performanceScore:
        typeof categories?.performance?.score === "number"
          ? Math.round(categories.performance.score * 100)
          : undefined,
      seoScore:
        typeof categories?.seo?.score === "number"
          ? Math.round(categories.seo.score * 100)
          : undefined,
      accessibilityScore:
        typeof categories?.accessibility?.score === "number"
          ? Math.round(categories.accessibility.score * 100)
          : undefined,
      lcp: audits?.["largest-contentful-paint"]?.displayValue,
      fcp: audits?.["first-contentful-paint"]?.displayValue,
      cls: audits?.["cumulative-layout-shift"]?.displayValue,
      fid: audits?.["total-blocking-time"]?.displayValue,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildCommercialInsights(params: {
  businessName: string;
  category: string;
  rating?: number;
  websiteScore: number;
  issues: AuditIssueItem[];
  hasWebsite: boolean;
  hasBooking: boolean;
  hasViewport: boolean;
  hasSchema: boolean;
  hasHttps: boolean;
}) {
  const criticals = params.issues.filter((i) => i.type === "critical");
  const warnings = params.issues.filter((i) => i.type === "warning");
  const catLower = (params.category || "").toLowerCase();
  const isRestaurant = catLower.includes("restaurant") || catLower.includes("cafe");
  const isClinic = catLower.includes("clinic") || catLower.includes("dental") || catLower.includes("health");

  const strengths: string[] = [];
  if (params.hasHttps) strengths.push("Active HTTPS/TLS transport security detected");
  if (params.hasViewport) strengths.push("Mobile viewport meta tag configured");
  if (params.hasSchema) strengths.push("Structured Schema.org LocalBusiness metadata present");
  if (params.hasBooking) strengths.push("Direct booking or WhatsApp customer inquiry path present");
  if ((params.rating || 0) >= 4.0) {
    strengths.push(`Strong Google Maps rating (${params.rating}★) supports conversion ROI`);
  }
  if (strengths.length === 0) {
    strengths.push("Established local category demand creates clear modernization upside");
  }

  const weaknesses = [...criticals, ...warnings].map((i) => `${i.title}: ${i.detail}`).slice(0, 4);

  const pitchAngle = !params.hasWebsite
    ? `${params.businessName} has no verified website online. Offer a fast, mobile-first Next.js site with direct WhatsApp lead capture to convert local search traffic.`
    : isRestaurant
    ? `Resolve ${criticals.length} critical mobile/UX bottlenecks for ${params.businessName} and add direct table booking + WhatsApp ordering to reduce aggregator commissions.`
    : isClinic
    ? `Modernize ${params.businessName}'s website (score ${params.websiteScore}/100) with instant online appointment scheduling and LocalBusiness schema.`
    : `Fix ${criticals.length + warnings.length} verified SEO, speed, and conversion gaps on ${params.businessName}'s site to lift organic inquiries.`;

  const actionPlan: RealWebsiteAuditReport["actionPlan"] = [];
  if (!params.hasHttps || !params.hasWebsite) {
    actionPlan.push({
      phase: "Immediate (Day 1-3)",
      title: params.hasWebsite ? "Enforce HTTPS & Security Headers" : "Launch SSL-Secured Responsive Foundation",
      description: params.hasWebsite
        ? "Enable TLS redirect and Strict-Transport-Security headers so browsers trust the domain."
        : "Provision a fast Next.js site on HTTPS with verified domain DNS and mobile-first layout.",
      timeEstimate: "2-3 days",
    });
  }
  if (!params.hasViewport || criticals.length > 0) {
    actionPlan.push({
      phase: "Phase 1 (Week 1)",
      title: "Core Web Vitals & Mobile Optimization",
      description: "Eliminate render-blocking assets, compress images to WebP/AVIF, and ensure viewport meta sizing.",
      timeEstimate: "3-5 days",
    });
  }
  if (!params.hasBooking) {
    actionPlan.push({
      phase: "Phase 1 (Week 1)",
      title: isRestaurant ? "Commission-Free Table Booking & WhatsApp CTA" : "Direct Lead Capture / Appointment Funnel",
      description: "Add above-the-fold inquiry form and one-tap WhatsApp deep link so mobile visitors convert immediately.",
      timeEstimate: "3 days",
    });
  }
  if (!params.hasSchema) {
    actionPlan.push({
      phase: "Phase 2 (Week 2)",
      title: "Local SEO & JSON-LD Schema Markup",
      description: "Inject Schema.org LocalBusiness JSON-LD, canonical link, and Open Graph metadata.",
      timeEstimate: "2 days",
    });
  }

  return {
    summary: params.hasWebsite
      ? `Live technical audit completed for ${params.businessName} (Website Score: ${params.websiteScore}/100, ${criticals.length} critical, ${warnings.length} warnings).`
      : `${params.businessName} currently has no website configured — prime high-opportunity candidate for a greenfield build.`,
    strengths,
    weaknesses,
    pitchAngle,
    actionPlan,
  };
}

/**
 * Executes a deterministic, SSRF-safe live website audit (HTML + headers + optional Google PageSpeed Insights v5).
 */
export async function runRealWebsiteAudit(params: {
  url?: string;
  businessName?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}): Promise<RealWebsiteAuditReport> {
  const auditedAt = new Date().toISOString();
  const businessName = (params.businessName || "Target Business").trim();
  const category = (params.category || "Local Business").trim();
  const rawUrl = (params.url || "").trim();

  if (!rawUrl) {
    const emptyIssues: AuditIssueItem[] = [
      {
        type: "critical",
        title: "No Website URL Configured",
        detail: "This business currently has no website listed; customers cannot inspect offerings or book online.",
      },
      {
        type: "warning",
        title: "No Automated Digital Lead Capture",
        detail: "Add a fast mobile landing page with WhatsApp and inquiry capture to monetize local searchers.",
      },
    ];
    const insights = buildCommercialInsights({
      businessName,
      category,
      rating: params.rating,
      websiteScore: 0,
      issues: emptyIssues,
      hasWebsite: false,
      hasBooking: false,
      hasViewport: false,
      hasSchema: false,
      hasHttps: false,
    });
    return {
      url: "",
      normalizedUrl: "",
      auditedAt,
      dataMode: "no_website",
      reachable: false,
      overallScore: 0,
      opportunityScore: 95,
      performanceScores: {
        website: 0,
        seo: 0,
        performance: 0,
        mobile: 0,
        accessibility: 0,
        security: 0,
      },
      metrics: {
        lcp: "N/A",
        fcp: "N/A",
        cls: "N/A",
        fid: "N/A",
        ttfbMs: 0,
        htmlBytes: 0,
      },
      detectedTech: [],
      signals: {
        hasHttps: false,
        hasHsts: false,
        hasCsp: false,
        hasViewportMeta: false,
        hasTitle: false,
        hasMetaDescription: false,
        hasH1: false,
        hasCanonical: false,
        hasOpenGraph: false,
        hasLocalBusinessSchema: false,
        hasLeadCaptureOrBooking: false,
        imageCount: 0,
        imagesWithoutAlt: 0,
      },
      issues: emptyIssues,
      actionPlan: insights.actionPlan,
      aiInsights: {
        summary: insights.summary,
        strengths: insights.strengths,
        weaknesses: insights.weaknesses,
        pitchAngle: insights.pitchAngle,
      },
    };
  }

  // Validates against SSRF before performing any network I/O
  const validatedUrl = validatePublicAuditUrl(rawUrl);

  try {
    const { response, finalUrl, ttfbMs } = await fetchWithSsrfRedirectGuard(validatedUrl);
    if (!response.ok && response.status >= 500) {
      throw new Error(`Origin returned HTTP ${response.status}`);
    }

    const rawText = await response.text();
    const html = rawText.slice(0, 512 * 1024);
    const htmlBytes = Buffer.byteLength(rawText, "utf8");
    const lowerHtml = html.toLowerCase();

    const hasHttps = finalUrl.protocol === "https:";
    const hasHsts = Boolean(response.headers.get("strict-transport-security"));
    const hasCsp = Boolean(response.headers.get("content-security-policy"));
    const hasXfo = Boolean(response.headers.get("x-frame-options"));

    const hasViewportMeta = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const hasTitle = Boolean(titleMatch && titleMatch[1].trim().length > 2);
    const hasMetaDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
    const hasOpenGraph = /property=["']og:(title|image|description)["']/i.test(html);
    const hasLocalBusinessSchema =
      lowerHtml.includes("application/ld+json") &&
      /(localbusiness|restaurant|cafeorcoffeeshop|medicalclinic|dentist|beautysalon|healthclub|hotel|organization)/i.test(
        lowerHtml
      );
    const hasLeadCaptureOrBooking =
      /<form[\s>]/i.test(html) ||
      /(wa\.me|api\.whatsapp\.com|calendly\.com|cal\.com|tel:|book\s*(now|appointment|table)|reserve\s*(table|now))/i.test(
        lowerHtml
      );

    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    const imagesWithoutAlt = imgTags.filter((tag) => !/\balt=["'][^"']*["']/i.test(tag)).length;

    const psi = await fetchPageSpeedInsights(finalUrl.toString());

    // Deterministic scoring grounded directly in measured telemetry
    let security = (hasHttps ? 55 : 10) + (hasHsts ? 15 : 0) + (hasCsp ? 15 : 0) + (hasXfo ? 15 : 0);
    security = Math.min(100, security);

    const seoHeuristic =
      (hasTitle ? 25 : 0) +
      (hasMetaDescription ? 20 : 0) +
      (hasH1 ? 15 : 0) +
      (hasCanonical ? 15 : 0) +
      (hasOpenGraph ? 10 : 0) +
      (hasLocalBusinessSchema ? 15 : 0);
    const seo = psi?.seoScore ?? seoHeuristic;

    const perfHeuristic = Math.max(
      15,
      Math.min(
        100,
        100 -
          Math.round(ttfbMs / 40) -
          (htmlBytes > 250_000 ? 15 : 0) -
          (lowerHtml.includes("jquery") ? 10 : 0)
      )
    );
    const performance = psi?.performanceScore ?? perfHeuristic;

    const mobile = hasViewportMeta ? Math.round(performance * 0.5 + 50) : Math.max(20, Math.round(performance * 0.45));

    const altRatio = imgTags.length > 0 ? (imgTags.length - imagesWithoutAlt) / imgTags.length : 1;
    const accessibilityHeuristic = Math.round(
      (hasH1 ? 30 : 10) + (hasTitle ? 20 : 0) + (hasViewportMeta ? 20 : 0) + altRatio * 30
    );
    const accessibility = psi?.accessibilityScore ?? accessibilityHeuristic;

    const overallScore = Math.round(
      performance * 0.3 + seo * 0.25 + mobile * 0.2 + security * 0.15 + accessibility * 0.1
    );

    const issues: AuditIssueItem[] = [];
    if (!hasHttps) {
      issues.push({
        type: "critical",
        title: "Missing HTTPS / SSL Encryption",
        detail: "Website resolves over insecure HTTP without automatic TLS upgrade.",
      });
    } else {
      issues.push({
        type: "passed",
        title: "HTTPS / TLS Encryption Active",
        detail: "Verified secure HTTPS response from target origin.",
      });
    }

    if (!hasViewportMeta) {
      issues.push({
        type: "critical",
        title: "Missing Mobile Viewport Meta Tag",
        detail: "No <meta name=\"viewport\"> tag found; layout is not optimized for mobile viewports.",
      });
    }
    if (ttfbMs > 1200 || (psi?.performanceScore !== undefined && psi.performanceScore < 60)) {
      issues.push({
        type: "critical",
        title: `Slow Origin Response / Performance (TTFB ${ttfbMs}ms)`,
        detail: psi?.lcp
          ? `Mobile Lighthouse Performance ${performance}/100 with LCP ${psi.lcp}.`
          : `Initial server response took ${ttfbMs}ms (${Math.round(htmlBytes / 1024)} KB HTML payload).`,
      });
    }
    if (!hasLocalBusinessSchema) {
      issues.push({
        type: "warning",
        title: "Missing Schema.org LocalBusiness JSON-LD",
        detail: "No LocalBusiness/Category structured data found in page markup.",
      });
    }
    if (!hasMetaDescription || !hasTitle) {
      issues.push({
        type: "warning",
        title: "Incomplete Core SEO Meta Tags",
        detail: `${!hasTitle ? "Missing <title>. " : ""}${!hasMetaDescription ? "Missing meta description." : ""}`.trim(),
      });
    }
    if (!hasLeadCaptureOrBooking) {
      issues.push({
        type: "warning",
        title: "No Direct Booking or WhatsApp Lead Capture",
        detail: "Could not detect an HTML inquiry form, WhatsApp link, or appointment booking CTA.",
      });
    }
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: "warning",
        title: `${imagesWithoutAlt} Image(s) Missing Alt Attributes`,
        detail: "Missing alt text reduces screen-reader accessibility and local image SEO indexing.",
      });
    }

    const oppBonus = (params.reviewCount || 0) >= 100 || (params.rating || 0) >= 4.2 ? 12 : 5;
    const opportunityScore = Math.max(20, Math.min(98, 100 - overallScore + oppBonus));

    const insights = buildCommercialInsights({
      businessName,
      category,
      rating: params.rating,
      websiteScore: overallScore,
      issues,
      hasWebsite: true,
      hasBooking: hasLeadCaptureOrBooking,
      hasViewport: hasViewportMeta,
      hasSchema: hasLocalBusinessSchema,
      hasHttps,
    });

    return {
      url: rawUrl,
      normalizedUrl: finalUrl.toString(),
      auditedAt,
      dataMode: psi ? "live_pagespeed" : "live_html",
      httpStatus: response.status,
      reachable: true,
      overallScore,
      opportunityScore,
      performanceScores: {
        website: overallScore,
        seo,
        performance,
        mobile,
        accessibility,
        security,
      },
      metrics: {
        lcp: psi?.lcp || `${Math.max(0.8, (ttfbMs / 1000) * 1.8).toFixed(1)}s (est. from TTFB)`,
        fcp: psi?.fcp || `${Math.max(0.4, (ttfbMs / 1000) * 1.1).toFixed(1)}s (est. from TTFB)`,
        cls: psi?.cls || "Measured via PSI only",
        fid: psi?.fid || `${ttfbMs}ms TTFB`,
        ttfbMs,
        htmlBytes,
      },
      detectedTech: detectTechStack(html, response.headers),
      signals: {
        hasHttps,
        hasHsts,
        hasCsp,
        hasViewportMeta,
        hasTitle,
        hasMetaDescription,
        hasH1,
        hasCanonical,
        hasOpenGraph,
        hasLocalBusinessSchema,
        hasLeadCaptureOrBooking,
        imageCount: imgTags.length,
        imagesWithoutAlt,
      },
      issues,
      actionPlan: insights.actionPlan,
      aiInsights: {
        summary: insights.summary,
        strengths: insights.strengths,
        weaknesses: insights.weaknesses,
        pitchAngle: insights.pitchAngle,
      },
    };
  } catch (err: unknown) {
    if (err instanceof UnsafeAuditUrlError) {
      throw err;
    }
    const reason = err instanceof Error ? err.message : "Network connection failed";
    const unreachableIssues: AuditIssueItem[] = [
      {
        type: "critical",
        title: "Website Unreachable During Live Audit",
        detail: `Target URL could not be reached (${reason}).`,
      },
    ];
    return {
      url: rawUrl,
      normalizedUrl: validatedUrl.toString(),
      auditedAt,
      dataMode: "unreachable",
      reachable: false,
      error: reason,
      overallScore: 0,
      opportunityScore: 90,
      performanceScores: {
        website: 0,
        seo: 0,
        performance: 0,
        mobile: 0,
        accessibility: 0,
        security: 0,
      },
      metrics: {
        lcp: "Unreachable",
        fcp: "Unreachable",
        cls: "Unreachable",
        fid: "Unreachable",
        ttfbMs: 0,
        htmlBytes: 0,
      },
      detectedTech: [],
      signals: {
        hasHttps: validatedUrl.protocol === "https:",
        hasHsts: false,
        hasCsp: false,
        hasViewportMeta: false,
        hasTitle: false,
        hasMetaDescription: false,
        hasH1: false,
        hasCanonical: false,
        hasOpenGraph: false,
        hasLocalBusinessSchema: false,
        hasLeadCaptureOrBooking: false,
        imageCount: 0,
        imagesWithoutAlt: 0,
      },
      issues: unreachableIssues,
      actionPlan: [
        {
          phase: "Immediate (Day 1)",
          title: "Restore Live Hosting & DNS Reliability",
          description: `Resolve origin outage (${reason}) before directing customers to the website.`,
          timeEstimate: "1-2 days",
        },
      ],
      aiInsights: {
        summary: `Live audit attempted for ${businessName}, but ${validatedUrl.toString()} was unreachable (${reason}).`,
        strengths: ["Clear recovery angle: restoring website uptime builds immediate client trust"],
        weaknesses: [`Origin unreachable (${reason})`],
        pitchAngle: `${businessName}'s listed website failed to respond during automated check (${reason}). Offer managed Cloudflare hosting and reliability rebuild.`,
      },
    };
  }
}
