import { catalystClient } from "../infrastructure/persistence/zoho-catalyst/catalyst.client.js";
import { TemplateRecord, ProposalRecord } from "../infrastructure/persistence/zoho-catalyst/catalyst.types.js";

export const SEED_TEMPLATES: Omit<TemplateRecord, "ROWID" | "createdAt">[] = [
  {
    templateId: "tpl-1",
    name: "Modern Restaurant & Bar",
    category: "Restaurant",
    categoryBadge: "bg-emerald-50 text-emerald-700",
    rating: 4.9,
    usesCount: 1248,
    description: "High-converting food and dining framework with online table booking, dynamic digital menu, and location schema.",
    previewImage: "/assets/templates/restaurant.jpg",
    basePrice: 50000,
    tagsJson: JSON.stringify(["Table Reservation", "Digital Menu", "Local Business Schema", "Speed Optimized"]),
  },
  {
    templateId: "tpl-2",
    name: "Specialty Cafe & Roastery",
    category: "Cafe",
    categoryBadge: "bg-amber-50 text-amber-700",
    rating: 4.8,
    usesCount: 892,
    description: "Warm artisanal cafe presentation with beverage tasting notes, barista stories, and event hosting bookings.",
    previewImage: "/assets/templates/restaurant.jpg",
    basePrice: 42000,
    tagsJson: JSON.stringify(["Artisanal Coffee", "Weekly Events", "Mobile Menu", "WhatsApp Connect"]),
  },
  {
    templateId: "tpl-3",
    name: "CarePoint Dental & Medical Clinic",
    category: "Clinic",
    categoryBadge: "bg-blue-50 text-blue-700",
    rating: 4.9,
    usesCount: 764,
    description: "HIPAA/DPDP compliant healthcare practice website with appointment intake, doctor credentials, and insurance FAQs.",
    previewImage: "/assets/templates/clinic.jpg",
    basePrice: 65000,
    tagsJson: JSON.stringify(["Doctor Profiles", "Appointment Intake", "DPDP Compliant", "Patient Reviews"]),
  },
  {
    templateId: "tpl-4",
    name: "Pulse Fitness Club & Gym",
    category: "Gym",
    categoryBadge: "bg-purple-50 text-purple-700",
    rating: 4.7,
    usesCount: 642,
    description: "High-energy athletic club and CrossFit layout with workout class schedules, membership tiers, and trainer portfolios.",
    previewImage: "/assets/templates/restaurant.jpg",
    basePrice: 48000,
    tagsJson: JSON.stringify(["Class Schedules", "Membership Tiers", "Trainer Profiles", "Trial Pass"]),
  },
  {
    templateId: "tpl-5",
    name: "Grand Plaza Luxury Hotel",
    category: "Hotel",
    categoryBadge: "bg-indigo-50 text-indigo-700",
    rating: 4.9,
    usesCount: 432,
    description: "Luxury hospitality showcase featuring room suites preview, amenity gallery, direct booking engine, and local attractions.",
    previewImage: "/assets/templates/hotel.jpg",
    basePrice: 95000,
    tagsJson: JSON.stringify(["Direct Booking Engine", "Virtual Room Tour", "Amenity Gallery", "Concierge Guide"]),
  },
  {
    templateId: "tpl-6",
    name: "Glow Beauty Salon & Spa",
    category: "Salon",
    categoryBadge: "bg-pink-50 text-pink-700",
    rating: 4.8,
    usesCount: 689,
    description: "Modern aesthetic spa and beauty lounge framework with stylist slot booking, bridal packages, and gift cards.",
    previewImage: "/assets/templates/salon.jpg",
    basePrice: 40000,
    tagsJson: JSON.stringify(["Stylist Booking", "Bridal Packages", "WhatsApp Reminders", "Service Menu"]),
  },
];

export class TemplatesRepository {
  static async findAll(category?: string): Promise<TemplateRecord[]> {
    let all = await catalystClient.find<TemplateRecord>("Templates");
    if (all.length === 0) {
      // Seed default industry templates into Catalyst Data Store
      for (const t of SEED_TEMPLATES) {
        await catalystClient.insertRow<TemplateRecord>("Templates", t);
      }
      all = await catalystClient.find<TemplateRecord>("Templates");
    }

    if (category && category !== "All") {
      return all.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }
    return all;
  }

  static async findById(templateId: string): Promise<TemplateRecord | null> {
    const tpls = await catalystClient.find<TemplateRecord>("Templates", { templateId });
    if (tpls.length > 0) return tpls[0];

    const byRow = await catalystClient.find<TemplateRecord>("Templates", { ROWID: templateId });
    if (byRow.length > 0) return byRow[0];

    // Check seed fallback
    const seed = SEED_TEMPLATES.find((s) => s.templateId === templateId);
    return seed ? { ...seed, createdAt: new Date().toISOString() } : null;
  }

  static async create(data: Omit<TemplateRecord, "ROWID" | "createdAt">): Promise<TemplateRecord> {
    const templateId = data.templateId || `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<TemplateRecord>("Templates", { ...data, templateId });
  }

  static async findProposalsByOrg(orgId: string): Promise<ProposalRecord[]> {
    return catalystClient.find<ProposalRecord>("Proposals", { organizationId: orgId });
  }

  static async createProposal(data: Omit<ProposalRecord, "ROWID" | "createdAt">): Promise<ProposalRecord> {
    const proposalId = data.proposalId || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return catalystClient.insertRow<ProposalRecord>("Proposals", { ...data, proposalId });
  }
}
