import { describe, it, expect, vi, afterEach } from "vitest";
import {
  validatePublicAuditUrl,
  runRealWebsiteAudit,
  UnsafeAuditUrlError,
} from "@/lib/audit/website-audit-engine";
import {
  validateAuditUrl,
  runBackendWebsiteAudit,
  UnsafeAuditUrlError as BackendUnsafeUrlError,
} from "../../backend/src/modules/leads/website-audit-engine.js";

describe("Website Audit Engine & SSRF Guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.PAGESPEED_API_KEY;
  });

  it("blocks SSRF private/loopback/metadata/non-http targets on both frontend and backend validators", () => {
    const unsafeUrls = [
      "http://localhost:3000/admin",
      "http://127.0.0.1:8080",
      "http://169.254.169.254/latest/meta-data/",
      "http://10.0.0.8/internal",
      "http://172.16.0.1/status",
      "http://192.168.1.50/",
      "http://[::1]/",
      "http://redis:6379",
      "ftp://files.example.com/data",
      "file:///etc/passwd",
      "https://user:secret@example.com",
    ];

    for (const url of unsafeUrls) {
      expect(() => validatePublicAuditUrl(url)).toThrow(UnsafeAuditUrlError);
      expect(() => validateAuditUrl(url)).toThrow(BackendUnsafeUrlError);
    }
  });

  it("returns honest zero-score no_website telemetry when website URL is empty", async () => {
    const report = await runRealWebsiteAudit({
      url: "",
      businessName: "Greenfield Bakery",
      category: "Cafe",
    });

    expect(report.dataMode).toBe("no_website");
    expect(report.reachable).toBe(false);
    expect(report.overallScore).toBe(0);
    expect(report.performanceScores.performance).toBe(0);
    expect(report.metrics.lcp).toBe("N/A");
    expect(report.opportunityScore).toBe(95);

    const backendReport = await runBackendWebsiteAudit({ website: "" });
    expect(backendReport.dataMode).toBe("no_website");
    expect(backendReport.performanceScore).toBe(0);
  });

  it("analyzes HTML, security headers, Schema.org JSON-LD, and booking signals deterministically", async () => {
    const sampleHtml = `
      <!doctype html>
      <html>
        <head>
          <title>Modern Diner — Direct Table Booking</title>
          <meta name="description" content="Fresh artisanal cuisine with instant online table booking." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="canonical" href="https://moderndiner.example.org/" />
          <meta property="og:title" content="Modern Diner" />
          <script src="/_next/static/chunks/main.js"></script>
          <script type="application/ld+json">{"@type":"Restaurant","name":"Modern Diner"}</script>
        </head>
        <body>
          <h1>Modern Diner</h1>
          <img src="/hero.webp" alt="Interior" />
          <a href="https://wa.me/919999999999">Book via WhatsApp</a>
        </body>
      </html>
    `;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(sampleHtml, {
          status: 200,
          headers: {
            "strict-transport-security": "max-age=31536000",
            "content-security-policy": "default-src 'self'",
            "x-frame-options": "DENY",
            server: "cloudflare",
          },
        })
      )
    );

    const report = await runRealWebsiteAudit({
      url: "https://moderndiner.example.org",
      businessName: "Modern Diner",
      category: "Restaurant",
      rating: 4.6,
      reviewCount: 320,
    });

    expect(report.dataMode).toBe("live_html");
    expect(report.reachable).toBe(true);
    expect(report.overallScore).toBeGreaterThan(70);
    expect(report.performanceScores.security).toBe(100);
    expect(report.performanceScores.seo).toBe(100);
    expect(report.detectedTech).toContain("Next.js");
    expect(report.detectedTech).toContain("Cloudflare");
    expect(report.signals.hasLocalBusinessSchema).toBe(true);
    expect(report.signals.hasLeadCaptureOrBooking).toBe(true);

    const backendReport = await runBackendWebsiteAudit({
      website: "https://moderndiner.example.org",
      reviewCount: 320,
    });
    expect(backendReport.dataMode).toBe("live_html");
    expect(backendReport.seoScore).toBe(100);
    expect(backendReport.detectedTech).toContain("Next.js");
  });

  it("blocks SSRF redirects to internal metadata endpoints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response("", {
          status: 302,
          headers: { location: "http://169.254.169.254/latest/meta-data" },
        })
      )
    );

    await expect(
      runRealWebsiteAudit({ url: "https://redirect-trap.example.org" })
    ).rejects.toThrow(UnsafeAuditUrlError);
  });

  it("uses Google PageSpeed Insights v5 scores when PAGESPEED_API_KEY is configured", async () => {
    process.env.PAGESPEED_API_KEY = "test_psi_key_123456789";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const target = input.toString();
        if (target.includes("pagespeedonline/v5")) {
          return new Response(
            JSON.stringify({
              lighthouseResult: {
                categories: {
                  performance: { score: 0.72 },
                  seo: { score: 0.91 },
                  accessibility: { score: 0.88 },
                },
                audits: {
                  "largest-contentful-paint": { displayValue: "2.4 s" },
                  "first-contentful-paint": { displayValue: "1.3 s" },
                  "cumulative-layout-shift": { displayValue: "0.04" },
                  "total-blocking-time": { displayValue: "90 ms" },
                },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        return new Response("<html><head><title>Site</title></head><body><h1>Hi</h1></body></html>", {
          status: 200,
        });
      })
    );

    const report = await runRealWebsiteAudit({ url: "https://psi-site.example.org" });
    expect(report.dataMode).toBe("live_pagespeed");
    expect(report.performanceScores.performance).toBe(72);
    expect(report.performanceScores.seo).toBe(91);
    expect(report.metrics.lcp).toBe("2.4 s");
    expect(report.metrics.cls).toBe("0.04");
  });

  it("reports unreachable origins honestly with zero scores instead of fabricated metrics", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ENOTFOUND");
      })
    );

    const report = await runRealWebsiteAudit({ url: "https://down-domain.example.org" });
    expect(report.dataMode).toBe("unreachable");
    expect(report.reachable).toBe(false);
    expect(report.overallScore).toBe(0);
    expect(report.metrics.lcp).toBe("Unreachable");
    expect(report.issues[0].title).toContain("Unreachable");
  });
});
