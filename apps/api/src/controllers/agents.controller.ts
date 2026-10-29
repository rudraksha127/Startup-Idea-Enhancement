import { Request, Response, NextFunction } from "express";
import { AgentConfig } from "../models/AgentConfig.js";
import { Project } from "../models/Project.js";
import { Organization } from "../models/Organization.js";
import mongoose from "mongoose";

// --- Agents Controller ---
export async function getAgents(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const agents = await AgentConfig.find({ organizationId: orgId });
    res.status(200).json({ agents });
  } catch (error) {
    next(error);
  }
}

export async function updateAgent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const agent = await AgentConfig.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      req.body,
      { new: true }
    );

    if (!agent) {
      return res.status(404).json({ error: "Agent configuration not found" });
    }

    res.status(200).json({ success: true, agent });
  } catch (error) {
    next(error);
  }
}

// --- Projects Controller ---
export async function getProjects(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const projects = await Project.find({ organizationId: orgId }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    let orgId = req.user?.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne({ slug: "agencyos-demo" });
      orgId = defaultOrg?._id.toString();
    }

    const project = await Project.create({
      ...req.body,
      organizationId: orgId,
    });

    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
}

// --- Health Probe Controller ---
export function getHealth(req: Request, res: Response) {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "agencyos-express-api",
    version: "1.0.0",
    database: {
      status: dbConnected ? "connected" : "disconnected",
    },
  });
}

