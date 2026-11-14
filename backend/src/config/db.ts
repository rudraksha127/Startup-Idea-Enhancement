import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { ENV } from "./env.js";

let isInitialized = false;

export async function connectDB(): Promise<typeof catalystClient> {
  if (isInitialized) {
    return catalystClient;
  }

  try {
    console.log(`[Database] Zoho Catalyst CloudScale Data Store initialized (Project: ${ENV.CATALYST_PROJECT_ID}, Env: ${ENV.CATALYST_ENVIRONMENT})`);
    isInitialized = true;
    return catalystClient;
  } catch (error) {
    console.error("[Database] Failed to initialize Zoho Catalyst Data Store:", error);
    throw error;
  }
}
