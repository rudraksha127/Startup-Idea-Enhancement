import { Request, Response } from "express";
import { AgentsService } from "./agents.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class AgentsController {
  static getAgents = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const agents = await AgentsService.getAgents(orgId);
    return res.status(200).json({ agents });
  };

  static getAgentById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const agent = await AgentsService.getAgentById(id, orgId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    return res.status(200).json({ success: true, agent });
  };

  static updateAgent = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const agent = await AgentsService.updateAgent(id, req.body, orgId);
    if (!agent) {
      return res.status(404).json({ error: "Agent configuration not found" });
    }
    return res.status(200).json({ success: true, agent });
  };

  static runAgent = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const userId = (req as any).user?.userId;
    const result = await AgentsService.runAgent(id, orgId, userId, req.body);
    if (!result) {
      return res.status(404).json({ error: "Agent configuration not found" });
    }
    return res.status(200).json({ success: true, ...result });
  };

  static approveRun = async (req: Request, res: Response) => {
    const runId = extractId(req.params.runId);
    const approverId = (req as any).user?.userId || "founder";
    const result = await AgentsService.approveRun(runId, approverId);
    return res.status(200).json({ success: true, ...result });
  };

  static getRunHistory = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const agentId = req.params.id ? extractId(req.params.id) : undefined;
    const runs = await AgentsService.getRunHistory(orgId, agentId);
    return res.status(200).json({ success: true, runs });
  };
}
