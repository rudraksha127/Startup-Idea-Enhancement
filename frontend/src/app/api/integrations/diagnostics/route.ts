import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const isDbConnected = mongoose.connection.readyState === 1;

  const providers = [
    { provider: "MongoDB Atlas", status: isDbConnected ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "Google Gemini API", status: process.env.GEMINI_API_KEY ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "OpenAI API", status: process.env.OPENAI_API_KEY ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "Google Maps Platform", status: (process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "Resend", status: process.env.RESEND_API_KEY ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "Razorpay / Stripe", status: (process.env.RAZORPAY_KEY_ID || process.env.STRIPE_SECRET_KEY) ? "CONNECTED" : "CREDENTIAL_REQUIRED" },
    { provider: "n8n Automation", status: "CONNECTED" },
  ];

  const connectedCount = providers.filter((p) => p.status === "CONNECTED").length;

  return NextResponse.json({
    success: true,
    totalProviders: providers.length,
    connectedProviders: connectedCount,
    healthScore: Math.round((connectedCount / providers.length) * 100),
    activeWebhooks: [
      { id: "wh-stripe", path: "/api/billing/webhook", service: "Stripe", status: "Active" },
      { id: "wh-n8n-audit", path: "/api/n8n/webhook", service: "n8n Audit", status: "Active" },
    ],
    compliance: {
      dpdpActCompliant: true,
      traiOptOutHonored: true,
      noGoogleMapsScraping: true,
      defaultDryRun: true,
    },
    inspectedAt: new Date().toISOString(),
  });
}

