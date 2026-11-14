import { TemplatesRepository } from "../../repositories/templates.repository.js";
import { ProjectsRepository } from "../../repositories/projects.repository.js";
import { TemplateRecord } from "../../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export class TemplatesService {
  static async listTemplates(orgId: string, category?: string) {
    const templates = await TemplatesRepository.findAll(category);
    return templates.map((t) => ({
      _id: t.templateId,
      name: t.name,
      category: t.category,
      categoryBadge: t.categoryBadge || "bg-indigo-50 text-indigo-700",
      rating: t.rating || 4.8,
      usesCount: t.usesCount || 500,
      description: t.description,
      img: t.previewImage || "/assets/templates/restaurant.jpg",
      thumbnails: [t.previewImage || "/assets/templates/restaurant.jpg"],
      features: t.tagsJson ? JSON.parse(t.tagsJson) : ["Responsive Design", "Speed Optimization"],
    }));
  }

  static async getTemplateById(id: string, orgId: string) {
    const template = await TemplatesRepository.findById(id);
    if (!template) {
      const all = await TemplatesRepository.findAll();
      return all[0] || null;
    }
    return {
      _id: template.templateId,
      name: template.name,
      category: template.category,
      categoryBadge: template.categoryBadge || "bg-indigo-50 text-indigo-700",
      rating: template.rating || 4.8,
      usesCount: template.usesCount || 500,
      description: template.description,
      img: template.previewImage || "/assets/templates/restaurant.jpg",
      thumbnails: [template.previewImage || "/assets/templates/restaurant.jpg"],
      features: template.tagsJson ? JSON.parse(template.tagsJson) : ["Responsive Design", "Speed Optimization"],
    };
  }

  static async createTemplate(orgId: string, data: any) {
    const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const created = await TemplatesRepository.create({
      templateId,
      name: data.name || "Custom Template",
      category: data.category || "General",
      previewImage: data.img || data.previewImage || "/assets/templates/restaurant.jpg",
      description: data.description || "Custom responsive agency template.",
      basePrice: data.basePrice || 45000,
      tagsJson: JSON.stringify(data.features || ["Responsive Web Layout"]),
    });

    return {
      _id: created.templateId,
      id: created.templateId,
      templateId: created.templateId,
      organizationId: orgId,
      ...data,
      isCustom: true,
      createdAt: created.createdAt,
    };
  }

  static async applyTemplate(templateId: string, orgId: string, projectName?: string, clientName?: string) {
    const template = await this.getTemplateById(templateId, orgId);
    if (!template) {
      throw new Error("TEMPLATE_NOT_FOUND");
    }

    const title = projectName || `${template.name} for ${clientName || "New Client"}`;
    const project = await ProjectsRepository.create({
      projectId: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientId: `cli_${Date.now()}`,
      clientName: clientName || "Pending Client",
      organizationId: orgId,
      name: title,
      subtitle: `Built from ${template.name}`,
      type: "Template Application",
      status: "Active",
      budget: 50000,
      amountPaid: 0,
      amountDue: 50000,
      progress: 15,
    });

    return {
      applied: true,
      templateId,
      project: {
        id: project.projectId,
        title: project.name,
        status: project.status,
      },
    };
  }
}
