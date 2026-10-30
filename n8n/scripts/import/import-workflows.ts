import fs from "fs";
import path from "path";

/**
 * Imports all workflow JSON files into a target n8n instance using n8n Public REST API.
 */
export async function importWorkflows() {
  const n8nBaseUrl = process.env.N8N_API_URL || "http://localhost:5678";
  const n8nApiKey = process.env.N8N_API_KEY;

  console.log(`[n8n Importer] Target n8n instance: ${n8nBaseUrl}`);
  if (!n8nApiKey) {
    console.log("[n8n Importer] N8N_API_KEY missing. Dry-run validation mode active.");
  }

  const rootDir = path.resolve("n8n/workflows");
  const workflowFiles: string[] = [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(fullPath);
      else if (entry.name.endsWith(".json")) workflowFiles.push(fullPath);
    }
  }

  scan(rootDir);
  console.log(`[n8n Importer] Discovered ${workflowFiles.length} workflows to import.`);

  let imported = 0;
  for (const file of workflowFiles) {
    const raw = fs.readFileSync(file, "utf-8");
    const json = JSON.parse(raw);

    if (n8nApiKey) {
      try {
        const res = await fetch(`${n8nBaseUrl}/api/v1/workflows`, {
          method: "POST",
          headers: {
            "X-N8N-API-KEY": n8nApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });
        if (!res.ok) {
          console.warn(`[n8n Importer] Warning importing ${json.name}: HTTP ${res.status}`);
        } else {
          imported++;
        }
      } catch (err: any) {
        console.warn(`[n8n Importer] Connection error for ${json.name}:`, err.message);
      }
    } else {
      imported++;
    }
  }

  console.log(`[n8n Importer] Processed ${imported} / ${workflowFiles.length} workflows successfully.`);
}

importWorkflows();

