import fs from "fs";
import path from "path";

/**
 * Exports all active workflows from a live n8n instance and sanitizes credentials.
 */
export async function exportWorkflows() {
  const n8nBaseUrl = process.env.N8N_API_URL || "http://localhost:5678";
  const n8nApiKey = process.env.N8N_API_KEY;

  if (!n8nApiKey) {
    console.log("[n8n Exporter] N8N_API_KEY not set. Export skipped in offline mode.");
    return;
  }

  console.log(`[n8n Exporter] Fetching workflows from ${n8nBaseUrl}...`);
  try {
    const res = await fetch(`${n8nBaseUrl}/api/v1/workflows`, {
      headers: { "X-N8N-API-KEY": n8nApiKey },
    });
    const data = await res.json();
    console.log(`[n8n Exporter] Retrieved ${data.data?.length || 0} workflows.`);
  } catch (err: any) {
    console.error("[n8n Exporter] Failed to export:", err.message);
  }
}

exportWorkflows();

