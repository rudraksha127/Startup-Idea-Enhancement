import { Request, Response } from "express";
import { ProjectsService } from "./projects.service.js";
import { resolveOrgId, extractId } from "../../common/resolve-org.js";

export class ProjectsController {
  static getProjects = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const projects = await ProjectsService.getProjects(orgId);
    return res.status(200).json({ projects });
  };

  static getProjectById = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const project = await ProjectsService.getProjectById(id, orgId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    return res.status(200).json({ success: true, project });
  };

  static createProject = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const project = await ProjectsService.createProject(req.body, orgId);
    return res.status(201).json({ success: true, project });
  };

  static updateProject = async (req: Request, res: Response) => {
    const orgId = await resolveOrgId(req);
    const id = extractId(req.params.id);
    const project = await ProjectsService.updateProject(id, req.body, orgId);
    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" });
    }
    return res.status(200).json({ success: true, project });
  };
}
