"use client";

import { useState, useEffect } from "react";
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
  X,
  Loader2,
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

export default function ClientsPage() {
  const [clientsList, setClientsList] = useState<ClientRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [detailTab, setDetailTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalCount = clientsList.length;
  const activeCount = clientsList.filter((c) => c.status === "Active").length;
  const onboardingCount = clientsList.filter((c) => c.status === "Onboarding").length;
  const completedCount = clientsList.filter((c) => c.status === "Completed").length;

  const tabs = [
    { id: "All", label: `All Clients (${totalCount})` },
    { id: "Active", label: `Active (${activeCount})` },
    { id: "Onboarding", label: `Onboarding (${onboardingCount})` },
    { id: "Completed", label: `Completed (${completedCount})` },
  ];

  // New Client Form State
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newContactPerson, setNewContactPerson] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("Indore, MP");
  const [newType, setNewType] = useState("Restaurant");
  const [newRetainer, setNewRetainer] = useState(45000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real clients from backend
  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const json = await res.json();
          const list = json.clients || (json.success && Array.isArray(json.data) ? json.data : []);
          if (Array.isArray(list) && list.length > 0) {
            const mapped: ClientRecord[] = list.map((c: any) => ({
              id: c.clientId || c._id || c.id,
              name: c.name || c.businessName || "Unnamed Partner",
              domain: c.domain || (c.website ? c.website.replace(/^https?:\/\//, "") : ""),
              type: c.type || "Local Business",
              location: c.location || c.address || "Indore, MP",
              projectsCount: c.projectsCount || 1,
              totalValue: typeof c.totalValue === "number" ? `₹${c.totalValue.toLocaleString("en-IN")}` : (c.totalValue || "₹0"),
              status: c.status === "Onboarding" ? "Onboarding" : c.status === "Completed" ? "Completed" : "Active",
              lastActivity: "Active",
              iconBg: "bg-blue-50 text-blue-600",
              phone: c.phone || "+91 98000 00000",
              email: c.email || "contact@client.in",
              contactPerson: c.contactPerson || "Manager",
              rating: c.rating || 4.5,
              reviews: c.reviews || 10,
              clientSince: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
              description: c.description || `${c.name || c.businessName} partner account.`,
              tags: ["active-client", "verified"],
            }));
            setClientsList(mapped);
            setSelectedClient(mapped[0]);
          } else {
            setClientsList([]);
            setSelectedClient(null);
          }
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      }
    }
    loadClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusinessName.trim() || !newEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: newBusinessName,
          contactPerson: newContactPerson || "Owner",
          email: newEmail,
          phone: newPhone || "9876543210",
          address: newAddress,
          monthlyRetainer: Number(newRetainer) || 35000,
          plan: "Performance Funnel + Maintenance",
          status: "Active",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const newRecord: ClientRecord = {
          id: created?._id || String(Date.now()),
          name: newBusinessName,
          domain: `${newBusinessName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
          type: newType,
          location: newAddress,
          projectsCount: 1,
          totalValue: `₹${Number(newRetainer).toLocaleString("en-IN")}`,
          status: "Active",
          lastActivity: "Just now",
          iconBg: "bg-emerald-50 text-emerald-600",
          phone: newPhone || "+91 98765 43210",
          email: newEmail,
          contactPerson: newContactPerson || "Owner",
          rating: 4.8,
          reviews: 50,
          clientSince: "Today",
          description: `Newly onboarded ${newType} client in ${newAddress}.`,
          tags: ["new-client", newType.toLowerCase()],
        };

        setClientsList((prev) => [newRecord, ...prev]);
        setSelectedClient(newRecord);
        setIsAddModalOpen(false);
        setNewBusinessName("");
        setNewContactPerson("");
        setNewEmail("");
        setNewPhone("");
        showToast(`Client "${newBusinessName}" onboarded successfully!`);
      } else {
        const json = await res.json();
        showToast(json.error || "Failed to create client.");
      }
    } catch (err) {
      console.error("Error creating client:", err);
      showToast("Network error creating client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "Contact Person", "Email", "Phone", "Location", "Status", "Total Value"];
    const rows = filteredClients.map((c) => [
      `"${c.name}"`,
      `"${c.contactPerson}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.location}"`,
      `"${c.status}"`,
      `"${c.totalValue}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgencyOS_Clients_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Clients exported to CSV successfully.");
  };

  // Filtered clients
  const filteredClients = clientsList.filter((c) => {
    if (activeTab.startsWith("Active") && c.status !== "Active") return false;
    if (activeTab.startsWith("Onboarding") && c.status !== "Onboarding") return false;
    if (activeTab.startsWith("Inactive") && c.status === "Active") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
          <button
            onClick={handleExportCSV}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs inline-flex items-center gap-1"
          >
            <span>Export CSV</span> <Download size={12} className="text-gray-400" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
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
                <span className="text-xl font-bold text-[#171918]">{totalCount}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {totalCount > 0 ? "↑ 20%" : "Active"}
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
                <span className="text-xl font-bold text-[#171918]">{activeCount}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {activeCount > 0 ? "↑ 15%" : "Active"}
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
                <span className="text-xl font-bold text-[#171918]">{completedCount}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {completedCount > 0 ? "↑ 28%" : "Completed"}
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
                <span className="text-xl font-bold text-[#171918]">{onboardingCount}</span>
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 py-0.2 rounded">
                  {onboardingCount > 0 ? "In Flow" : "0%"}
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
                <span className="text-xl font-bold text-[#171918]">{totalCount > 0 ? "₹4.8L" : "₹0"}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {totalCount > 0 ? "↑ 42%" : "Live"}
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
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#171918] text-white font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
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
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-semibold text-gray-700">No clients onboarded yet</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Convert qualified leads or click &quot;Add Client&quot; to onboard your first partner.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((c) => {
                    const isSelected = selectedClient?.id === c.id;
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
                }))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-gray-500">
            <span>Showing {clientsList.length > 0 ? 1 : 0} to {filteredClients.length} of {clientsList.length} clients</span>
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
          {!selectedClient ? (
            <div className="py-24 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">No Client Selected</h3>
              <p className="text-xs text-gray-500 max-w-[220px] mx-auto">
                Select a client from the table to view their projects, retainer billing, and communications.
              </p>
            </div>
          ) : (
            <>
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
              <Link
                href={`/outreach?lead=${encodeURIComponent(selectedClient.name)}`}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <Mail size={11} /> Send Email
              </Link>
              <a
                href={`tel:${selectedClient.phone}`}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <Phone size={11} /> Call Client
              </a>
              <Link
                href={`/projects?client=${encodeURIComponent(selectedClient.name)}`}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <Plus size={11} /> Create Project
              </Link>
              <Link
                href="/billing"
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <Receipt size={11} /> View Invoices
              </Link>
              <button
                onClick={() => showToast(`Note appended for ${selectedClient.name}`)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <FileText size={11} /> Add Note
              </button>
              <button
                onClick={() => showToast(`Shareable client portal link copied for ${selectedClient.name}`)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center gap-1 font-semibold text-gray-700 shadow-2xs"
              >
                <Share2 size={11} /> Share Portal
              </button>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E7E7E2] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={14} />
                </span>
                <h3 className="font-bold text-base text-[#171918]">Add New Client</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bengal Restaurant"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajiv Roy"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Business Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Café">Café</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Gym & Fitness">Gym &amp; Fitness</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@business.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Location / Address</label>
                  <input
                    type="text"
                    placeholder="Indore, MP"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Retainer (₹)</label>
                  <input
                    type="number"
                    value={newRetainer}
                    onChange={(e) => setNewRetainer(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-xs"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  <span>{isSubmitting ? "Onboarding..." : "Onboard Client"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
