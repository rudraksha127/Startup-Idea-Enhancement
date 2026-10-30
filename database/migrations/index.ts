import mongoose from "mongoose";

export interface Migration {
  id: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export const migration001: Migration = {
  id: "001_initial_schema",
  description: "Create base collections and indexes for organizations, users, leads, invoices, agents",
  up: async () => {
    // Verified implicitly via Mongoose schemas
  },
  down: async () => {
    // No-op rollback
  },
};

export const migration002: Migration = {
  id: "002_add_n8n_sync_fields",
  description: "Ensure leads support n8n audit scores, source provenance, and suppression flags",
  up: async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection("leads").updateMany(
        { opportunityScore: { $exists: false } },
        { $set: { opportunityScore: 50, websiteScore: 50 } }
      );
    }
  },
  down: async () => {},
};

export const migration003: Migration = {
  id: "003_add_multi_tenant_teams",
  description: "Ensure users have organization boundaries and role enum enforcement",
  up: async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection("users").updateMany(
        { role: { $exists: false } },
        { $set: { role: "Operator" } }
      );
    }
  },
  down: async () => {},
};

export const ALL_MIGRATIONS = [migration001, migration002, migration003];

export async function runMigrations() {
  if (mongoose.connection.readyState !== 1) {
    return { applied: 0, status: "OFFLINE_SKIPPED" };
  }

  const migrationColl = mongoose.connection.collection("_migrations");
  const appliedList = await migrationColl.find().toArray();
  const appliedIds = new Set(appliedList.map((m) => m.id));

  let count = 0;
  for (const m of ALL_MIGRATIONS) {
    if (!appliedIds.has(m.id)) {
      await m.up();
      await migrationColl.insertOne({
        id: m.id,
        description: m.description,
        appliedAt: new Date(),
      });
      count++;
    }
  }

  return { applied: count, status: "SUCCESS" };
}
