import fs from "fs";
import path from "path";

export function validateAllWorkflows() {
  const rootDir = path.resolve("n8n/workflows");
  console.log(`[n8n Validator] Scanning workflows in ${rootDir}...`);

  const workflowFiles: string[] = [];
  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".json")) {
        workflowFiles.push(fullPath);
      }
    }
  }

  scan(rootDir);
  console.log(`[n8n Validator] Found ${workflowFiles.length} workflow definitions.`);

  let valid = 0;
  let errors = 0;

  for (const file of workflowFiles) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const json = JSON.parse(content);

      if (!json.name || !json.nodes || !Array.isArray(json.nodes)) {
        throw new Error("Invalid workflow: missing 'name' or 'nodes' array");
      }
      if (json.nodes.length === 0) {
        throw new Error("Invalid workflow: empty nodes array");
      }
      if (!json.connections || typeof json.connections !== "object") {
        throw new Error("Invalid workflow: missing 'connections' map");
      }

      valid++;
    } catch (err: any) {
      console.error(`[n8n Validator] Error in ${path.relative(rootDir, file)}:`, err.message);
      errors++;
    }
  }

  console.log(`[n8n Validator] Summary: ${valid} valid, ${errors} errors.`);
  if (errors > 0) {
    process.exit(1);
  }
}

validateAllWorkflows();
