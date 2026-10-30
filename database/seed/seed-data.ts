import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";
import { Lead } from "../models/Lead.js";
import { LeadNote } from "../models/LeadNote.js";
import { Project } from "../models/Project.js";
import { AgentConfig } from "../models/AgentConfig.js";
import { Client } from "../models/Client.js";
import { Campaign } from "../models/Campaign.js";

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/agencyos";
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
    console.log("[Seed] Connected to MongoDB at:", uri);
  }

  // 1. Seed or find Organization
  let org = await Organization.findOne({ slug: "agencyos-demo" });
  if (!org) {
    org = await Organization.create({
      name: "AgencyOS Workspace",
      slug: "agencyos-demo",
      plan: "Pro",
      credits: 250,
    });
    console.log("[Seed] Created Organization: AgencyOS Workspace");
  }

  // 2. Seed or find Founder User
  let user = await User.findOne({ email: "founder@agencyos.com" });
  if (!user) {
    const passwordHash = await bcrypt.hash("password123", 10);
    user = await User.create({
      name: "Rudraksh",
      email: "founder@agencyos.com",
      passwordHash,
      role: "Founder",
      organizationId: org._id,
      avatarInitials: "RU",
    });
    console.log("[Seed] Created User: Rudraksh (founder@agencyos.com / password123)");
  }

  // 3. Seed AI Agents
  const defaultAgents = [
    { name: "Market Research Agent", role: "Researches defined industries and niches, identifies target segments and opportunities", status: "Active" as const, dailyTarget: 50, processedToday: 42, confidenceThreshold: 85 },
    { name: "Prospect Discovery Agent", role: "Discovers local high-potential business opportunities across targeted geographies", status: "Active" as const, dailyTarget: 50, processedToday: 38, confidenceThreshold: 85 },
    { name: "Lead Enrichment Agent", role: "Validates business data from authorized sources without hallucination", status: "Active" as const, dailyTarget: 40, processedToday: 29, confidenceThreshold: 90 },
    { name: "Website Audit Agent", role: "Inspects performance, SEO, mobile UX, accessibility, and technology stack", status: "Active" as const, dailyTarget: 30, processedToday: 21, confidenceThreshold: 90 },
    { name: "Lead Qualification Agent", role: "Applies multi-factor business scoring rules and generates explainable criteria", status: "Active" as const, dailyTarget: 50, processedToday: 45, confidenceThreshold: 85 },
    { name: "Outreach Strategy Agent", role: "Personalizes outreach sequences based on website audit signals and business profiles", status: "Active" as const, dailyTarget: 30, processedToday: 18, confidenceThreshold: 90 },
    { name: "Reply Classification Agent", role: "Monitors inbox replies, categorizes intent, and coordinates meeting scheduling", status: "Active" as const, dailyTarget: 20, processedToday: 12, confidenceThreshold: 80 },
    { name: "Meeting Coordination Agent", role: "Coordinates calendar slots and generates meeting draft confirmations", status: "Active" as const, dailyTarget: 15, processedToday: 6, confidenceThreshold: 90 },
    { name: "Proposal Generation Agent", role: "Generates tailored deliverables, pricing schedules, and SOW specifications", status: "Active" as const, dailyTarget: 10, processedToday: 4, confidenceThreshold: 95 },
    { name: "Client Onboarding Agent", role: "Prepares onboarding checklists, milestone trackers, and credential forms", status: "Active" as const, dailyTarget: 10, processedToday: 2, confidenceThreshold: 90 },
    { name: "Project Planning Agent", role: "Breaks client requirements into structured agile milestones and task backlogs", status: "Active" as const, dailyTarget: 10, processedToday: 3, confidenceThreshold: 95 },
    { name: "Website QA Agent", role: "Verifies cross-browser layouts, form validation, and responsiveness before deploy", status: "Active" as const, dailyTarget: 15, processedToday: 8, confidenceThreshold: 90 },
    { name: "Maintenance Agent", role: "Tracks uptime, SSL expiry, Core Web Vitals drift, and client SLA metrics", status: "Active" as const, dailyTarget: 25, processedToday: 25, confidenceThreshold: 95 },
  ];

  for (const agent of defaultAgents) {
    const exists = await AgentConfig.findOne({ organizationId: org._id, name: agent.name });
    if (!exists) {
      await AgentConfig.create({ ...agent, organizationId: org._id });
    }
  }

  // 4. Seed Projects
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
    ]);
  }

  // 5. Seed Clients
  const clientCount = await Client.countDocuments({ organizationId: org._id });
  if (clientCount === 0) {
    await Client.create([
      {
        organizationId: org._id,
        businessName: "Hotel Grand Plaza",
        contactPerson: "Mr. Rajesh Malhotra",
        email: "gm@grandplazadelhi.com",
        phone: "+91 98990 12345",
        address: "Aerocity, New Delhi",
        status: "Active",
        monthlyRetainer: 35000,
        plan: "Full Stack Growth + Cloud Hosting",
        website: "https://grandplaza.example",
        activeProjectsCount: 1,
        totalPaid: 120000,
      },
      {
        organizationId: org._id,
        businessName: "City Care Clinic",
        contactPerson: "Dr. Arvind Saxena",
        email: "care@citycareindore.com",
        phone: "+91 98260 77889",
        address: "Old Palasia, Indore",
        status: "Retainer",
        monthlyRetainer: 20000,
        plan: "Patient Portal & WhatsApp Reminders",
        website: "https://citycare.example",
        activeProjectsCount: 0,
        totalPaid: 65000,
      },
    ]);
  }

  // 6. Seed Campaigns
  const campaignCount = await Campaign.countDocuments({ organizationId: org._id });
  if (campaignCount === 0) {
    await Campaign.create([
      {
        organizationId: org._id,
        name: "Indore Premier Restaurants Funnel Q2",
        channel: "Email",
        status: "Active",
        leadsTargeted: 48,
        sentCount: 36,
        openedCount: 24,
        repliedCount: 8,
        convertedCount: 2,
        templateSubject: "Modern table reservation system for {{businessName}}",
        dryRunMode: true,
      },
    ]);
  }

  console.log("[Seed] Database seeding completed successfully!");
}
