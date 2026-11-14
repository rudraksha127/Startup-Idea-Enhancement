import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { ProjectRecord, TaskRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class ProjectsRepository {
  static async findByOrg(orgId: string): Promise<ProjectRecord[]> {
    return catalystClient.find<ProjectRecord>("Projects", { organizationId: orgId });
  }

  static async findById(projectId: string, orgId?: string): Promise<ProjectRecord | null> {
    const query: Record<string, any> = { projectId };
    if (orgId) query.organizationId = orgId;
    const projects = await catalystClient.find<ProjectRecord>("Projects", query);
    if (projects.length > 0) return projects[0];

    const byRow = await catalystClient.find<ProjectRecord>("Projects", orgId ? { ROWID: projectId, organizationId: orgId } : { ROWID: projectId });
    return byRow.length > 0 ? byRow[0] : null;
  }

  static async create(data: Omit<ProjectRecord, "ROWID" | "createdAt" | "updatedAt">): Promise<ProjectRecord> {
    const projectId = data.projectId || `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<ProjectRecord>("Projects", { ...data, projectId });
  }

  static async update(projectId: string, orgId: string, data: Partial<ProjectRecord>): Promise<ProjectRecord> {
    return catalystClient.updateRow<ProjectRecord>("Projects", projectId, data);
  }

  static async delete(projectId: string, orgId: string): Promise<boolean> {
    return catalystClient.deleteRow("Projects", projectId);
  }

  static async findTasks(projectId: string, orgId: string): Promise<TaskRecord[]> {
    return catalystClient.find<TaskRecord>("Tasks", { projectId, organizationId: orgId });
  }

  static async createTask(data: Omit<TaskRecord, "ROWID" | "createdAt">): Promise<TaskRecord> {
    const taskId = data.taskId || `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<TaskRecord>("Tasks", { ...data, taskId });
  }
}
