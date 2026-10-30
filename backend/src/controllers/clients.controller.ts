import { Request, Response, NextFunction } from "express";
import { Client } from "../models/Client.js";
import { Organization } from "../models/Organization.js";

export async function getClients(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const { status, search } = req.query;
    const query: Record<string, unknown> = {};
    if (orgId) query.organizationId = orgId;
    if (status && status !== "All") query.status = status;
    if (search && typeof search === "string") {
      query.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: clients, total: clients.length });
  } catch (error) {
    next(error);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const client = await Client.create({
      ...req.body,
      organizationId: orgId,
      onboardedAt: new Date(),
    });

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
}

