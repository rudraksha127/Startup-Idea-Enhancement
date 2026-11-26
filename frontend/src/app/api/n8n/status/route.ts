import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/jwt";

export async function GET(req: NextRequest) {
  const auth = await requireApiAuth(req);
  if (auth.error) return auth.error;

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
  const isConfigured = Boolean(n8nWebhookUrl && n8nWebhookUrl.startsWith("http"));

  return NextResponse.json({
    success: true,
    engine: "n8n Workflow Automation",
    status: isConfigured ? "CONNECTED" : "STANDBY_LOCAL",
    configured: isConfigured,
    webhookBaseUrl: n8nWebhookUrl || "http://localhost:5678",
    registeredWorkflows: [
      { id: "website-audit", name: "Autonomous Website & Core Web Vitals Auditor", trigger: "webhook" },
      { id: "prospect-discovery", name: "Indian SMB Registry & GST Ingestion Pipeline", trigger: "scheduled" },
      { id: "uptime-sla-monitor", name: "6-Hour Retainer Uptime & SSL Monitor", trigger: "cron" },
      { id: "client-monthly-report", name: "Monthly Performance PDF Report Generator", trigger: "scheduled" },
    ],
    lastSyncTimestamp: new Date().toISOString(),
  });
}

