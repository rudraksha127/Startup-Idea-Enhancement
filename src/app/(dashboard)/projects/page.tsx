"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ProjectBriefDialog } from "@/features/projects/components/project-brief-dialog";

interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  client: string;
  clientAvatar: string;
  clientAvatarBg: string;
  type: string;
  typeBadgeBg: string;
  progress: number;
  team: { name: string; avatar: string }[];
  extraTeamCount?: number;
  deadline: string;
  status: "Active" | "Completed" | "On Hold" | "Cancelled";
  budget: number;
  amountPaid: number;
  amountDue: number;
  startDate: string;
  domain: string;
  description: string;
  tags: string[];
  milestones: { title: string; status: "Completed" | "In Progress" | "Pending"; date: string }[];
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "1",
    name: "Website Development",
    subtitle: "Restaurant Website",
    client: "The Urban Kitchen",
    clientAvatar: "U",
    clientAvatarBg: "bg-amber-100 text-amber-700",
    type: "Website",
    typeBadgeBg: "bg-blue-50 text-blue-700",
    progress: 75,
    team: [
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" },
      { name: "John", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" },
    ],
    extraTeamCount: 2,
    deadline: "25 Mar 2024",
    status: "Active",
    budget: 75000,
    amountPaid: 45000,
    amountDue: 30000,
    startDate: "1 Mar 2024",
    domain: "theurbankitchen.in",
    description: "A modern multi-cuisine restaurant website with online menu, table reservation, and location integration.",
    tags: ["restaurant", "website", "booking", "responsive"],
    milestones: [
      { title: "Design Approval", status: "Completed", date: "5 Mar 2024" },
      { title: "Frontend Development", status: "Completed", date: "12 Mar 2024" },
      { title: "Backend Development", status: "In Progress", date: "18 Mar 2024" },
      { title: "Testing & QA", status: "Pending", date: "22 Mar 2024" },
      { title: "Go Live", status: "Pending", date: "25 Mar 2024" },
    ],
  },
  {
    id: "2",
    name: "SEO & Content Marketing",
    subtitle: "Monthly SEO Package",
    client: "Spice Junction",
    clientAvatar: "S",
    clientAvatarBg: "bg-purple-100 text-purple-700",
    type: "SEO",
    typeBadgeBg: "bg-purple-50 text-purple-700",
    progress: 40,
    team: [
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" },
    ],
    extraTeamCount: 1,
    deadline: "30 Mar 2024",
    status: "Active",
    budget: 35000,
    amountPaid: 20000,
    amountDue: 15000,
    startDate: "5 Mar 2024",
    domain: "spicejunction.in",
    description: "Comprehensive local SEO, keyword optimization and blog content strategy for footfall expansion.",
    tags: ["seo", "content", "marketing", "google-ranking"],
    milestones: [
      { title: "Keyword Audit", status: "Completed", date: "7 Mar 2024" },
      { title: "On-Page Optimization", status: "In Progress", date: "16 Mar 2024" },
      { title: "Backlink Outreach", status: "Pending", date: "24 Mar 2024" },
      { title: "Monthly Report", status: "Pending", date: "30 Mar 2024" },
    ],
  },
  {
    id: "3",
    name: "Google Business Setup",
    subtitle: "GMB Optimization",
    client: "Dental Care+",
    clientAvatar: "D",
    clientAvatarBg: "bg-cyan-100 text-cyan-700",
    type: "Local SEO",
    typeBadgeBg: "bg-cyan-50 text-cyan-700",
    progress: 90,
    team: [
      { name: "John", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" },
    ],
    deadline: "20 Mar 2024",
    status: "Completed",
    budget: 25000,
    amountPaid: 25000,
    amountDue: 0,
    startDate: "2 Mar 2024",
    domain: "dentalcareplus.in",
    description: "Google Maps verification, local citation syndication and appointment link integration.",
    tags: ["local-seo", "gmb", "healthcare", "verified"],
    milestones: [
      { title: "Profile Verification", status: "Completed", date: "4 Mar 2024" },
      { title: "Photo & Video Upload", status: "Completed", date: "8 Mar 2024" },
      { title: "Review Campaign", status: "Completed", date: "15 Mar 2024" },
    ],
  },
  {
    id: "4",
    name: "Social Media Management",
    subtitle: "Instagram & Facebook",
    client: "FitLife Gym",
    clientAvatar: "F",
    clientAvatarBg: "bg-emerald-100 text-emerald-700",
    type: "Social Media",
    typeBadgeBg: "bg-pink-50 text-pink-700",
    progress: 60,
    team: [
      { name: "Emma", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80" },
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" },
    ],
    extraTeamCount: 2,
    deadline: "28 Mar 2024",
    status: "Active",
    budget: 45000,
    amountPaid: 30000,
    amountDue: 15000,
    startDate: "3 Mar 2024",
    domain: "fitlifegym.in",
    description: "Reels production, weekly fitness schedules and direct-message automated trial passes.",
    tags: ["social", "fitness", "reels", "lead-gen"],
    milestones: [
      { title: "Content Calendar Approval", status: "Completed", date: "6 Mar 2024" },
      { title: "12 Reels Produced", status: "In Progress", date: "18 Mar 2024" },
      { title: "Paid Boost Campaign", status: "Pending", date: "25 Mar 2024" },
    ],
  },
  {
    id: "5",
    name: "E-commerce Store",
    subtitle: "Online Store Development",
    client: "Fashion Hub",
    clientAvatar: "F",
    clientAvatarBg: "bg-amber-100 text-amber-700",
    type: "E-commerce",
    typeBadgeBg: "bg-amber-50 text-amber-700",
    progress: 30,
    team: [
      { name: "John", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=80" },
    ],
    deadline: "15 Apr 2024",
    status: "On Hold",
    budget: 95000,
    amountPaid: 35000,
    amountDue: 60000,
    startDate: "10 Mar 2024",
    domain: "fashionhub.in",
    description: "Next.js storefront with Razorpay checkout, product filters and inventory webhook syncing.",
    tags: ["ecommerce", "nextjs", "retail", "fashion"],
    milestones: [
      { title: "UI Mockups", status: "Completed", date: "12 Mar 2024" },
      { title: "Product Catalog Import", status: "In Progress", date: "25 Mar 2024" },
      { title: "Payment Gateway", status: "Pending", date: "5 Apr 2024" },
    ],
  },
  {
    id: "6",
    name: "Booking System",
    subtitle: "Hotel Booking Website",
    client: "Hotel Grand Plaza",
    clientAvatar: "H",
    clientAvatarBg: "bg-blue-100 text-blue-700",
    type: "Website",
    typeBadgeBg: "bg-blue-50 text-blue-700",
    progress: 85,
    team: [
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" },
    ],
    extraTeamCount: 1,
    deadline: "22 Mar 2024",
    status: "Active",
    budget: 120000,
    amountPaid: 80000,
    amountDue: 40000,
    startDate: "15 Feb 2024",
    domain: "grandplaza.in",
    description: "Direct room reservation portal bypassing OTAs, multi-currency display and live calendar sync.",
    tags: ["hotel", "booking", "hospitality", "nextjs"],
    milestones: [
      { title: "Architecture Design", status: "Completed", date: "20 Feb 2024" },
      { title: "Room Catalog & Rates", status: "Completed", date: "28 Feb 2024" },
      { title: "iCal Sync Engine", status: "Completed", date: "10 Mar 2024" },
      { title: "Final QA & Launch", status: "In Progress", date: "22 Mar 2024" },
    ],
  },
  {
    id: "7",
    name: "Branding & Design",
    subtitle: "Logo & Brand Kit",
    client: "Auto Garage Pro",
    clientAvatar: "A",
    clientAvatarBg: "bg-indigo-100 text-indigo-700",
    type: "Branding",
    typeBadgeBg: "bg-indigo-50 text-indigo-700",
    progress: 50,
    team: [
      { name: "Emma", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80" },
    ],
    deadline: "10 Apr 2024",
    status: "Active",
    budget: 30000,
    amountPaid: 15000,
    amountDue: 15000,
    startDate: "12 Mar 2024",
    domain: "autogaragepro.in",
    description: "Vector logo identity, signage templates, typography guidelines and uniform mockups.",
    tags: ["branding", "design", "automotive", "logo"],
    milestones: [
      { title: "Concept Sketches", status: "Completed", date: "14 Mar 2024" },
      { title: "Vector Iterations", status: "In Progress", date: "25 Mar 2024" },
      { title: "Final Asset Kit", status: "Pending", date: "10 Apr 2024" },
    ],
  },
  {
    id: "8",
    name: "Website Redesign",
    subtitle: "Modern UI/UX Update",
    client: "Bright Minds Academy",
    clientAvatar: "B",
    clientAvatarBg: "bg-sky-100 text-sky-700",
    type: "Website",
    typeBadgeBg: "bg-blue-50 text-blue-700",
    progress: 20,
    team: [
      { name: "Alex", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" },
    ],
    extraTeamCount: 2,
    deadline: "5 Apr 2024",
    status: "Active",
    budget: 55000,
    amountPaid: 20000,
    amountDue: 35000,
    startDate: "14 Mar 2024",
    domain: "brightminds.in",
    description: "Accessible responsive education portal with course syllabus downloads and admission inquiry forms.",
    tags: ["education", "redesign", "portal", "forms"],
    milestones: [
      { title: "Information Architecture", status: "Completed", date: "15 Mar 2024" },
      { title: "Figma Component System", status: "In Progress", date: "24 Mar 2024" },
      { title: "Next.js Build", status: "Pending", date: "5 Apr 2024" },
    ],
  },
  {
    id: "9",
    name: "Content Writing",
    subtitle: "Blog & Landing Pages",
    client: "Healing Hands Clinic",
    clientAvatar: "H",
    clientAvatarBg: "bg-rose-100 text-rose-700",
    type: "Content",
    typeBadgeBg: "bg-purple-50 text-purple-700",
    progress: 100,
    team: [
      { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=80" },
    ],
    deadline: "12 Mar 2024",
    status: "Completed",
    budget: 20000,
    amountPaid: 20000,
    amountDue: 0,
    startDate: "1 Mar 2024",
    domain: "healinghands.in",
    description: "Doctor bios, treatment service descriptions and 10 patient health education articles.",
    tags: ["healthcare", "content", "medical", "seo"],
    milestones: [
      { title: "Doctor Interview Transcripts", status: "Completed", date: "3 Mar 2024" },
      { title: "Draft Copy Review", status: "Completed", date: "8 Mar 2024" },
      { title: "Final Proofing & Delivery", status: "Completed", date: "12 Mar 2024" },
    ],
  },
  {
    id: "10",
    name: "Performance Marketing",
    subtitle: "Google Ads Campaign",
    client: "Café Central",
    clientAvatar: "C",
    clientAvatarBg: "bg-orange-100 text-orange-700",
    type: "Ads",
    typeBadgeBg: "bg-amber-50 text-amber-700",
    progress: 45,
    team: [
      { name: "Emma", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&auto=format&fit=crop&q=80" },
    ],
    deadline: "18 Apr 2024",
    status: "Active",
    budget: 35000,
    amountPaid: 15000,
    amountDue: 20000,
    startDate: "10 Mar 2024",
    domain: "cafecentral.in",
    description: "High-intent local keyword bid strategy targeting weekend brunch and dessert delivery.",
    tags: ["ads", "marketing", "google-ads", "local-ppc"],
    milestones: [
      { title: "Ad Copy & Keyword Setup", status: "Completed", date: "12 Mar 2024" },
      { title: "Negative Keyword Tuning", status: "In Progress", date: "22 Mar 2024" },
      { title: "ROAS Optimization", status: "Pending", date: "18 Apr 2024" },
    ],
  },
];

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(PROJECTS_DATA[0]);
  const [activeTab, setActiveTab] = useState("All Projects (18)");
  const [detailTab, setDetailTab] = useState("Overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusDot = (status: ProjectItem["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500 text-emerald-700";
      case "Completed":
        return "bg-blue-500 text-blue-700";
      case "On Hold":
        return "bg-amber-500 text-amber-700";
      case "Cancelled":
        return "bg-rose-500 text-rose-700";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            Manage all client projects from planning to delivery with tasks, timeline and team collaboration.
          </p>
        </div>

        <button
          onClick={() => setDialogOpen(true)}
          className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Project</span>
        </button>
      </div>

      {/* 5 KPI Cards Across */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FolderGit2 size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">18</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 20%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Projects</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 16 Q 15 18 25 10 T 50 4" fill="none" stroke="#3568E8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Clock size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">12</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 33%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Active Projects</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 15 20 25 12 T 50 3" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">4</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 100%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Completed</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 20 18 30 8 T 50 2" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Clock size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">2</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                  ↓ 0%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">On Hold</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 10 Q 25 10 35 10 T 50 10" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertCircle size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">0</span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                  ↓ 100%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Cancelled</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 6 Q 20 6 35 15 T 50 18" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Projects Table + Right Selected Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Projects Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden">
          {/* Tabs & Controls */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
              {["All Projects (18)", "Active (12)", "Completed (4)", "On Hold (2)", "Cancelled (0)"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "bg-[#171918] text-white font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 shadow-2xs inline-flex items-center gap-1">
                  <Filter size={11} className="text-gray-400" /> Filter
                </button>
                <select className="h-7 px-2 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none shadow-2xs">
                  <option>Sort: Last Updated ⌄</option>
                  <option>Sort: Highest Budget</option>
                  <option>Sort: Nearest Deadline</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-[#E7E7E2] text-[#68717D] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-8"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="py-2.5 px-2.5 font-semibold">Project Name</th>
                  <th className="py-2.5 px-2 font-semibold">Client</th>
                  <th className="py-2.5 px-2 font-semibold">Type</th>
                  <th className="py-2.5 px-2 font-semibold w-28">Progress</th>
                  <th className="py-2.5 px-2 font-semibold">Team</th>
                  <th className="py-2.5 px-2 font-semibold">Deadline</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {PROJECTS_DATA.map((p) => {
                  const isSelected = selectedProject.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-[#171918]">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.subtitle}</div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${p.clientAvatarBg}`}>
                            {p.clientAvatar}
                          </span>
                          <span className="font-medium text-gray-800 truncate max-w-[110px]">{p.client}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.typeBadgeBg}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center -space-x-1.5">
                          {p.team.map((m, idx) => (
                            <div key={idx} className="w-5 h-5 rounded-full overflow-hidden border border-white relative shrink-0">
                              <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                            </div>
                          ))}
                          {p.extraTeamCount && (
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold flex items-center justify-center border border-white">
                              +{p.extraTeamCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{p.deadline}</td>
                      <td className="py-2.5 px-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(p.status).split(" ")[0]}`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded text-gray-400 hover:text-black">
                          <MoreHorizontal size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-gray-500">
            <span>Showing 1 to 10 of 18 projects</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 rounded border bg-white">‹</button>
              <button className="px-2 py-0.5 rounded bg-[#171918] text-white font-bold">1</button>
              <button className="px-2 py-0.5 rounded hover:bg-gray-100">2</button>
              <button className="px-2 py-0.5 rounded border bg-white">›</button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Project Detail Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 space-y-4 shadow-xs text-xs">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200">
                🍽️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-[#171918]">{selectedProject.client}</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  {selectedProject.name} • {selectedProject.domain}
                </div>
              </div>
            </div>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
              <MoreHorizontal size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-100 text-[11px] font-semibold pb-1 overflow-x-auto scrollbar-none">
            {["Overview", "Tasks", "Team", "Files", "Timeline", "Invoices"].map((tab) => (
              <button
                key={tab}
                onClick={() => setDetailTab(tab)}
                className={`px-2 py-1 rounded transition-colors ${
                  detailTab === tab ? "bg-[#171918] text-white font-bold" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            {selectedProject.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {selectedProject.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                {t}
              </span>
            ))}
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">+</span>
          </div>

          {/* 6 Metric Info Blocks in 2x3 Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Client</div>
              <div className="font-bold text-xs text-[#171918] truncate mt-0.5">{selectedProject.client}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Start Date</div>
              <div className="font-bold text-xs text-[#171918] mt-0.5">{selectedProject.startDate}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Deadline</div>
              <div className="font-bold text-xs text-[#171918] mt-0.5">{selectedProject.deadline}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Budget</div>
              <div className="font-bold text-xs text-[#171918] mt-0.5">₹{selectedProject.budget.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Amount Paid</div>
              <div className="font-bold text-xs text-blue-700 mt-0.5">₹{selectedProject.amountPaid.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <div className="text-[9px] text-gray-400">Amount Due</div>
              <div className="font-bold text-xs text-rose-700 mt-0.5">₹{selectedProject.amountDue.toLocaleString()}</div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#171918]">Project Progress</span>
              <span className="font-bold text-blue-600">{selectedProject.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${selectedProject.progress}%` }} />
            </div>
          </div>

          {/* Milestones Checklist */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#171918]">Milestones</span>
              <span className="text-[10px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {selectedProject.milestones.map((m) => (
                <div key={m.title} className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.status === "Completed" ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                    ) : m.status === "In Progress" ? (
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">●</span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                    <span className="font-medium text-[#171918]">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${
                      m.status === "Completed" ? "text-emerald-700" : m.status === "In Progress" ? "text-blue-700" : "text-gray-400"
                    }`}>
                      {m.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{m.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Project Timeline + Recent Tasks + Project Files */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Project Timeline (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171918]">Project Timeline</h3>
            <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View Full Timeline →</span>
          </div>

          <div className="text-[10px] text-gray-400 flex items-center justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-700">Mar 2024</span>
            <div className="flex items-center gap-6 pr-4">
              <span>Mar 1</span>
              <span>Mar 7</span>
              <span className="text-blue-600 font-bold">Today</span>
              <span>Mar 21</span>
              <span>Mar 28</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1">
            {[
              { label: "UI/UX Design", start: "10%", width: "35%", color: "bg-emerald-500" },
              { label: "Frontend Development", start: "30%", width: "40%", color: "bg-blue-500" },
              { label: "Backend Development", start: "55%", width: "30%", color: "bg-purple-500" },
              { label: "Testing & QA", start: "80%", width: "15%", color: "bg-amber-400" },
              { label: "Deployment", start: "92%", width: "8%", color: "bg-rose-400" },
            ].map((t) => (
              <div key={t.label} className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-4 text-[11px] font-medium text-gray-700 truncate">{t.label}</span>
                <div className="col-span-8 h-4 bg-gray-50 rounded relative overflow-hidden">
                  <div
                    className={`absolute top-0.5 bottom-0.5 rounded ${t.color}`}
                    style={{ left: t.start, width: t.width }}
                  />
                  {/* Today vertical line */}
                  <div className="absolute top-0 bottom-0 left-[58%] w-px border-r border-dashed border-blue-500 z-10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks (3 cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171918]">Recent Tasks</h3>
            <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { task: "Create homepage design", done: true, time: "2 hours ago" },
              { task: "Implement menu section", done: true, time: "5 hours ago" },
              { task: "Setup reservation system", done: false, time: "1 day ago" },
              { task: "Integrate payment gateway", done: false, time: "2 days ago" },
              { task: "Mobile responsiveness", done: false, time: "2 days ago" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                    task.done ? "bg-emerald-500 text-white" : "border border-gray-300"
                  }`}>
                    {task.done && "✓"}
                  </span>
                  <span className={`text-[11px] truncate max-w-[130px] ${task.done ? "text-gray-700" : "text-gray-800 font-medium"}`}>
                    {task.task}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{task.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Files (3 cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171918]">Project Files</h3>
            <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { name: "Website_Design_Final.fig", size: "4.2 MB", date: "12 Mar 2024", iconBg: "bg-blue-50 text-blue-600" },
              { name: "Menu_Content.pdf", size: "1.8 MB", date: "10 Mar 2024", iconBg: "bg-rose-50 text-rose-600" },
              { name: "Restaurant_Photos.zip", size: "12.5 MB", date: "8 Mar 2024", iconBg: "bg-amber-50 text-amber-600" },
              { name: "Project_Requirements.docx", size: "0.9 MB", date: "5 Mar 2024", iconBg: "bg-blue-50 text-blue-600" },
              { name: "Brand_Assets.zip", size: "8.3 MB", date: "3 Mar 2024", iconBg: "bg-amber-50 text-amber-600" },
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${file.iconBg}`}>
                    <FileText size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] text-[#171918] truncate">{file.name}</div>
                    <div className="text-[9px] text-gray-400">{file.size} • {file.date}</div>
                  </div>
                </div>
                <button className="p-1 rounded text-gray-400 hover:text-black">
                  <Download size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectBriefDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        lead={null}
      />
    </div>
  );
}
