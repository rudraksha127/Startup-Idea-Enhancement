import { Project } from "../../models/Project.js";

export class ProjectsService {
  static async getProjects(orgId: string) {
    return Project.find({ organizationId: orgId }).sort({ createdAt: -1 });
  }

  static async getProjectById(id: string, orgId: string) {
    return Project.findOne({ _id: id, organizationId: orgId });
  }

  static async createProject(data: Record<string, any>, orgId: string) {
    return Project.create({
      ...data,
      organizationId: orgId,
    });
  }

  static async updateProject(id: string, data: Record<string, any>, orgId: string) {
    return Project.findOneAndUpdate(
      { _id: id, organizationId: orgId },
      data,
      { new: true }
    );
  }
}

