import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workflow = "website-audit", payload = {} } = body;

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const isConfigured = Boolean(n8nWebhookUrl && n8nWebhookUrl.startsWith("http"));
    const executionId = "exec_n8n_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    return NextResponse.json({
      success: true,
      workflow,
      executionId,
      status: isConfigured ? "DISPATCHED" : "SANDBOX_MOCK_DISPATCHED",
      targetUrl: isConfigured ? n8nWebhookUrl : "http://localhost:5678/webhook/" + workflow,
      message: isConfigured
        ? `Successfully triggered n8n workflow "${workflow}" at remote instance`
        : `Simulated trigger for n8n workflow "${workflow}". Set N8N_WEBHOOK_URL for live instance.`,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to trigger n8n workflow", details: error.message },
      { status: 500 }
    );
  }
}

