import { Request } from "express";
import mongoose from "mongoose";
import { Organization } from "../models/Organization.js";

/**
 * Resolves the active organization ID from request user auth or default demo organization.
 * Safely guards against Mongoose command buffering when disconnected (e.g. in test suite).
 */
export async function resolveOrgId(req: Request): Promise<string> {
  if (req.user?.organizationId) return req.user.organizationId;
  if (mongoose.connection.readyState !== 1) {
    return "demo-org-id";
  }
  try {
    const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
    return defaultOrg?._id?.toString() || "demo-org-id";
  } catch {
    return "demo-org-id";
  }
}

/**
 * Extracts a single string ID from Express request parameters safely.
 */
export function extractId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
}

