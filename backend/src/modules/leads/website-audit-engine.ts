export class UnsafeAuditUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeAuditUrlError";
  }
}

export interface BackendAuditOutput {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  mobileScore: number;
  overallScore: number;
  opportunityScore: number;
  detectedTech: string;
  dataMode: "live_html" | "no_website" | "unreachable";
  issues: Array<{ type: "critical" | "warning" | "passed"; title: string; detail: string }>;
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal" ||
    !host.includes(".") ||
    /^\d+$/.test(host) ||
    /^0x[0-9a-f]+$/i.test(host)
  ) {
    return true;
  }
  if (host.includes(":")) {
    return (
      host === "::1" ||
      host === "::" ||
      host.startsWith("fc") ||
      host.startsWith("fd") ||
      host.startsWith("fe80")
    );
  }
  const parts = host.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p))) {
    const [a, b] = parts.map(Number);
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    ) {
      return true;
    }
  }
  return false;
}

export function validateAuditUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim();
  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new UnsafeAuditUrlError(`Malformed URL: ${rawUrl}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeAuditUrlError(`Unsupported protocol: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password || isPrivateHost(parsed.hostname)) {
    throw new UnsafeAuditUrlError(`Blocked unsafe or internal target host: ${parsed.hostname}`);
  }
  return parsed;
}

export async function runBackendWebsiteAudit(params: {
  website?: string;
  rating?: number;
  reviewCount?: number;
}): Promise<BackendAuditOutput> {
  const rawUrl = (params.website || "").trim();
  if (!rawUrl) {
    return {
      performanceScore: 0,
      seoScore: 0,
      accessibilityScore: 0,
      mobileScore: 0,
      overallScore: 0,
      opportunityScore: 95,
      detectedTech: "None (No Website Configured)",
      dataMode: "no_website",
      issues: [
        {
          type: "critical",
          title: "No Website URL Configured",
          detail: "Prospect has no website configured; greenfield website creation recommended.",
        },
      ],
    };
  }

  let targetUrl = validateAuditUrl(rawUrl);
  const start = Date.now();
  try {
    let res: Response | null = null;
    for (let hop = 0; hop <= 3; hop++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      try {
        res = await fetch(targetUrl.toString(), {
          method: "GET",
          redirect: "manual",
          signal: controller.signal,
          headers: { "User-Agent": "AgencyOS-AuditBot/1.0" },
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        targetUrl = validateAuditUrl(new URL(location, targetUrl).toString());
        continue;
      }
      break;
    }

    if (!res || res.status >= 500) {
      throw new Error(`HTTP ${res?.status ?? "unreachable"}`);
    }

    const ttfbMs = Date.now() - start;
    const html = (await res.text()).slice(0, 512 * 1024);
    const lower = html.toLowerCase();

    const hasHttps = targetUrl.protocol === "https:";
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasTitle = /<title[^>]*>[\s\S]*?<\/title>/i.test(html);
    const hasDescription = /<meta[^>]+name=["']description["']/i.test(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    const hasSchema = lower.includes("application/ld+json");

    const tech: string[] = [];
    if (lower.includes("/_next/static")) tech.push("Next.js");
    if (lower.includes("wp-content")) tech.push("WordPress");
    if (lower.includes("cdn.shopify.com")) tech.push("Shopify");
    if (lower.includes("jquery")) tech.push("jQuery");
    if (tech.length === 0) tech.push("Custom HTML");

    const performanceScore = Math.max(15, Math.min(100, 100 - Math.round(ttfbMs / 40)));
    const seoScore = (hasTitle ? 30 : 0) + (hasDescription ? 25 : 0) + (hasH1 ? 25 : 0) + (hasSchema ? 20 : 0);
    const mobileScore = hasViewport ? Math.round(performanceScore * 0.5 + 50) : Math.max(20, Math.round(performanceScore * 0.45));
    const accessibilityScore = (hasTitle ? 35 : 10) + (hasH1 ? 35 : 10) + (hasViewport ? 30 : 0);
    const securityScore = hasHttps ? 80 : 15;
    const overallScore = Math.round(performanceScore * 0.3 + seoScore * 0.25 + mobileScore * 0.2 + securityScore * 0.15 + accessibilityScore * 0.1);
    const opportunityScore = Math.max(20, Math.min(98, 100 - overallScore + ((params.reviewCount || 0) >= 100 ? 12 : 5)));

    const issues: BackendAuditOutput["issues"] = [
      hasHttps
        ? { type: "passed", title: "HTTPS / TLS Active", detail: "Secure TLS transport verified." }
        : { type: "critical", title: "Missing HTTPS Encryption", detail: "Site serves over insecure HTTP." },
    ];
    if (!hasViewport) {
      issues.push({ type: "critical", title: "Missing Mobile Viewport Meta Tag", detail: "Mobile layout scaling tag not detected." });
    }
    if (!hasSchema) {
      issues.push({ type: "warning", title: "Missing LocalBusiness JSON-LD Schema", detail: "Structured schema markup missing from page source." });
    }

    return {
      performanceScore,
      seoScore,
      accessibilityScore,
      mobileScore,
      overallScore,
      opportunityScore,
      detectedTech: tech.join(", "),
      dataMode: "live_html",
      issues,
    };
  } catch (err: unknown) {
    if (err instanceof UnsafeAuditUrlError) throw err;
    const reason = err instanceof Error ? err.message : "Origin unreachable";
    return {
      performanceScore: 0,
      seoScore: 0,
      accessibilityScore: 0,
      mobileScore: 0,
      overallScore: 0,
      opportunityScore: 90,
      detectedTech: "Unreachable",
      dataMode: "unreachable",
      issues: [
        {
          type: "critical",
          title: "Website Unreachable",
          detail: `Live fetch failed (${reason}).`,
        },
      ],
    };
  }
}
