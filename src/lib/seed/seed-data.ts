import { connectToDatabase } from "../db/mongodb";
import { Organization } from "../../models/Organization";
import { User } from "../../models/User";
import { Lead } from "../../models/Lead";
import { LeadNote } from "../../models/LeadNote";
import { Project } from "../../models/Project";
import { AgentConfig } from "../../models/AgentConfig";
import { hashPassword } from "../auth/jwt";
import { DEFAULT_LEADS } from "../data/default-leads";

export const RAW_LEADS = DEFAULT_LEADS;

export async function seedDatabase() {
  await connectToDatabase();
  console.log("Connected to MongoDB for database seeding...");

  // 1. Seed or find Organization
  let org = await Organization.findOne({ slug: "agencyos-demo" });
  if (!org) {
    org = await Organization.create({
      name: "AgencyOS Workspace",
      slug: "agencyos-demo",
      plan: "Pro",
      credits: 250,
    });
    console.log("Created Organization: AgencyOS Workspace");
  }

  // 2. Seed or find Founder User
  let user = await User.findOne({ email: "founder@agencyos.com" });
  if (!user) {
    const passwordHash = await hashPassword("password123");
    user = await User.create({
      name: "Rudraksh",
      email: "founder@agencyos.com",
      passwordHash,
      role: "Founder",
      organizationId: org._id,
      avatarInitials: "RU",
    });
    console.log("Created User: Rudraksh (founder@agencyos.com / password123)");
  }

  // 3. Seed AI Agents
  const defaultAgents = [
    { name: "Lead Finder Agent", role: "Discovers local high-potential business opportunities across targeted geographies", status: "Active" as const, dailyTarget: 50, processedToday: 42, confidenceThreshold: 85 },
    { name: "Email Outreach Agent", role: "Personalizes outreach sequences based on website audit signals and business profiles", status: "Active" as const, dailyTarget: 30, processedToday: 18, confidenceThreshold: 90 },
    { name: "Conversation Agent", role: "Monitors inbox replies, categorizes intent, and coordinates meeting scheduling", status: "Idle" as const, dailyTarget: 20, processedToday: 0, confidenceThreshold: 80 },
    { name: "Handoff Brief Agent", role: "Compiles dev-ready technical specifications, asset requirements, and wireframe briefs", status: "Active" as const, dailyTarget: 10, processedToday: 3, confidenceThreshold: 95 },
  ];

  for (const agent of defaultAgents) {
    const exists = await AgentConfig.findOne({ organizationId: org._id, name: agent.name });
    if (!exists) {
      await AgentConfig.create({ ...agent, organizationId: org._id });
    }
  }

  // 4. Seed Leads
  console.log(`Seeding ${RAW_LEADS.length} prototype leads...`);
  for (const leadData of RAW_LEADS) {
    const exists = await Lead.findOne({ organizationId: org._id, slug: leadData.slug });
    if (!exists) {
      await Lead.create({
        ...leadData,
        organizationId: org._id,
      });
    }
  }

  // 5. Seed Urban Kitchen Notes & Tasks
  const urbanKitchen = await Lead.findOne({ organizationId: org._id, slug: "urbankitchen" });
  if (urbanKitchen) {
    const noteCount = await LeadNote.countDocuments({ leadId: urbanKitchen._id });
    if (noteCount === 0) {
      await LeadNote.create([
        {
          leadId: urbanKitchen._id,
          organizationId: org._id,
          author: "Rudraksh",
          authorRole: "Founder",
          content: "Initial website audit completed. Mobile responsiveness and table reservation system identified as primary growth levers.",
          type: "audit",
        },
        {
          leadId: urbanKitchen._id,
          organizationId: org._id,
          author: "Rudraksh",
          authorRole: "Founder",
          content: "Spoke with restaurant general manager on WhatsApp. Interested in seeing a live Next.js demo next Tuesday at 11:00 AM.",
          type: "call",
        },
      ]);
    }
  }

  // 6. Seed Projects
  const projectCount = await Project.countDocuments({ organizationId: org._id });
  if (projectCount === 0) {
    await Project.create([
      {
        organizationId: org._id,
        title: "Hotel Grand Plaza — Luxury Redesign",
        clientName: "Hotel Grand Plaza",
        status: "In Progress",
        budget: 85000,
        deadline: "15 Apr 2026",
        scope: "Direct room booking engine, airport transit layover calculator, mobile menu & virtual tour.",
        features: ["Direct Booking Engine", "Stripe / Razorpay Integration", "Multi-Currency Switcher", "Virtual Room 360 Tour"],
        tasks: [
          { title: "Design homepage and suite showcase", completed: true, assignedTo: "Design Team" },
          { title: "Integrate room booking calendar", completed: false, assignedTo: "Full-Stack Dev" },
          { title: "Configure payment gateway and SMS confirmations", completed: false, assignedTo: "Full-Stack Dev" },
        ],
      },
      {
        organizationId: org._id,
        title: "City Care Clinic — Patient Portal",
        clientName: "City Care Clinic",
        status: "Delivered",
        budget: 65000,
        deadline: "20 Mar 2026",
        scope: "Real-time doctor appointment queue, automated SMS reminders, digital prescription access.",
        features: ["Live Queue Tracker", "Teleconsultation WhatsApp API", "Patient Medical Records"],
        tasks: [
          { title: "Implement WCAG AAA compliant accessibility", completed: true, assignedTo: "Frontend Dev" },
          { title: "Patient SMS gateway webhook", completed: true, assignedTo: "Backend Dev" },
        ],
      },
      {
        organizationId: org._id,
        title: "The Urban Kitchen — Website Refresh & Reservations",
        clientName: "The Urban Kitchen",
        status: "Discovery",
        budget: 45000,
        deadline: "28 Apr 2026",
        scope: "Fast Next.js responsive website, instant online table booking, digital menu, local schema.",
        features: ["Table Reservation Widget", "Interactive Filterable Menu", "Local SEO Schema"],
        tasks: [
          { title: "Audit existing PDF menu and extract dishes", completed: true, assignedTo: "Rudraksh" },
          { title: "Present table reservation wireframe", completed: false, assignedTo: "Rudraksh" },
        ],
      },
    ]);
  }

  console.log("Database seeded successfully with all 28 leads, projects, agents, and default user!");
}

// Allow standalone execution
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Failed to seed database:", err);
      process.exit(1);
    });
}
