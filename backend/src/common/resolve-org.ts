import { Request } from "express";
import mongoose from "mongoose";
import { Organization } from "../models/Organization.js";

/**
 * Resolves the active organization ID from request user auth or default demo organization.
 * Safely guards against Mongoose command buffering when disconnected (e.g. in test suite).
 */
const DEFAULT_ORG_ID = "507f191e810c19729de860ea";

export async function resolveOrgId(req: Request): Promise<string> {
  if (req.user?.organizationId && /^[0-9a-fA-F]{24}$/.test(req.user.organizationId)) {
    return req.user.organizationId;
  }
  if (mongoose.connection.readyState !== 1) {
    return DEFAULT_ORG_ID;
  }
  try {
    const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
    return defaultOrg?._id?.toString() || DEFAULT_ORG_ID;
  } catch {
    return DEFAULT_ORG_ID;
  }
}

/**
 * Extracts a single string ID from Express request parameters safely.
 */
export function extractId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || "";
  return param || "";
}

