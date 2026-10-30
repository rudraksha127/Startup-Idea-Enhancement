import { importWorkflows } from "../import/import-workflows.js";
import { validateAllWorkflows } from "../validate/validate-workflows.js";

const targetEnv = process.argv[2] || "staging";

async function deploy() {
  console.log(`[n8n Deployer] Starting workflow deployment to environment: ${targetEnv.toUpperCase()}...`);

  // Step 1: Pre-flight validation
  validateAllWorkflows();

  // Step 2: Deployment
  await importWorkflows();

  console.log(`[n8n Deployer] Deployment to ${targetEnv.toUpperCase()} completed successfully.`);
}

deploy();

