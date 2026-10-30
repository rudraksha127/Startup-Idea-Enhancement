import mongoose from "mongoose";
import { ensureIndexes } from "../indexes/index.js";
import { runMigrations } from "../migrations/index.js";
import { seedDatabase } from "../seed/seed-data.js";

const command = process.argv[2] || "health";

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/agencyos";
  console.log(`[Database CLI] Connecting to MongoDB: ${uri.replace(/\/\/.*@/, "//***@")} ...`);

  try {
    await mongoose.connect(uri);
    console.log("[Database CLI] Connection verified.");

    switch (command) {
      case "indexes": {
        console.log("[Database CLI] Ensuring compound indexes...");
        const result = await ensureIndexes();
        console.log(`[Database CLI] Created/verified ${result.created} indexes.`);
        break;
      }
      case "migrate": {
        console.log("[Database CLI] Running pending migrations...");
        const result = await runMigrations();
        console.log(`[Database CLI] Migrations status: ${result.status}, applied: ${result.applied}`);
        break;
      }
      case "seed": {
        console.log("[Database CLI] Executing database seed...");
        await seedDatabase();
        break;
      }
      case "health":
      default: {
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log(`[Database CLI] Database healthy. Found ${collections?.length || 0} collections:`, collections?.map(c => c.name));
        break;
      }
    }
  } catch (err: any) {
    console.error("[Database CLI] Command failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("[Database CLI] Disconnected.");
  }
}

main();

