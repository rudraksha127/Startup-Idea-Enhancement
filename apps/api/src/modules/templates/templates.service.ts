import mongoose from "mongoose";
import { Template } from "../../models/Template.js";
import { Project } from "../../models/Project.js";

const DEFAULT_TEMPLATES = [
  {
    name: "Modern Restaurant & Bar",
    category: "Restaurant",
    categoryBadge: "bg-emerald-50 text-emerald-700",
    rating: 4.9,
    usesCount: 1248,
    description: "High-converting food and dining framework with online table booking, dynamic digital menu, and location schema.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg", "/assets/urban-kitchen.jpg"],
    features: [
      "Table reservation system with instant WhatsApp confirmation",
      "Dynamic menu categories (Veg, Non-Veg, Chef Specials)",
      "Google Maps Local Business Schema injection",
      "PageSpeed 95+ mobile-first architecture",
      "Customer reviews carousel & Instagram feed integration",
    ],
    variations: [
      { name: "Modern (Default)", preview: "/assets/templates/restaurant.jpg", isDefault: true },
      { name: "Classic Gold", preview: "/assets/urban-kitchen.jpg" },
    ],
  },
  {
    name: "Specialty Cafe & Roastery",
    category: "Cafe",
    categoryBadge: "bg-amber-50 text-amber-700",
    rating: 4.8,
    usesCount: 892,
    description: "Warm artisanal cafe presentation with beverage tasting notes, barista stories, and event hosting bookings.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: [
      "Daily specials & seasonal beverage showcase",
      "Coffee bean subscription & retail bag checkout",
      "Live music & community event calendar",
    ],
    variations: [
      { name: "Warm Amber", preview: "/assets/templates/restaurant.jpg", isDefault: true },
    ],
  },
  {
    name: "CarePoint Dental & Medical Clinic",
    category: "Clinic",
    categoryBadge: "bg-blue-50 text-blue-700",
    rating: 4.9,
    usesCount: 764,
    description: "HIPAA/DPDP compliant healthcare practice website with appointment intake, doctor credentials, and insurance FAQs.",
    img: "/assets/templates/clinic.jpg",
    thumbnails: ["/assets/templates/clinic.jpg"],
    features: [
      "Online patient registration & appointment booking",
      "Doctor specialty credentials & patient testimonials",
      "Interactive treatment pricing calculator",
    ],
    variations: [
      { name: "Clinical Blue", preview: "/assets/templates/clinic.jpg", isDefault: true },
    ],
  },
  {
    name: "Pulse Fitness Club & Gym",
    category: "Gym",
    categoryBadge: "bg-purple-50 text-purple-700",
    rating: 4.7,
    usesCount: 642,
    description: "High-energy athletic club and CrossFit layout with workout class schedules, membership tiers, and trainer portfolios.",
    img: "/assets/templates/restaurant.jpg",
    thumbnails: ["/assets/templates/restaurant.jpg"],
    features: [
      "Interactive weekly group fitness timetable",
      "Membership tier comparison table & free trial pass",
      "Trainer profile & personal training packages",
    ],
    variations: [
      { name: "Neon Dark", preview: "/assets/templates/restaurant.jpg", isDefault: true },
    ],
  },
  {
    name: "Grand Plaza Luxury Hotel",
    category: "Hotel",
    categoryBadge: "bg-indigo-50 text-indigo-700",
    rating: 4.9,
    usesCount: 432,
    description: "Luxury hospitality showcase featuring room suites preview, amenity gallery, direct booking engine, and local attractions.",
    img: "/assets/templates/hotel.jpg",
    thumbnails: ["/assets/templates/hotel.jpg"],
    features: [
      "Multi-currency & seasonal room rate booking",
      "Photo & 360 virtual room tour",
      "Airport shuttle request and local concierge guide",
    ],
    variations: [
      { name: "Luxury Gold", preview: "/assets/templates/hotel.jpg", isDefault: true },
    ],
  },
  {
    name: "Glow Beauty Salon & Spa",
    category: "Salon",
    categoryBadge: "bg-pink-50 text-pink-700",
    rating: 4.8,
    usesCount: 689,
    description: "Modern aesthetic spa and beauty lounge framework with stylist slot booking, bridal packages, and gift cards.",
    img: "/assets/templates/salon.jpg",
    thumbnails: ["/assets/templates/salon.jpg"],
    features: [
      "Real-time stylist slot reservation system",
      "Stylist portfolio & bridal bundles menu",
      "Automated WhatsApp appointment confirmation",
    ],
    variations: [
      { name: "Pastel Rose", preview: "/assets/templates/salon.jpg", isDefault: true },
    ],
  },
];

export class TemplatesService {
  static async listTemplates(orgId: string, category?: string) {
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...DEFAULT_TEMPLATES];
      if (category && category !== "All") {
        filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
      }
      return filtered.map((t, idx) => ({ _id: (idx + 1).toString(), ...t }));
    }

    const count = await Template.countDocuments({ organizationId: orgId });
    if (count === 0) {
      await Template.insertMany(
        DEFAULT_TEMPLATES.map((t) => ({ ...t, organizationId: orgId, isCustom: false }))
      );
    }

    const query: any = { organizationId: orgId };
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    return await Template.find(query).sort({ createdAt: -1 }).lean();
  }

  static async getTemplateById(id: string, orgId: string) {
    if (mongoose.connection.readyState !== 1) {
      const found = DEFAULT_TEMPLATES.find((_, idx) => (idx + 1).toString() === id);
      return found ? { _id: id, ...found } : { _id: id, ...DEFAULT_TEMPLATES[0] };
    }

    return await Template.findOne({ _id: id, organizationId: orgId }).lean();
  }

  static async createTemplate(orgId: string, data: any) {
    if (mongoose.connection.readyState !== 1) {
      return {
        _id: "custom-" + Date.now().toString(36),
        organizationId: orgId,
        ...data,
        isCustom: true,
        createdAt: new Date(),
      };
    }

    return await Template.create({
      ...data,
      organizationId: new mongoose.Types.ObjectId(orgId),
      isCustom: true,
    });
  }

  static async applyTemplate(templateId: string, orgId: string, projectName?: string, clientName?: string) {
    const template = await this.getTemplateById(templateId, orgId);
    if (!template) {
      throw new Error("TEMPLATE_NOT_FOUND");
    }

    const title = projectName || `${template.name} for ${clientName || "New Client"}`;

    if (mongoose.connection.readyState === 1) {
      const project = await Project.create({
        organizationId: new mongoose.Types.ObjectId(orgId),
        title,
        clientName: clientName || "Pending Client",
        status: "In Progress",
        budget: 50000,
        features: (template as any).features || ["Custom Web Application"],
      });
      return {
        applied: true,
        templateId,
        project: {
          id: project._id.toString(),
          title: project.title,
          status: project.status,
        },
      };
    }

    return {
      applied: true,
      templateId,
      project: {
        id: "proj-" + Date.now().toString(36),
        title,
        status: "In Progress",
      },
    };
  }
}
