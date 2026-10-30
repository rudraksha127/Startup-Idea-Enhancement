import mongoose from "mongoose";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { Invoice } from "../models/Invoice.js";
import { Project } from "../models/Project.js";
import { AgentExecution } from "../models/AgentExecution.js";
import { Campaign } from "../models/Campaign.js";
import { OutreachMessage } from "../models/OutreachMessage.js";

export interface IndexDefinition {
  collection: string;
  fields: Record<string, 1 | -1 | "text">;
  options?: mongoose.IndexOptions;
}

export const REQUIRED_INDEXES: IndexDefinition[] = [
  // Leads Collection
  { collection: "leads", fields: { organizationId: 1, status: 1 } },
  { collection: "leads", fields: { organizationId: 1, opportunityScore: -1 } },
  { collection: "leads", fields: { email: 1 } },
  { collection: "leads", fields: { slug: 1 } },
  { collection: "leads", fields: { businessName: "text", category: "text" } },

  // Users Collection
  { collection: "users", fields: { email: 1 }, options: { unique: true } },
  { collection: "users", fields: { organizationId: 1, role: 1 } },

  // Invoices Collection
  { collection: "invoices", fields: { organizationId: 1, status: 1 } },
  { collection: "invoices", fields: { invoiceNumber: 1 }, options: { unique: true } },

  // Projects Collection
  { collection: "projects", fields: { organizationId: 1, status: 1 } },
  { collection: "projects", fields: { clientId: 1 } },

  // Agent Executions Collection
  { collection: "agentexecutions", fields: { organizationId: 1, agentId: 1, createdAt: -1 } },
  { collection: "agentexecutions", fields: { executionId: 1 }, options: { unique: true } },

  // Campaigns Collection
  { collection: "campaigns", fields: { organizationId: 1, status: 1 } },

  // Outreach Messages Collection
  { collection: "outreachmessages", fields: { organizationId: 1, status: 1 } },
  { collection: "outreachmessages", fields: { leadId: 1 } },
];

/**
 * Ensures all required compound and unique indexes exist on MongoDB.
 */
export async function ensureIndexes(): Promise<{ success: boolean; created: number }> {
  if (mongoose.connection.readyState !== 1) {
    return { success: false, created: 0 };
  }

  const models: Record<string, mongoose.Model<any>> = {
    leads: Lead,
    users: User,
    invoices: Invoice,
    projects: Project,
    agentexecutions: AgentExecution,
    campaigns: Campaign,
    outreachmessages: OutreachMessage,
  };

  let created = 0;
  for (const idx of REQUIRED_INDEXES) {
    const model = models[idx.collection];
    if (model) {
      try {
        await model.collection.createIndex(idx.fields as any, (idx.options || {}) as any);
        created++;
      } catch (err) {
        console.warn(`[Index Sync] Notice for ${idx.collection}:`, err);
      }
    }
  }

  return { success: true, created };
}
