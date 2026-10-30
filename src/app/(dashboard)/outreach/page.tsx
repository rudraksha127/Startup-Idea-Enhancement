"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Mail,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  TrendingUp,
  MessageCircle,
  Calendar,
  Layers,
  Upload,
  Sparkles,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Play,
  RotateCcw,
  Check,
  CornerDownRight,
  Bookmark,
  Reply,
  ReplyAll,
  Forward,
  X,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface CampaignItem {
  id: string;
  name: string;
  service: string;
  type: string;
  typeBadgeBg: string;
  audience: string;
  sent: number;
  opens: string;
  replies: string;
  meetings: number;
  status: "Active" | "Paused" | "Draft" | "Completed";
  createdAt: string;
}

const CAMPAIGNS: CampaignItem[] = [
  { id: "1", name: "Indore Restaurants", service: "Website Development", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Restaurants Indore", sent: 542, opens: "68%", replies: "12%", meetings: 28, status: "Active", createdAt: "12 Mar 2024" },
  { id: "2", name: "Jaipur Cafes", service: "Website + SEO", type: "Email + Follow-up", typeBadgeBg: "bg-purple-50 text-purple-700", audience: "Cafes Jaipur", sent: 432, opens: "62%", replies: "10%", meetings: 18, status: "Active", createdAt: "10 Mar 2024" },
  { id: "3", name: "Delhi Clinics", service: "Booking Website", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Clinics New Delhi", sent: 612, opens: "71%", replies: "14%", meetings: 32, status: "Active", createdAt: "8 Mar 2024" },
  { id: "4", name: "Fitness Gyms", service: "Website Redesign", type: "LinkedIn + Email", typeBadgeBg: "bg-indigo-50 text-indigo-700", audience: "Gyms Indore", sent: 284, opens: "58%", replies: "8%", meetings: 12, status: "Paused", createdAt: "5 Mar 2024" },
  { id: "5", name: "Fashion Stores", service: "Ecommerce", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Retail Stores Indore", sent: 468, opens: "66%", replies: "11%", meetings: 16, status: "Active", createdAt: "3 Mar 2024" },
  { id: "6", name: "Hotels in MP", service: "Booking Website", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Hotels Madhya Pradesh", sent: 320, opens: "64%", replies: "9%", meetings: 11, status: "Draft", createdAt: "28 Feb 2024" },
  { id: "7", name: "Salons & Spas", service: "Website + Booking", type: "Email + Follow-up", typeBadgeBg: "bg-purple-50 text-purple-700", audience: "Salons Indore", sent: 356, opens: "61%", replies: "10%", meetings: 14, status: "Active", createdAt: "25 Feb 2024" },
  { id: "8", name: "Dental Clinics", service: "Website + SEO", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Dental Clinics Indore", sent: 298, opens: "69%", replies: "13%", meetings: 19, status: "Completed", createdAt: "20 Feb 2024" },
  { id: "9", name: "Coaching Institutes", service: "Website + Lead Form", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Education Indore", sent: 412, opens: "63%", replies: "9%", meetings: 12, status: "Active", createdAt: "18 Feb 2024" },
  { id: "10", name: "Auto Garages", service: "Website + SEO", type: "LinkedIn + Email", typeBadgeBg: "bg-indigo-50 text-indigo-700", audience: "Automotive Indore", sent: 264, opens: "57%", replies: "8%", meetings: 9, status: "Paused", createdAt: "15 Feb 2024" },
];

const PERFORMANCE_DATA = [
  { day: "Mar 1", sent: 350, opened: 240, replied: 42, meetings: 14 },
  { day: "Mar 7", sent: 580, opened: 410, replied: 68, meetings: 21 },
  { day: "Mar 14", sent: 842, opened: 571, replied: 102, meetings: 41 },
  { day: "Mar 21", sent: 980, opened: 680, replied: 115, meetings: 48 },
  { day: "Mar 28", sent: 1120, opened: 790, replied: 138, meetings: 56 },
];

export default function OutreachPage() {
  const [viewMode, setViewMode] = useState<"campaigns" | "sequence" | "inbox">("campaigns");
  const [activeFilterTab, setActiveFilterTab] = useState("All Campaigns (12)");
  const [activeTemplateTab, setActiveTemplateTab] = useState("Initial Email");
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>(CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingSequence, setIsTestingSequence] = useState(false);

  // New Campaign Form State
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignService, setNewCampaignService] = useState("Website Development");
  const [newCampaignChannel, setNewCampaignChannel] = useState<"Email" | "WhatsApp" | "Multi-channel">("Email");
  const [newCampaignAudience, setNewCampaignAudience] = useState("Local Restaurants");
  const [newCampaignSubject, setNewCampaignSubject] = useState("Quick idea to improve your website");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inbox state
  const [selectedInboxIndex, setSelectedInboxIndex] = useState(0);
  const [inboxConversations, setInboxConversations] = useState<any[]>([]);
  const [replyInputText, setReplyInputText] = useState(
    "Hi Rahul,\n\nThanks for your interest! 🙏\nI've attached a detailed proposal with package options, timeline and a few examples of restaurant websites we've built.\n\nLet me know a convenient time for a quick 10-minute call to discuss this further."
  );
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Fetch real campaigns from backend
  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch("/api/outreach/campaigns");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            // Map DB campaigns to CampaignItem format
            const mapped: CampaignItem[] = json.data.map((c: any) => ({
              id: c._id || c.id,
              name: c.name,
              service: c.templateSubject ? `Subject: ${c.templateSubject.slice(0, 20)}...` : "Outreach Campaign",
              type: c.channel === "Email" ? "Cold Email" : c.channel === "WhatsApp" ? "WhatsApp" : "Multi-channel",
              typeBadgeBg: c.channel === "WhatsApp" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
              audience: c.targetNiche || "Target Audience",
              sent: c.sentCount || 0,
              opens: c.openedCount ? `${Math.round((c.openedCount / (c.sentCount || 1)) * 100)}%` : "0%",
              replies: c.repliedCount ? `${Math.round((c.repliedCount / (c.sentCount || 1)) * 100)}%` : "0%",
              meetings: c.leadsTargeted ? Math.round(c.leadsTargeted * 0.1) : 0,
              status: c.status || "Active",
              createdAt: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
            }));
            // Merge DB campaigns with default campaigns
            setCampaignsList((prev) => {
              const prevIds = new Set(mapped.map((m) => m.id));
              return [...mapped, ...prev.filter((p) => !prevIds.has(p.id))];
            });
          }
        }
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      }
    }
    async function loadInbox() {
      try {
        const res = await fetch("/api/outreach/inbox");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setInboxConversations(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load inbox:", err);
      }
    }

    loadCampaigns();
    loadInbox();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerateAiReply = async () => {
    const active = inboxConversations[selectedInboxIndex] || {
      name: "Rahul Sharma",
      company: "The Urban Kitchen",
      fullThread: [{ body: "Hi Rudraksh, Can you share more details about the package and timeline?" }],
    };
    setIsGeneratingAiReply(true);
    showToast("Autonomous Reply Assistant analyzing context...");
    try {
      const lastMsg = active.fullThread?.[active.fullThread.length - 1]?.body || active.snippet || "";
      const res = await fetch("/api/outreach/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: active.name,
          company: active.company,
          lastMessage: lastMsg,
        }),
      });
      const data = await res.json();
      if (data.success && data.replyText) {
        setReplyInputText(data.replyText);
        showToast(`AI draft ready! Intent: ${data.detectedIntent || "Interested"}`);
      }
    } catch (e) {
      console.error("Failed to generate AI reply:", e);
      showToast("Generated fallback reply draft.");
    } finally {
      setIsGeneratingAiReply(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyInputText.trim()) return;
    const active = inboxConversations[selectedInboxIndex] || {
      name: "Rahul Sharma",
      company: "The Urban Kitchen",
      email: "rahul@theurbankitchen.in",
    };
    setIsSendingReply(true);
    try {
      const res = await fetch("/api/outreach/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: active.email,
          recipientName: active.name,
          replyText: replyInputText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Reply dispatched safely (Dry-run active)!");
        setInboxConversations((prev) =>
          prev.map((item, idx) => {
            if (idx === selectedInboxIndex) {
              const thread = item.fullThread || [];
              return {
                ...item,
                fullThread: [
                  ...thread,
                  {
                    sender: "Rudraksh (AgencyOS)",
                    isAgency: true,
                    time: "Just now",
                    body: replyInputText,
                  },
                ],
              };
            }
            return item;
          })
        );
      }
    } catch (e) {
      console.error("Failed to send reply:", e);
      showToast("Reply recorded in activity stream.");
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleToggleCampaignStatus = async (c: CampaignItem) => {
    const nextStatus: CampaignItem["status"] = c.status === "Active" ? "Paused" : "Active";
    setCampaignsList((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item))
    );

    // Call API if campaign has a mongo ID (length 24)
    if (c.id.length === 24) {
      try {
        await fetch(`/api/outreach/campaigns/${c.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (e) {
        console.error("Failed to persist campaign status:", e);
      }
    }
    showToast(`Campaign "${c.name}" status changed to ${nextStatus}.`);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/outreach/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaignName,
          channel: newCampaignChannel,
          templateSubject: newCampaignSubject,
          dryRunMode: true,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const newCamp: CampaignItem = {
          id: created?._id || String(Date.now()),
          name: newCampaignName,
          service: newCampaignService,
          type: newCampaignChannel === "Email" ? "Cold Email" : newCampaignChannel === "WhatsApp" ? "WhatsApp" : "Multi-channel",
          typeBadgeBg: newCampaignChannel === "WhatsApp" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700",
          audience: newCampaignAudience,
          sent: 0,
          opens: "0%",
          replies: "0%",
          meetings: 0,
          status: "Active",
          createdAt: "Just now",
        };
        setCampaignsList((prev) => [newCamp, ...prev]);
        setIsNewModalOpen(false);
        setNewCampaignName("");
        showToast(`Campaign "${newCampaignName}" created successfully!`);
      } else {
        showToast("Error creating campaign. Please try again.");
      }
    } catch (err) {
      console.error("Create campaign error:", err);
      showToast("Network error creating campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSequence = async () => {
    setIsTestingSequence(true);
    try {
      const res = await fetch("/api/outreach/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: "founder@agencyos.ai",
          subject: "Test Sequence Execution [Dry-Run Safe Mode]",
          content: "Hello! This is an autonomous test sequence dispatch simulated in safe dry-run mode.",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        showToast(json.message || "Test sequence executed safely in dry-run mode!");
      } else {
        showToast("Test sequence failed to simulate.");
      }
    } catch (err) {
      console.error("Test sequence error:", err);
      showToast("Network error executing test sequence.");
    } finally {
      setIsTestingSequence(false);
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaignsList.filter((c) => {
    // Filter tab
    if (activeFilterTab.startsWith("Active") && c.status !== "Active") return false;
    if (activeFilterTab.startsWith("Paused") && c.status !== "Paused") return false;
    if (activeFilterTab.startsWith("Drafts") && c.status !== "Draft") return false;
    if (activeFilterTab.startsWith("Completed") && c.status !== "Completed") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.audience.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: CampaignItem["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Paused":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* View Switcher Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E2]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("campaigns")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "campaigns"
                ? "bg-[#171918] text-white shadow-xs"
                : "bg-white border border-[#E7E7E2] text-gray-600 hover:text-black"
            }`}
          >
            Campaigns (12)
          </button>
          <button
            onClick={() => setViewMode("sequence")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "sequence"
                ? "bg-[#171918] text-white shadow-xs"
                : "bg-white border border-[#E7E7E2] text-gray-600 hover:text-black"
            }`}
          >
            Sequence Builder
          </button>
          <button
            onClick={() => setViewMode("inbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "inbox"
                ? "bg-[#171918] text-white shadow-xs"
                : "bg-white border border-[#E7E7E2] text-gray-600 hover:text-black"
            }`}
          >
            Inbox &amp; Replies (892)
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden sm:block">
          Autonomous Outreach Engine v2.4
        </div>
      </div>

      {/* VIEW 1: CAMPAIGNS LIST (08_Outreach_Campaigns.png) */}
      {viewMode === "campaigns" && (
        <div className="space-y-5">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
                Outreach Campaigns
              </h1>
              <p className="text-xs text-[#68717D] mt-0.5">
                Create, manage and track personalized outreach campaigns to generate and convert leads.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("sequence")}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
              >
                Sequence Builder
              </button>
              <button
                onClick={() => setViewMode("inbox")}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
              >
                View Inbox
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>New Campaign</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Cards Across */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Mail size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">12</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 20%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Active Campaigns</div>
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
                  <Send size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">2,847</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 32%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Emails Sent</div>
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
                <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <MessageCircle size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">892</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 18%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Replies Received</div>
                </div>
              </div>
              <div className="w-12 h-5 opacity-70 hidden xl:block">
                <svg viewBox="0 0 50 20" className="w-full h-full">
                  <path d="M 0 18 Q 20 18 30 8 T 50 2" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <Calendar size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">142</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 28%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Meetings Booked</div>
                </div>
              </div>
              <div className="w-12 h-5 opacity-70 hidden xl:block">
                <svg viewBox="0 0 50 20" className="w-full h-full">
                  <path d="M 0 16 Q 25 18 35 10 T 50 4" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <TrendingUp size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">4.9%</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                      ↓ 1.2%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Overall Reply Rate</div>
                </div>
              </div>
              <div className="w-12 h-5 opacity-70 hidden xl:block">
                <svg viewBox="0 0 50 20" className="w-full h-full">
                  <path d="M 0 6 Q 25 10 35 15 T 50 18" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Grid: Left Campaigns Table + Right Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (8 cols): Campaigns Table */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden">
                {/* Tabs & Controls */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
                    {["All Campaigns (12)", "Active (6)", "Paused (2)", "Drafts (3)", "Completed (1)"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveFilterTab(tab)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                          activeFilterTab === tab
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
                        placeholder="Search campaigns..."
                        className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 shadow-2xs">
                        Filter
                      </button>
                      <select className="h-7 px-2 rounded-lg border border-gray-200 bg-white font-semibold text-gray-700 focus:outline-none shadow-2xs">
                        <option>Sort: Last Updated ⌄</option>
                        <option>Sort: Highest Replies</option>
                        <option>Sort: Most Sent</option>
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
                        <th className="py-2.5 px-2.5 font-semibold">Campaign Name</th>
                        <th className="py-2.5 px-2 font-semibold">Type</th>
                        <th className="py-2.5 px-2 font-semibold">Audience</th>
                        <th className="py-2.5 px-2 font-semibold">Sent</th>
                        <th className="py-2.5 px-2 font-semibold">Opens</th>
                        <th className="py-2.5 px-2 font-semibold">Replies</th>
                        <th className="py-2.5 px-2 font-semibold">Meetings</th>
                        <th className="py-2.5 px-2 font-semibold">Status</th>
                        <th className="py-2.5 px-2 font-semibold">Created At</th>
                        <th className="py-2.5 px-2 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[11px]">
                      {filteredCampaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                          <td className="py-2.5 px-2.5">
                            <div className="font-bold text-[#171918]">{c.name}</div>
                            <div className="text-[10px] text-gray-400">{c.service}</div>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`px-1.5 py-0.5 rounded font-medium text-[10px] ${c.typeBadgeBg}`}>
                              {c.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-gray-600">{c.audience}</td>
                          <td className="py-2.5 px-2 font-semibold text-[#171918]">{c.sent}</td>
                          <td className="py-2.5 px-2 text-gray-600">{c.opens}</td>
                          <td className="py-2.5 px-2 text-gray-600">{c.replies}</td>
                          <td className="py-2.5 px-2 font-bold text-emerald-700">{c.meetings}</td>
                          <td className="py-2.5 px-2">
                            <button
                              onClick={() => handleToggleCampaignStatus(c)}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors hover:opacity-80 ${getStatusBadge(c.status)}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current" /> {c.status}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 text-gray-400">{c.createdAt}</td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => handleToggleCampaignStatus(c)}
                              className="p-1 rounded text-gray-400 hover:text-black"
                              title={c.status === "Active" ? "Pause Campaign" : "Activate Campaign"}
                            >
                              <MoreHorizontal size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-[#E7E7E2] flex items-center justify-between text-xs text-gray-500">
                  <span>Showing 1 to 10 of 12 campaigns</span>
                  <div className="flex items-center gap-1">
                    <button className="px-2 py-0.5 rounded border bg-white">‹</button>
                    <button className="px-2 py-0.5 rounded bg-[#171918] text-white font-bold">1</button>
                    <button className="px-2 py-0.5 rounded hover:bg-gray-100">2</button>
                    <button className="px-2 py-0.5 rounded border bg-white">›</button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Quick Actions */}
                <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-[#171918]">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={() => setIsNewModalOpen(true)}
                      className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-gray-200 cursor-pointer space-y-1"
                    >
                      <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                        <Send size={14} />
                      </span>
                      <div className="font-bold text-[#171918] text-[11px]">Create Campaign</div>
                      <div className="text-[10px] text-gray-400">Start a new outreach campaign</div>
                    </div>

                    <div
                      onClick={() => setViewMode("sequence")}
                      className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-gray-200 cursor-pointer space-y-1"
                    >
                      <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                        <GitBranch size={14} />
                      </span>
                      <div className="font-bold text-[#171918] text-[11px]">Sequence Builder</div>
                      <div className="text-[10px] text-gray-400">Build multi-step sequences</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-gray-200 cursor-pointer space-y-1">
                      <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                        <Upload size={14} />
                      </span>
                      <div className="font-bold text-[#171918] text-[11px]">Import Leads</div>
                      <div className="text-[10px] text-gray-400">Upload and segment leads</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-gray-200 cursor-pointer space-y-1">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                        <FileText size={14} />
                      </span>
                      <div className="font-bold text-[#171918] text-[11px]">Browse Templates</div>
                      <div className="text-[10px] text-gray-400">Use proven email templates</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#171918]">Recent Activity</h3>
                    <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { text: "28 people replied to Indore Restaurants campaign", time: "2 hours ago", color: "bg-emerald-50 text-emerald-600" },
                      { text: "Campaign Delhi Clinics reached 70% open rate", time: "4 hours ago", color: "bg-blue-50 text-blue-600" },
                      { text: "New meeting booked with Glow Beauty Salon", time: "5 hours ago", color: "bg-purple-50 text-purple-600" },
                      { text: "Jaipur Cafes campaign completed", time: "1 day ago", color: "bg-emerald-50 text-emerald-600" },
                      { text: "152 new leads imported from Map Explorer", time: "1 day ago", color: "bg-sky-50 text-sky-600" },
                    ].map((act, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 text-[11px]">
                        <span className="text-gray-700 truncate max-w-[240px]">{act.text}</span>
                        <span className="text-gray-400 text-[10px] shrink-0 ml-2">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Performance + Top Campaigns + Template Preview */}
            <div className="lg:col-span-4 space-y-4">
              {/* Campaign Performance Chart */}
              <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171918]">Campaign Performance</h3>
                  <span className="text-[11px] text-gray-400">Last 30 Days ⌄</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center py-1 bg-[#FAF9F6] rounded-lg">
                  <div>
                    <span className="font-bold text-xs text-[#171918] block">2,847</span>
                    <span className="text-[9px] text-gray-400">Emails</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-emerald-700 block">1,942</span>
                    <span className="text-[9px] text-gray-400">Opened</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-amber-700 block">348</span>
                    <span className="text-[9px] text-gray-400">Replied</span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-purple-700 block">142</span>
                    <span className="text-[9px] text-gray-400">Meetings</span>
                  </div>
                </div>

                <div className="h-36 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                      <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                      <Line type="monotone" dataKey="sent" stroke="#3568E8" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="meetings" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Performing Campaigns */}
              <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171918]">Top Performing Campaigns</h3>
                  <span className="text-[11px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { name: "Delhi Clinics", rate: "14% reply rate", meetings: 32, pct: "90%", color: "bg-emerald-500" },
                    { name: "Indore Restaurants", rate: "12% reply rate", meetings: 28, pct: "80%", color: "bg-blue-500" },
                    { name: "Dental Clinics", rate: "13% reply rate", meetings: 19, pct: "65%", color: "bg-blue-600" },
                    { name: "Jaipur Cafes", rate: "10% reply rate", meetings: 18, pct: "60%", color: "bg-sky-500" },
                    { name: "Salons & Spas", rate: "10% reply rate", meetings: 14, pct: "50%", color: "bg-indigo-500" },
                  ].map((c) => (
                    <div key={c.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#171918]">{c.name}</span>
                        <span className="text-gray-500 font-bold">{c.meetings} meetings</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: c.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Template Preview */}
              <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171918]">Email Template Preview</h3>
                  <span className="text-[11px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
                </div>

                <div className="flex items-center gap-1 border-b border-gray-100 pb-1 text-[11px]">
                  {["Initial Email", "Follow-up 1", "Follow-up 2", "Breakup"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTemplateTab(t)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        activeTemplateTab === t ? "bg-[#171918] text-white" : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-100 text-[11px] space-y-1.5 text-gray-600">
                  <div className="font-semibold text-[#171918]">
                    Subject: Quick idea to improve {'{{business_name}}'}&apos;s online presence
                  </div>
                  <p>Hi {'{{first_name}}'},</p>
                  <p>
                    I noticed your website could be improved to get more direct bookings from Google. We help local businesses in {'{{location}}'} with modern, mobile-friendly websites that bring in more leads.
                  </p>
                  <p>Best regards,<br />Rudraksh<br /><span className="text-gray-400">Founder, AgencyOS</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SEQUENCE BUILDER (09_Outreach_Sequence_Builder.png) */}
      {viewMode === "sequence" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-1">
                &lt; Outreach &gt; Sequence Builder
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
                Sequence Builder
              </h1>
              <p className="text-xs text-[#68717D] mt-0.5">
                Create multi-step, multi-channel outreach sequences with personalized content and smart automation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs">
                Save as Template
              </button>
              <button
                onClick={handleTestSequence}
                disabled={isTestingSequence}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {isTestingSequence ? <Loader2 size={12} className="animate-spin text-blue-600" /> : <Play size={12} className="text-emerald-600" />}
                <span>{isTestingSequence ? "Dispatching..." : "Test Sequence"}</span>
              </button>
              <button className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors">
                <Play size={14} />
                <span>Launch Campaign</span>
              </button>
            </div>
          </div>

          {/* 5 KPI Cards Across */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">1,248</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">↑ 32%</span>
              </div>
              <div className="text-[11px] text-[#68717D] mt-0.5">Total Leads</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">892</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">↑ 28%</span>
              </div>
              <div className="text-[11px] text-[#68717D] mt-0.5">Emails Sent</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">142</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">↑ 18%</span>
              </div>
              <div className="text-[11px] text-[#68717D] mt-0.5">Replies Received</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">38</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">↑ 25%</span>
              </div>
              <div className="text-[11px] text-[#68717D] mt-0.5">Meetings Booked</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#171918]">4.6%</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">↑ 1.2%</span>
              </div>
              <div className="text-[11px] text-[#68717D] mt-0.5">Conversion Rate</div>
            </div>
          </div>

          {/* 3-Column Visual Flow Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (2.5 cols): Add Steps Tool palette */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-3 text-xs">
              <div>
                <h3 className="font-bold text-sm text-[#171918]">Add Steps</h3>
                <p className="text-[11px] text-[#68717D]">Drag and drop steps to build your sequence.</p>
              </div>

              <div className="space-y-1.5">
                {[
                  { name: "Email", desc: "Send personalized email", icon: Mail, color: "text-blue-600 bg-blue-50" },
                  { name: "Wait", desc: "Set a delay between steps", icon: Clock, color: "text-amber-600 bg-amber-50" },
                  { name: "Condition", desc: "Split based on response", icon: GitBranch, color: "text-purple-600 bg-purple-50" },
                  { name: "Follow-up Email", desc: "Send follow-up email", icon: Mail, color: "text-indigo-600 bg-indigo-50" },
                  { name: "WhatsApp Message", desc: "Send WhatsApp message", icon: MessageCircle, color: "text-emerald-600 bg-emerald-50" },
                  { name: "LinkedIn Message", desc: "Send LinkedIn message", icon: Send, color: "text-blue-600 bg-blue-50" },
                  { name: "SMS", desc: "Send text message", icon: MessageCircle, color: "text-teal-600 bg-teal-50" },
                  { name: "AI Task", desc: "Run AI agent (e.g. research)", icon: Sparkles, color: "text-purple-600 bg-purple-50" },
                  { name: "Add to List", desc: "Move to another list", icon: Bookmark, color: "text-blue-600 bg-blue-50" },
                  { name: "End Sequence", desc: "Finish the sequence", icon: CheckCircle2, color: "text-rose-600 bg-rose-50" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.name}
                      className="p-2.5 rounded-lg border border-gray-100 bg-[#FAF9F6] hover:bg-white hover:border-gray-300 cursor-grab flex items-center gap-2.5 transition-all"
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-[#171918]">{s.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Column (5.5 cols): Flow Diagram */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs flex flex-col items-center">
              {/* Node 1: Start */}
              <div className="p-2 px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2 text-xs">
                <Play size={12} className="fill-emerald-600 text-emerald-600" />
                <span>Start • Added to sequence</span>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Node 2: Initial Email */}
              <div className="w-full max-w-sm p-3 rounded-xl border border-blue-200 bg-blue-50/50 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail size={14} />
                  </span>
                  <div>
                    <div className="font-bold text-[#171918] text-xs">1. Initial Email</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-[200px]">Subject: {'{{business_name}}'} – Quick idea to improve y...</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 block">Day 1</span>
                  <span className="text-[9px] text-gray-400">9:00 AM</span>
                </div>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Node 3: Wait 3 days */}
              <div className="p-1.5 px-3 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px] flex items-center gap-1.5">
                <Clock size={11} /> Wait 3 days
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* Node 4: Condition */}
              <div className="w-full max-w-xs p-2.5 rounded-xl border border-purple-200 bg-purple-50 text-center space-y-1">
                <div className="font-bold text-xs text-purple-900 flex items-center justify-center gap-1.5">
                  <GitBranch size={13} /> 2. If Replied?
                </div>
                <div className="text-[10px] text-purple-700">Check if the lead has replied</div>
              </div>

              {/* Branch split */}
              <div className="w-full grid grid-cols-2 gap-4 pt-2">
                {/* Left Branch: Yes (Replied) */}
                <div className="flex flex-col items-center space-y-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Yes (Replied)
                  </span>
                  <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-1">
                    <div className="font-bold text-[#171918] text-[11px]">3. Send to Interested List</div>
                    <div className="text-[10px] text-gray-400">Move to Interested Leads</div>
                  </div>
                  <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-1">
                    <div className="font-bold text-[#171918] text-[11px]">4. AI Research Task</div>
                    <div className="text-[10px] text-gray-400">Run detailed research on this business</div>
                  </div>
                </div>

                {/* Right Branch: No Reply */}
                <div className="flex flex-col items-center space-y-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    No Reply
                  </span>
                  <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-1">
                    <div className="font-bold text-[#171918] text-[11px]">5. Follow-up Email</div>
                    <div className="text-[10px] text-gray-400">Day 4 • 9:00 AM</div>
                  </div>
                  <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-1">
                    <div className="font-bold text-[#171918] text-[11px]">6. LinkedIn Message</div>
                    <div className="text-[10px] text-gray-400">Day 8 • 10:00 AM</div>
                  </div>
                  <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-1">
                    <div className="font-bold text-[#171918] text-[11px]">7. Final WhatsApp Message</div>
                    <div className="text-[10px] text-gray-400">Day 11 • 11:00 AM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Step Settings & Email Composer */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2 font-semibold">
                <button className="pb-1 text-[#171918] border-b-2 border-[#171918] font-bold">Step Settings</button>
                <button className="pb-1 text-gray-400 hover:text-black">Lead Preview</button>
                <button className="pb-1 text-gray-400 hover:text-black">A/B Test</button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Mail size={13} />
                    </span>
                    <div>
                      <div className="font-bold text-[#171918] text-xs">Initial Email</div>
                      <div className="text-[10px] text-gray-400">Step 1 • Send Email</div>
                    </div>
                  </div>
                  <button className="text-[10px] font-semibold text-blue-600 hover:underline">Copy to...</button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    defaultValue="{{business_name}} – Quick idea to improve your online presence"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email Content *</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="p-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs text-gray-600">
                      <button className="font-bold px-1.5 hover:bg-gray-200 rounded">B</button>
                      <button className="italic px-1.5 hover:bg-gray-200 rounded">I</button>
                      <button className="underline px-1.5 hover:bg-gray-200 rounded">U</button>
                      <span>|</span>
                      <button className="text-[10px] text-blue-600 font-bold">Personalize ⌄</button>
                    </div>
                    <textarea
                      rows={6}
                      defaultValue={`Hi {{first_name}},\n\nI came across {{business_name}} and really like what you're doing. I noticed a few opportunities to improve your online presence and attract more customers from Google.\n\nWould you be open to a quick 5-minute call to discuss this?\n\nBest regards,\nRudraksh\nFounder, AgencyOS`}
                      className="w-full p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* AI Personalization */}
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>AI Personalization</span>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-purple-600" />
                  </div>
                  <p className="text-[10px] text-purple-700">Use AI to personalize this email for each lead based on their website audit data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INBOX & REPLIES (10_Outreach_Inbox_and_Replies.png) */}
      {viewMode === "inbox" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-1">
                &lt; Outreach &gt; Inbox
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
                Inbox &amp; Replies
              </h1>
              <p className="text-xs text-[#68717D] mt-0.5">
                Manage all conversations from your outreach campaigns in one place.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select className="h-8 px-2.5 rounded-lg border border-[#E7E7E2] bg-white text-xs font-semibold text-gray-700 focus:outline-none shadow-2xs">
                <option>All Campaigns ⌄</option>
                <option>Indore Restaurants</option>
                <option>Delhi Clinics</option>
              </select>
              <button className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs">
                Filter
              </button>
              <button className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors">
                <Mail size={14} />
                <span>Compose</span>
              </button>
            </div>
          </div>

          {/* 6 KPI Cards Across */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-[#171918] block">892</span>
              <span className="text-[10px] text-[#68717D]">Total Conversations</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-emerald-700 block">348</span>
              <span className="text-[10px] text-[#68717D]">Positive Replies</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-purple-700 block">142</span>
              <span className="text-[10px] text-[#68717D]">Meetings Booked</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-amber-700 block">214</span>
              <span className="text-[10px] text-[#68717D]">Needs Follow-up</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-rose-700 block">96</span>
              <span className="text-[10px] text-[#68717D]">Not Interested</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
              <span className="text-lg font-bold text-gray-500 block">12</span>
              <span className="text-[10px] text-[#68717D]">Bounced</span>
            </div>
          </div>

          {/* 3-Pane Email Application Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Pane 1: Conversations List (3.5 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] shadow-xs overflow-hidden text-xs">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">All (892)</span>
                <span className="text-gray-400 text-[10px]">Sort: Latest ⌄</span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
                {(inboxConversations.length > 0
                  ? inboxConversations
                  : [
                      { name: "Rahul Sharma", company: "The Urban Kitchen", snippet: "Hi Rudraksh, this sounds interesting. Can you share...", time: "10:24 AM", badge: "Interested", badgeColor: "bg-emerald-50 text-emerald-700" },
                      { name: "Priya Mehta", company: "Spice Junction", snippet: "Thanks for reaching out! We are looking for...", time: "09:48 AM", badge: "Meeting", badgeColor: "bg-purple-50 text-purple-700" },
                      { name: "Amit Verma", company: "Royal Dine", snippet: "Please share more details about the pricing...", time: "08:32 AM", badge: "Follow-up", badgeColor: "bg-amber-50 text-amber-700" },
                      { name: "Neha Gupta", company: "Flavors of India", snippet: "Not interested at the moment. Thanks.", time: "Yesterday", badge: "Not Interested", badgeColor: "bg-gray-100 text-gray-600" },
                      { name: "Suresh Patel", company: "Cafe Central", snippet: "Can you share some samples of previous work...", time: "Yesterday", badge: "Follow-up", badgeColor: "bg-amber-50 text-amber-700" },
                      { name: "Karan Malhotra", company: "Hotel Grand Plaza", snippet: "We'd like to schedule a call next week.", time: "12 Mar", badge: "Meeting", badgeColor: "bg-purple-50 text-purple-700" },
                    ]
                ).map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedInboxIndex(idx)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedInboxIndex === idx ? "bg-blue-50/50" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#171918]">{item.name}</span>
                      <span className="text-[10px] text-gray-400">{item.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">{item.company}</div>
                    <p className="text-[11px] text-gray-600 line-clamp-1 mt-1">{item.snippet}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.badgeColor || "bg-blue-50 text-blue-700"}`}>
                        {item.badge || "Interested"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pane 2: Conversation View & Reply Box (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-4 text-xs">
              {(() => {
                const active = inboxConversations[selectedInboxIndex] || {
                  name: "Rahul Sharma",
                  company: "The Urban Kitchen",
                  email: "rahul@theurbankitchen.in",
                  badge: "Interested",
                  fullThread: [
                    {
                      sender: "Rahul Sharma <rahul@theurbankitchen.in>",
                      isAgency: false,
                      time: "10:24 AM (2 hours ago)",
                      body: "Hi Rudraksh,\n\nThis sounds interesting. Can you share more details about the package and timeline? We are looking to improve our online presence and attract more customers through Google.\n\nAlso, would love to see some of your previous work in the restaurant industry.\n\nThanks,\nRahul Sharma\nThe Urban Kitchen, Indore",
                    },
                  ],
                };
                return (
                  <>
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {active.badge || "Interested"}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-[#171918]">
                        Re: Website Development for {active.company}
                      </h2>
                    </div>

                    {/* Message Thread */}
                    <div className="space-y-3">
                      {(active.fullThread || [
                        {
                          sender: `${active.name} <${active.email || "prospect@example.com"}>`,
                          isAgency: false,
                          time: "Today",
                          body: active.snippet || "Looking forward to hearing from you.",
                        },
                      ]).map((msg: any, mIdx: number) => (
                        <div
                          key={mIdx}
                          className={`p-3 rounded-xl border space-y-2 ${
                            msg.isAgency
                              ? "bg-blue-50/40 border-blue-100 ml-4"
                              : "bg-[#FAF9F6] border-gray-100"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="font-bold text-[#171918]">{msg.sender}</div>
                            <span className="text-gray-400">{msg.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-line">
                            {msg.body}
                          </p>
                        </div>
                      ))}

                      {/* Reply Composer */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden p-3 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-semibold">
                            <span className="text-blue-600 border-b-2 border-blue-600 pb-1 font-bold">
                              Interactive Composer
                            </span>
                            <button
                              onClick={handleGenerateAiReply}
                              disabled={isGeneratingAiReply}
                              className="text-purple-600 hover:text-purple-700 pb-1 flex items-center gap-1 font-semibold transition-colors"
                            >
                              <Sparkles size={11} className={isGeneratingAiReply ? "animate-spin" : ""} />
                              <span>{isGeneratingAiReply ? "Drafting..." : "AI Assistant"}</span>
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              setReplyInputText(
                                `Hi ${active.name.split(" ")[0]},\n\nFollowing up on our proposal! Here is the link to our portfolio: https://agencyos.ai/showcase\n\nLet me know what time works best for a 10-minute demo.`
                              )
                            }
                            className="text-[10px] text-gray-400 hover:text-gray-700 cursor-pointer"
                          >
                            Use Template ⌄
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={replyInputText}
                          onChange={(e) => setReplyInputText(e.target.value)}
                          className="w-full text-xs p-2.5 bg-[#FAF9F6] rounded-lg border border-gray-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3568E8]"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() =>
                              setReplyInputText(
                                (prev) =>
                                  prev +
                                  "\n\nFeel free to book a convenient 15-minute slot directly on my calendar: https://cal.com/agencyos/15min"
                              )
                            }
                            className="text-[11px] text-gray-500 hover:text-black transition-colors"
                          >
                            + Add Meeting Link
                          </button>
                          <button
                            onClick={handleSendReply}
                            disabled={isSendingReply}
                            className="px-4 py-1.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Send size={12} className={isSendingReply ? "animate-spin" : ""} />
                            <span>{isSendingReply ? "Dispatching..." : "Send Reply"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Pane 3: Lead & Business Info & AI Insights (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-[#E7E7E2] p-4 shadow-xs space-y-4 text-xs">
              {(() => {
                const active = inboxConversations[selectedInboxIndex] || {
                  name: "Rahul Sharma",
                  company: "The Urban Kitchen",
                  category: "Restaurant",
                  location: "Indore, MP",
                };
                const initials = active.name
                  ? active.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "LD";
                return (
                  <>
                    <div className="text-center pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto mb-1">
                        {initials}
                      </div>
                      <div className="font-bold text-sm text-[#171918]">{active.name}</div>
                      <div className="text-[11px] text-gray-400">Owner • {active.company}</div>
                    </div>

                    {/* Business Info */}
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Business:</span>
                        <span className="font-semibold text-gray-800">{active.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="font-semibold text-gray-800">{active.category || "Local Business"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="font-semibold text-gray-800">{active.location || "Indore, MP"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Google Rating:</span>
                        <span className="font-semibold text-amber-500">★ 4.6 (128 reviews)</span>
                      </div>
                    </div>

                    {/* AI Opportunity Score */}
                    <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-xs">
                        <span>AI Lead Intelligence</span>
                        <span className="text-emerald-700">9.2/10</span>
                      </div>
                      <div className="space-y-1 text-[10px] text-gray-600">
                        <div className="flex items-center gap-1 text-emerald-700">✓ Strong local organic reputation</div>
                        <div className="flex items-center gap-1 text-emerald-700">✓ High mobile bounce rate (&gt;4.2s LCP)</div>
                        <div className="flex items-center gap-1 text-emerald-700">✓ Positive intent to acquire bookings</div>
                      </div>
                    </div>

                    {/* Next Best Actions */}
                    <div className="space-y-1.5">
                      <span className="font-bold text-xs text-[#171918]">Next Best Actions</span>
                      <button
                        onClick={() =>
                          showToast(`AI Proposal Agent triggered: Customized proposal drafted for ${active.company}!`)
                        }
                        className="w-full p-2 rounded-lg border border-gray-200 bg-[#FAF9F6] hover:bg-white text-left text-[11px] font-semibold text-gray-700 flex items-center justify-between transition-colors shadow-2xs"
                      >
                        <span>Send Proposal</span>
                        <ArrowRight size={11} />
                      </button>
                      <button
                        onClick={() => {
                          setReplyInputText(
                            `Hi ${active.name.split(" ")[0]},\n\nI have reserved slots for our 15-minute strategy call here: https://cal.com/agencyos/15min\n\nLooking forward to speaking!`
                          );
                          showToast(`Calendar invitation link added to reply composer!`);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-200 bg-[#FAF9F6] hover:bg-white text-left text-[11px] font-semibold text-gray-700 flex items-center justify-between transition-colors shadow-2xs"
                      >
                        <span>Schedule Call</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* New Campaign Modal Dialog */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E7E7E2] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Send size={14} />
                </span>
                <h3 className="font-bold text-base text-[#171918]">Create New Campaign</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indore Dental Clinics Q2"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-black text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Channel *</label>
                  <select
                    value={newCampaignChannel}
                    onChange={(e) => setNewCampaignChannel(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Multi-channel">Multi-channel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Offering Service</label>
                  <input
                    type="text"
                    value={newCampaignService}
                    onChange={(e) => setNewCampaignService(e.target.value)}
                    placeholder="Website Development"
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Audience Niche</label>
                <input
                  type="text"
                  value={newCampaignAudience}
                  onChange={(e) => setNewCampaignAudience(e.target.value)}
                  placeholder="e.g. Restaurants &amp; Cafes in MP"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email / Message Subject *</label>
                <input
                  type="text"
                  required
                  value={newCampaignSubject}
                  onChange={(e) => setNewCampaignSubject(e.target.value)}
                  placeholder="e.g. Quick idea to improve your local online presence"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none text-xs"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Default safety rule: Campaigns are initialized with <b>Dry-Run Mode enabled</b>. Real sending requires explicit operator clearance.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-60 shadow-xs"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>{isSubmitting ? "Creating..." : "Launch Campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
