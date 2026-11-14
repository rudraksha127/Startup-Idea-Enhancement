import { ProjectsRepository } from "../../repositories/projects.repository.js";
import { ProjectRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class ProjectsService {
  static async getProjects(orgId: string): Promise<ProjectRecord[]> {
    return ProjectsRepository.findByOrg(orgId);
  }

  static async getProjectById(id: string, orgId: string): Promise<ProjectRecord | null> {
    return ProjectsRepository.findById(id, orgId);
  }

  static async createProject(data: Record<string, any>, orgId: string): Promise<ProjectRecord> {
    const projectId = `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return ProjectsRepository.create({
      projectId,
      clientId: data.clientId || `cli_${Date.now()}`,
      clientName: data.clientName || data.client || "Client",
      organizationId: orgId,
      name: data.name || data.title || "New Project",
      subtitle: data.subtitle || data.description || "Website Design & Development",
      type: data.type || "Full Build",
      status: data.status || "Active",
      budget: data.budget || 50000,
      amountPaid: data.amountPaid || 0,
      amountDue: data.amountDue || data.budget || 50000,
      progress: data.progress || 0,
      deadline: data.deadline,
    });
  }

  static async updateProject(id: string, data: Record<string, any>, orgId: string): Promise<ProjectRecord | null> {
    const project = await ProjectsRepository.findById(id, orgId);
    if (!project) return null;
    return ProjectsRepository.update(project.projectId, orgId, data);
  }
}
