"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  ChevronDown,
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Share2,
  ArrowRight,
  Receipt,
  MessageSquare,
} from "lucide-react";

interface ClientRecord {
  id: string;
  name: string;
  domain: string;
  type: string;
  location: string;
  projectsCount: number;
  totalValue: string;
  status: "Active" | "Onboarding" | "Completed";
  lastActivity: string;
  iconBg: string;
  phone: string;
  email: string;
  contactPerson: string;
  rating: number;
  reviews: number;
  clientSince: string;
  description: string;
  tags: string[];
}

const CLIENT_RECORDS: ClientRecord[] = [
  { id: "1", name: "The Urban Kitchen", domain: "theurbankitchen.in", type: "Restaurant", location: "Indore, MP", projectsCount: 2, totalValue: "₹75,000", status: "Active", lastActivity: "2 hours ago", iconBg: "bg-orange-50 text-orange-600", phone: "+91 98765 43210", email: "rahul@theurbankitchen.in", contactPerson: "Rahul Sharma", rating: 4.4, reviews: 1234, clientSince: "12 Mar 2024", description: "A modern multi-cuisine restaurant in Indore offering a unique dining experience with a focus on local flavors and modern presentation.", tags: ["restaurant", "food & beverage", "indore", "high-potential"] },
  { id: "2", name: "Spice Junction", domain: "spicejunction.in", type: "Café", location: "Indore, MP", projectsCount: 1, totalValue: "₹45,000", status: "Active", lastActivity: "1 day ago", iconBg: "bg-purple-50 text-purple-600", phone: "+91 98260 11223", email: "contact@spicejunction.in", contactPerson: "Priya Mehta", rating: 4.6, reviews: 892, clientSince: "10 Mar 2024", description: "Artisanal specialty coffee roastery and European bakery popular among young professionals.", tags: ["cafe", "beverage", "indore"] },
  { id: "3", name: "Dental Care+", domain: "dentalcareplus.in", type: "Dental Clinic", location: "Indore, MP", projectsCount: 2, totalValue: "₹90,000", status: "Onboarding", lastActivity: "3 hours ago", iconBg: "bg-cyan-50 text-cyan-600", phone: "+91 98261 44556", email: "drkapoor@dentalcareplus.in", contactPerson: "Dr. Sameer Kapoor", rating: 4.8, reviews: 921, clientSince: "5 Mar 2024", description: "Modern multi-chair dental implant and cosmetic surgery clinic with digital x-ray diagnostics.", tags: ["healthcare", "dental", "clinic"] },
  { id: "4", name: "FitLife Gym", domain: "fitlifegym.in", type: "Fitness Center", location: "Indore, MP", projectsCount: 1, totalValue: "₹60,000", status: "Active", lastActivity: "1 day ago", iconBg: "bg-emerald-50 text-emerald-600", phone: "+91 98111 22334", email: "trainer@fitlifegym.in", contactPerson: "Amit Verma", rating: 4.3, reviews: 764, clientSince: "1 Mar 2024", description: "High-intensity functional training studio and CrossFit community box.", tags: ["fitness", "gym", "crossfit"] },
  { id: "5", name: "Hotel Grand Plaza", domain: "grandplaza.in", type: "Hotel", location: "Indore, MP", projectsCount: 3, totalValue: "₹1,80,000", status: "Active", lastActivity: "5 hours ago", iconBg: "bg-blue-50 text-blue-600", phone: "+91 98990 12345", email: "manager@grandplaza.in", contactPerson: "Karan Malhotra", rating: 4.2, reviews: 512, clientSince: "15 Feb 2024", description: "4-star business hotel with banquet hall facilities and rooftop dining.", tags: ["hotel", "hospitality", "luxury"] },
  { id: "6", name: "Fashion Hub", domain: "fashionhub.in", type: "Retail Store", location: "Indore, MP", projectsCount: 1, totalValue: "₹50,000", status: "Completed", lastActivity: "3 days ago", iconBg: "bg-pink-50 text-pink-600", phone: "+91 98765 00112", email: "support@fashionhub.in", contactPerson: "Neha Gupta", rating: 4.1, reviews: 986, clientSince: "10 Feb 2024", description: "Contemporary ethnic wear boutique for weddings and festive apparel.", tags: ["retail", "fashion", "ecommerce"] },
  { id: "7", name: "Auto Garage Pro", domain: "autogaragepro.in", type: "Automotive", location: "Indore, MP", projectsCount: 1, totalValue: "₹40,000", status: "Active", lastActivity: "1 day ago", iconBg: "bg-indigo-50 text-indigo-600", phone: "+91 98100 88990", email: "service@autogaragepro.in", contactPerson: "Deepak Sharma", rating: 4.5, reviews: 498, clientSince: "20 Feb 2024", description: "Certified multi-brand car servicing, computerized wheel alignment, and detailing.", tags: ["automotive", "garage", "local"] },
  { id: "8", name: "Bright Minds Academy", domain: "brightminds.in", type: "Education", location: "Indore, MP", projectsCount: 2, totalValue: "₹85,000", status: "Active", lastActivity: "2 days ago", iconBg: "bg-amber-50 text-amber-600", phone: "+91 98262 33445", email: "info@brightminds.in", contactPerson: "Simran Kaur", rating: 4.6, reviews: 512, clientSince: "18 Feb 2024", description: "CBSE & ICSE foundation coaching institute for competitive engineering entrance.", tags: ["education", "coaching", "academy"] },
];

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<ClientRecord>(CLIENT_RECORDS[0]);
  const [activeTab, setActiveTab] = useState("All Clients (48)");
  const [detailTab, setDetailTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: ClientRecord["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Onboarding":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            Clients
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            Manage your clients, projects, communication and revenue in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs">
            Import Clients
          </button>
          <button className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs inline-flex items-center gap-1">
            <span>Export</span> <ChevronDown size={11} className="text-gray-400" />
          </button>
          <button className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors">
            <Plus size={14} />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards Across */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Users size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">48</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 20%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Clients</div>
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
            <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Building2 size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">32</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 15%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Active Clients</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 15 20 25 12 T 50 3" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">18</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 28%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Completed Projects</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 20 18 30 8 T 50 2" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
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
                <span className="text-xl font-bold text-[#171918]">6</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                  ↓ 0%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Onboarding</div>
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
            <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-sm">
              ₹
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">₹4.8L</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  ↑ 42%
                </span>
              </div>
              <div className="text-[11px] text-[#68717D]">Total Revenue</div>
            </div>
          </div>
          <div className="w-12 h-5 opacity-70 hidden xl:block">
            <svg viewBox="0 0 50 20" className="w-full h-full">
              <path d="M 0 18 Q 15 20 25 12 T 50 3" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Clients Table + Right Selected Client Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Clients Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden">
          {/* Tabs & Controls */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
              {["All Clients (48)", "Active (32)", "Onboarding (6)", "Projects (18)", "Inactive (4)"].map((tab) => (
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
                  placeholder="Search clients..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 shadow-2xs">
                  Filter
                </button>
                <select className="h-7 px-2 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none shadow-2xs">
                  <option>Sort: Last Updated ⌄</option>
                  <option>Sort: Highest Value</option>
                  <option>Sort: Most Projects</option>
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
                  <th className="py-2.5 px-2.5 font-semibold">Client Name</th>
                  <th className="py-2.5 px-2 font-semibold">Business Type</th>
                  <th className="py-2.5 px-2 font-semibold">Location</th>
                  <th className="py-2.5 px-2 font-semibold text-center">Projects</th>
                  <th className="py-2.5 px-2 font-semibold">Total Value</th>
                  <th className="py-2.5 px-2 font-semibold">Status</th>
                  <th className="py-2.5 px-2 font-semibold">Last Activity</th>
                  <th className="py-2.5 px-2 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {CLIENT_RECORDS.map((c) => {
                  const isSelected = selectedClient.id === c.id;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedClient(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${c.iconBg}`}>
                            {c.name.charAt(0)}
                          </span>
                          <div>
                            <div className="font-bold text-[#171918]">{c.name}</div>
                            <div className="text-[10px] text-gray-400">{c.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600">{c.type}</td>
                      <td className="py-2.5 px-2 text-gray-600">{c.location}</td>
                      <td className="py-2.5 px-2 text-center font-semibold text-[#171918]">{c.projectsCount}</td>
                      <td className="py-2.5 px-2 font-bold text-[#171918]">{c.totalValue}</td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" /> {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-400">{c.lastActivity}</td>
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
            <span>Showing 1 to 8 of 48 clients</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 rounded border bg-white">‹</button>
              <button className="px-2 py-0.5 rounded bg-[#171918] text-white font-bold">1</button>
              <button className="px-2 py-0.5 rounded hover:bg-gray-100">2</button>
              <button className="px-2 py-0.5 rounded hover:bg-gray-100">3</button>
              <button className="px-2 py-0.5 rounded border bg-white">›</button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Selected Client Overview Panel */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 space-y-4 shadow-xs text-xs">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-200">
                🍽️
              </span>
              <div>
                <h3 className="font-bold text-base text-[#171918]">{selectedClient.name}</h3>
                <div className="text-[11px] text-gray-500">{selectedClient.type} • {selectedClient.domain}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <Star size={14} className="text-amber-400 fill-amber-400" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100 text-gray-400">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-100 text-[11px] font-semibold pb-1 overflow-x-auto scrollbar-none">
            {["Overview", "Projects", "Communication", "Files", "Billing"].map((tab) => (
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

          {/* Location & Contacts */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
            <span className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" /> {selectedClient.location}</span>
            <span className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /> {selectedClient.phone}</span>
            <span className="flex items-center gap-1"><Mail size={11} className="text-gray-400" /> {selectedClient.email}</span>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            {selectedClient.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 text-[10px]">
            {selectedClient.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                {t}
              </span>
            ))}
            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">+</span>
          </div>

          {/* 6 Mini Stat Cards in 2x3 Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-sm text-[#171918] block">{selectedClient.projectsCount}</span>
              <span className="text-[9px] text-gray-400">Total Projects</span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-sm text-[#171918] block">{selectedClient.totalValue}</span>
              <span className="text-[9px] text-gray-400">Total Revenue</span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-xs text-emerald-700 block">{selectedClient.status}</span>
              <span className="text-[9px] text-gray-400">Client Status</span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-xs text-amber-600 block">★ {selectedClient.rating}</span>
              <span className="text-[9px] text-gray-400">Google Rating</span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-xs text-[#171918] block">{selectedClient.clientSince}</span>
              <span className="text-[9px] text-gray-400">Client Since</span>
            </div>
            <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
              <span className="font-bold text-xs text-[#171918] block truncate">{selectedClient.contactPerson}</span>
              <span className="text-[9px] text-gray-400">Primary Contact</span>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#171918]">Recent Projects</span>
              <span className="text-[10px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#171918]">Website Development</div>
                  <div className="text-[10px] text-gray-400">Complete website redesign with booking system</div>
                </div>
                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                  <div className="text-[9px] text-gray-400">12 Mar 2024</div>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#171918]">SEO &amp; Content Marketing</div>
                  <div className="text-[10px] text-gray-400">Monthly SEO and content package</div>
                </div>
                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">Active</span>
                  <div className="text-[9px] text-gray-400">18 Mar 2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#171918]">Recent Activity</span>
              <span className="text-[10px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              {[
                { action: "Replied to outreach email", time: "2 hours ago" },
                { action: "Shared project proposal", time: "5 hours ago" },
                { action: "Had a call with Rahul", time: "1 day ago" },
                { action: "Website design approved", time: "2 days ago" },
                { action: "Invoice sent (₹35,000)", time: "3 days ago" },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 text-gray-600">
                  <span className="truncate max-w-[200px]">{act.action}</span>
                  <span className="text-[10px] text-gray-400">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="font-bold text-xs text-[#171918]">Quick Actions</span>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <Mail size={11} /> Send Email
              </button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <Calendar size={11} /> Schedule Call
              </button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <Plus size={11} /> Create Project
              </button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <Receipt size={11} /> View Invoices
              </button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <FileText size={11} /> Add Note
              </button>
              <button className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs">
                <Share2 size={11} /> Share Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
