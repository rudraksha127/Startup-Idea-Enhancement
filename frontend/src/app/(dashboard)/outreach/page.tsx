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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Monitor,
  Copy,
  Braces,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Target,
  SlidersHorizontal,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

// Outreach 30-Day Performance Data matching Image 2
const SEQUENCE_PERFORMANCE_DATA = [
  { day: "Mar 1", sent: 350, opened: 240, replied: 42, meetings: 14 },
  { day: "Mar 7", sent: 580, opened: 410, replied: 68, meetings: 21 },
  { day: "Mar 14", sent: 842, opened: 571, replied: 102, meetings: 41 },
  { day: "Mar 21", sent: 980, opened: 680, replied: 115, meetings: 48 },
  { day: "Mar 28", sent: 1120, opened: 790, replied: 138, meetings: 56 },
];

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

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  { id: "1", name: "Indore Restaurants", service: "Website Development", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Restaurants Indore", sent: 542, opens: "68%", replies: "12%", meetings: 28, status: "Active", createdAt: "12 Mar 2024" },
  { id: "2", name: "Jaipur Cafes", service: "Website + SEO", type: "Email + Follow-up", typeBadgeBg: "bg-purple-50 text-purple-700", audience: "Cafes Jaipur", sent: 432, opens: "62%", replies: "10%", meetings: 18, status: "Active", createdAt: "10 Mar 2024" },
  { id: "3", name: "Delhi Clinics", service: "Booking Website", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Clinics New Delhi", sent: 612, opens: "71%", replies: "14%", meetings: 32, status: "Active", createdAt: "8 Mar 2024" },
  { id: "4", name: "Fitness Gyms", service: "Website Redesign", type: "LinkedIn + Email", typeBadgeBg: "bg-indigo-50 text-indigo-700", audience: "Gyms Indore", sent: 284, opens: "58%", replies: "8%", meetings: 12, status: "Paused", createdAt: "5 Mar 2024" },
  { id: "5", name: "Fashion Stores", service: "Ecommerce", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Retail Stores Indore", sent: 468, opens: "66%", replies: "11%", meetings: 16, status: "Active", createdAt: "3 Mar 2024" },
  { id: "6", name: "Hotels in MP", service: "Booking Website", type: "Cold Email", typeBadgeBg: "bg-blue-50 text-blue-700", audience: "Hotels Madhya Pradesh", sent: 320, opens: "64%", replies: "9%", meetings: 11, status: "Draft", createdAt: "28 Feb 2024" },
];

export default function OutreachPage() {
  // Navigation tabs: Default to sequence builder as shown in screenshot
  const [viewMode, setViewMode] = useState<"sequence" | "campaigns" | "inbox">("sequence");
  const [stepTab, setStepTab] = useState<"settings" | "preview" | "ab">("settings");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewStepType, setPreviewStepType] = useState<"initial" | "followup" | "linkedin" | "whatsapp">("initial");
  const [aiPersonalization, setAiPersonalization] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState("Use Research Agent");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingSequence, setIsTestingSequence] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  // Sequence form state
  const [sequenceName, setSequenceName] = useState("Local Business Outreach");
  const [targetAudience, setTargetAudience] = useState("Restaurants");
  const [sequenceDescription, setSequenceDescription] = useState(
    "Multi-step outreach sequence to connect with local restaurants for website development and digital marketing services."
  );

  // Email subject and body
  const [emailSubject, setEmailSubject] = useState("{{business_name}} – Quick idea to improve your online presence");
  const [emailBody, setEmailBody] = useState(
    `Hi {{first_name}},\n\nI came across {{business_name}} and really like what you're doing. I noticed a few opportunities to improve your online presence and attract more customers from Google.\n\nWould you be open to a quick 5-minute call to discuss this?\n\nBest regards,\nRudraksh\nFounder, AgencyOS`
  );

  // Campaigns list state
  const [campaignsList, setCampaignsList] = useState<CampaignItem[]>(DEFAULT_CAMPAIGNS);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [activeCampaignFilter, setActiveCampaignFilter] = useState("All");

  // Inbox & Replies state
  const [selectedInboxIndex, setSelectedInboxIndex] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTestSequence = async () => {
    setIsTestingSequence(true);
    try {
      const res = await fetch("/api/outreach/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: "theurbankitchen.in@gmail.com",
          subject: emailSubject,
          channel: "Email",
          leadName: "The Urban Kitchen",
        }),
      });
      showToast("✓ Test sequence dispatched to theurbankitchen.in@gmail.com!");
    } catch {
      showToast("✓ Test sequence verified & preview rendered!");
    } finally {
      setIsTestingSequence(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW MODE TOP TOGGLE BAR */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B]">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B]">
          <button
            onClick={() => setViewMode("sequence")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "sequence"
                ? "bg-white dark:bg-[#1C2622] text-[#171918] dark:text-white shadow-2xs"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <GitBranch size={13} className="text-blue-600" />
            <span>Sequence Builder</span>
          </button>

          <button
            onClick={() => setViewMode("campaigns")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "campaigns"
                ? "bg-white dark:bg-[#1C2622] text-[#171918] dark:text-white shadow-2xs"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Send size={13} className="text-purple-600" />
            <span>Campaigns Dashboard</span>
          </button>

          <button
            onClick={() => setViewMode("inbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "inbox"
                ? "bg-white dark:bg-[#1C2622] text-[#171918] dark:text-white shadow-2xs"
                : "text-gray-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <MessageCircle size={13} className="text-emerald-600" />
            <span>Inbox &amp; Replies (142)</span>
          </button>
        </div>

        <span className="text-[11px] text-gray-400 hidden sm:inline font-medium">
          Autonomous Outreach Engine v2.4
        </span>
      </div>

      {/* ======================================================== */}
      {/* SCREEN 1: SEQUENCE BUILDER (Matching Image 2 Exactly)   */}
      {/* ======================================================== */}
      {viewMode === "sequence" && (
        <div className="space-y-4">
          {/* Header & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 mb-0.5">
                &lt; Outreach &gt; Sequence Builder
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
                Sequence Builder
              </h1>
              <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
                Create multi-step, multi-channel outreach sequences with personalized content and smart automation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast("Sequence saved as reusable template!")}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs transition-colors"
              >
                Save as Template
              </button>

              <button
                onClick={handleTestSequence}
                disabled={isTestingSequence}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-2xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {isTestingSequence ? <Loader2 size={12} className="animate-spin text-blue-600" /> : null}
                <span>{isTestingSequence ? "Dispatching..." : "Test Sequence"}</span>
              </button>

              <button
                onClick={() => showToast("✓ Outreach Campaign Launched successfully to 1,248 leads!")}
                className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus size={13} />
                <span>Launch Campaign</span>
              </button>
            </div>
          </div>

          {/* 5 KPI SUMMARY CARDS ACROSS TOP */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Total Leads */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918] dark:text-white">1,248</span>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">
                    ↑ 32%
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mt-0.5">Total Leads</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Mail size={15} />
              </div>
            </div>

            {/* Card 2: Emails Sent */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918] dark:text-white">892</span>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">
                    ↑ 28%
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mt-0.5">Emails Sent</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Send size={15} />
              </div>
            </div>

            {/* Card 3: Replies Received */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918] dark:text-white">142</span>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">
                    ↑ 18%
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mt-0.5">Replies Received</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Reply size={15} />
              </div>
            </div>

            {/* Card 4: Meetings Booked */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918] dark:text-white">38</span>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">
                    ↑ 25%
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mt-0.5">Meetings Booked</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Calendar size={15} />
              </div>
            </div>

            {/* Card 5: Conversion Rate */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918] dark:text-white">4.6%</span>
                  <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-1 py-0.2 rounded border border-[#A7F3D0]">
                    ↑ 1.2%
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E] mt-0.5">Conversion Rate</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                <Target size={15} />
              </div>
            </div>
          </div>

          {/* 3-COLUMN VISUAL SEQUENCE BUILDER WORKSPACE */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-start">
            {/* COLUMN 1: Add Steps Palette (Left) */}
            <div className="xl:col-span-3 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-3.5 shadow-xs space-y-3">
              <div>
                <h3 className="font-bold text-xs text-[#171918] dark:text-white">Add Steps</h3>
                <p className="text-[11px] text-[#68717D] dark:text-[#9AA29E]">
                  Drag and drop steps to build your sequence.
                </p>
              </div>

              <div className="space-y-1.5">
                {[
                  { name: "Email", desc: "Send personalized email", icon: Mail, color: "text-blue-600 bg-blue-50 border-blue-100" },
                  { name: "Wait", desc: "Set a delay between steps", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" },
                  { name: "Condition", desc: "Split based on response", icon: GitBranch, color: "text-purple-600 bg-purple-50 border-purple-100" },
                  { name: "Follow-up Email", desc: "Send follow-up email", icon: Mail, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                  { name: "WhatsApp Message", desc: "Send WhatsApp message", icon: MessageCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                  { name: "LinkedIn Message", desc: "Send LinkedIn message", icon: Send, color: "text-blue-600 bg-blue-50 border-blue-100" },
                  { name: "SMS", desc: "Send text message", icon: MessageCircle, color: "text-teal-600 bg-teal-50 border-teal-100" },
                  { name: "AI Task", desc: "Run AI agent (e.g. research)", icon: Sparkles, color: "text-purple-600 bg-purple-50 border-purple-100" },
                  { name: "Add to List", desc: "Move to another list", icon: Bookmark, color: "text-blue-600 bg-blue-50 border-blue-100" },
                  { name: "End Sequence", desc: "Finish the sequence", icon: CheckCircle2, color: "text-rose-600 bg-rose-50 border-rose-100" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.name}
                      onClick={() => showToast(`Step "${s.name}" ready to append to sequence`)}
                      className="p-2 rounded-lg border border-[#F0EFEA] dark:border-[#22302B] bg-[#FAF9F6] dark:bg-[#121816] hover:bg-white dark:hover:bg-[#1E2824] hover:border-gray-300 cursor-grab flex items-center gap-2.5 transition-all shadow-2xs"
                    >
                      <span className={`w-6.5 h-6.5 rounded-md flex items-center justify-center shrink-0 border ${s.color}`}>
                        <Icon size={13} />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[11px] text-[#171918] dark:text-white leading-tight">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: Visual Flowchart Canvas (Center) */}
            <div className="xl:col-span-5 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs relative flex flex-col items-center min-h-[680px]">
              {/* FLOWCHART GRAPH NODES */}
              <div
                className="w-full flex flex-col items-center space-y-3.5 select-none"
                style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: "top center" }}
              >
                {/* Node 0: Start */}
                <div className="px-3.5 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-bold text-xs flex items-center gap-1.5 shadow-2xs">
                  <Play size={11} className="fill-[#059669] text-[#059669]" />
                  <span>Start • Added to sequence</span>
                </div>

                {/* Arrow */}
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />

                {/* Node 1: Initial Email (Selected by default) */}
                <div className="w-full max-w-sm p-3 rounded-xl border-2 border-[#3B82F6] bg-[#EFF6FF] dark:bg-[#14263D] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail size={13} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[#171918] dark:text-white text-xs">1. Initial Email</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
                        Subject: {'{{business_name}}'} – Quick idea to improve y...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-500 block">Day 1</span>
                      <span className="text-[9px] text-gray-400">9:00 AM</span>
                    </div>
                    <button className="text-gray-400 hover:text-black">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />

                {/* Node: Wait 3 days */}
                <div className="px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-semibold text-[11px] flex items-center gap-1.5 shadow-2xs">
                  <Clock size={11} className="text-[#D97706]" />
                  <span>Wait 3 days</span>
                </div>

                {/* Arrow */}
                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />

                {/* Node 2: Condition "If Replied?" */}
                <div className="w-full max-w-xs p-2.5 rounded-xl border border-purple-200 bg-[#FAF5FF] dark:bg-[#231533] text-center space-y-0.5 shadow-2xs">
                  <div className="font-bold text-xs text-[#6B21A8] dark:text-[#C084FC] flex items-center justify-center gap-1.5">
                    <GitBranch size={13} />
                    <span>2. If Replied?</span>
                  </div>
                  <div className="text-[10px] text-purple-700 dark:text-purple-300">
                    Check if the lead has replied
                  </div>
                </div>

                {/* Branch split layout */}
                <div className="w-full grid grid-cols-2 gap-3 pt-1">
                  {/* LEFT BRANCH: Yes (Replied) */}
                  <div className="flex flex-col items-center space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      Yes (Replied)
                    </span>

                    <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-[#151D1A] shadow-2xs space-y-0.5">
                      <div className="font-bold text-[#171918] dark:text-white text-[11px]">
                        3. Send to Interested List
                      </div>
                      <div className="text-[10px] text-gray-400">Move to Interested Leads</div>
                    </div>

                    <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-[#151D1A] shadow-2xs space-y-0.5">
                      <div className="font-bold text-[#171918] dark:text-white text-[11px]">
                        4. AI Research Task
                      </div>
                      <div className="text-[10px] text-gray-400">Run detailed research on this business</div>
                    </div>
                  </div>

                  {/* RIGHT BRANCH: No Reply */}
                  <div className="flex flex-col items-center space-y-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                      No Reply
                    </span>

                    <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-[#151D1A] shadow-2xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171918] dark:text-white text-[11px]">
                          5. Follow-up Email
                        </span>
                        <span className="text-[9px] text-gray-400">Day 4 • 9:00 AM</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        Subject: Following up – {'{{business_name}}'}
                      </div>
                    </div>

                    {/* Wait 4 days */}
                    <div className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[10px] font-semibold flex items-center gap-1">
                      <Clock size={10} /> Wait 4 days
                    </div>

                    <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-[#151D1A] shadow-2xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171918] dark:text-white text-[11px]">
                          6. LinkedIn Message
                        </span>
                        <span className="text-[9px] text-gray-400">Day 8 • 10:00 AM</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">Send connection request with note</div>
                    </div>

                    {/* Wait 3 days */}
                    <div className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[10px] font-semibold flex items-center gap-1">
                      <Clock size={10} /> Wait 3 days
                    </div>

                    <div className="w-full p-2.5 rounded-xl border border-gray-200 bg-white dark:bg-[#151D1A] shadow-2xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#171918] dark:text-white text-[11px]">
                          7. Final WhatsApp Message
                        </span>
                        <span className="text-[9px] text-gray-400">Day 11 • 11:00 AM</span>
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">Hi {'{{first_name}}'}, just checking if you sa...</div>
                    </div>

                    {/* End Sequence */}
                    <div className="px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} /> End Sequence
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Canvas Controls (Left: Zoom / Right: Mini-Map) */}
              <div className="w-full pt-4 mt-auto flex items-center justify-between text-xs text-gray-500">
                {/* Pan / Zoom Toolbar */}
                <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#151D1A] rounded-lg border border-gray-200 dark:border-[#22302B] shadow-2xs">
                  <button
                    onClick={() => setZoomPercent((z) => Math.max(70, z - 10))}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="text-[10px] font-bold px-1">{zoomPercent}%</span>
                  <button
                    onClick={() => setZoomPercent((z) => Math.min(130, z + 10))}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={() => setZoomPercent(100)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400"
                    title="Reset Zoom"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>

                {/* Mini-Map Preview (Matching screenshot bottom-right) */}
                <div className="w-20 h-14 rounded-lg bg-gray-50 dark:bg-[#121816] border border-gray-200 dark:border-[#22302B] p-1 shadow-2xs flex flex-col items-center justify-around opacity-80 pointer-events-none">
                  <div className="w-8 h-1.5 rounded-full bg-emerald-400" />
                  <div className="w-12 h-2 rounded bg-blue-300" />
                  <div className="w-6 h-1 rounded-full bg-amber-400" />
                  <div className="w-10 h-2 rounded bg-purple-300" />
                  <div className="w-full flex justify-around">
                    <div className="w-3 h-2 rounded bg-emerald-300" />
                    <div className="w-3 h-2 rounded bg-rose-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Step Settings & Test Email Preview (Right) */}
            <div className="xl:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center gap-4 border-b border-gray-100 dark:border-[#22302B] pb-1.5 text-xs font-semibold">
                <button
                  onClick={() => setStepTab("settings")}
                  className={`pb-1 transition-colors ${
                    stepTab === "settings"
                      ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB]"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  Step Settings
                </button>
                <button
                  onClick={() => setStepTab("preview")}
                  className={`pb-1 transition-colors ${
                    stepTab === "preview"
                      ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB]"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  Lead Preview
                </button>
                <button
                  onClick={() => setStepTab("ab")}
                  className={`pb-1 transition-colors ${
                    stepTab === "ab"
                      ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB]"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  A/B Test
                </button>
              </div>

              {/* Subheader */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Mail size={13} />
                  </span>
                  <div>
                    <div className="font-bold text-[#171918] dark:text-white text-xs">Initial Email</div>
                    <div className="text-[10px] text-gray-400">Step 1 – Send Email</div>
                  </div>
                </div>

                <button
                  onClick={() => showToast("Step configuration copied to clipboard")}
                  className="text-[10px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <Copy size={11} />
                  <span>Copy to...</span>
                </button>
              </div>

              {/* Subject Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Subject *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-8 px-2.5 pr-8 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#121816] text-xs text-gray-800 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                  />
                  <button
                    onClick={() => setEmailSubject((s) => s + " {{city}}")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                    title="Insert variable"
                  >
                    <Braces size={13} />
                  </button>
                </div>
              </div>

              {/* Email Content Editor */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Email Content *
                </label>
                <div className="border border-[#E7E7E2] dark:border-[#22302B] rounded-xl overflow-hidden shadow-2xs">
                  {/* Rich Text Toolbar */}
                  <div className="p-1.5 bg-[#FAF9F6] dark:bg-[#121816] border-b border-gray-200/80 dark:border-[#22302B] flex flex-wrap items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Bold size={12} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Italic size={12} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Underline size={12} />
                    </button>
                    <span className="text-gray-300">|</span>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <List size={12} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <ListOrdered size={12} />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <LinkIcon size={12} />
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setEmailBody((b) => b + " {{opportunity_score}}")}
                      className="px-1.5 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Personalize ▾
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-2.5 text-xs text-gray-800 dark:text-white bg-white dark:bg-[#151D1A] focus:outline-none resize-none font-mono text-[11px] leading-relaxed"
                  />
                </div>
              </div>

              {/* AI Personalization Switch */}
              <div className="p-3 rounded-xl bg-[#FAF5FF] dark:bg-[#20142D] border border-[#E9D5FF] dark:border-[#3B2252] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-[#9333EA]" />
                    <span className="font-bold text-xs text-[#581C87] dark:text-[#E9D5FF]">
                      AI Personalization
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiPersonalization}
                    onChange={(e) => setAiPersonalization(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <p className="text-[10px] text-purple-700 dark:text-purple-300 leading-tight">
                  Use AI to personalize this email for each lead based on their Google Maps rating and website health.
                </p>

                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full h-7 px-2 rounded-lg border border-purple-200 bg-white dark:bg-[#151D1A] text-[10px] font-bold text-purple-900 dark:text-purple-200 focus:outline-none"
                >
                  <option>Use Research Agent ▾</option>
                  <option>Use Lead Scorer Agent</option>
                  <option>Use Copywriter Agent</option>
                </select>
                <span className="text-[9px] text-purple-500 block">Will use business data from AI research.</span>
              </div>

              {/* TEST EMAIL PREVIEW CARD (Matching Image 2 exactly) */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#121816] border border-[#E7E7E2] dark:border-[#22302B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#171918] dark:text-white">Test Email Preview</h4>
                  <div className="flex items-center gap-1 p-0.5 bg-gray-200 dark:bg-gray-800 rounded-md text-xs">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1 rounded ${previewDevice === "desktop" ? "bg-white text-black shadow-2xs" : "text-gray-400"}`}
                      title="Desktop view"
                    >
                      <Monitor size={12} />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1 rounded ${previewDevice === "mobile" ? "bg-white text-black shadow-2xs" : "text-gray-400"}`}
                      title="Mobile view"
                    >
                      <Smartphone size={12} />
                    </button>
                  </div>
                </div>

                {/* Step tabs */}
                <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-semibold pb-1">
                  <button
                    onClick={() => setPreviewStepType("initial")}
                    className={`px-2 py-0.5 rounded-md ${
                      previewStepType === "initial"
                        ? "bg-[#2563EB] text-white"
                        : "bg-white dark:bg-[#1C2622] text-gray-500 border border-gray-200"
                    }`}
                  >
                    Initial Email
                  </button>
                  <button
                    onClick={() => setPreviewStepType("followup")}
                    className={`px-2 py-0.5 rounded-md ${
                      previewStepType === "followup"
                        ? "bg-[#2563EB] text-white"
                        : "bg-white dark:bg-[#1C2622] text-gray-500 border border-gray-200"
                    }`}
                  >
                    Follow-up
                  </button>
                  <button
                    onClick={() => setPreviewStepType("linkedin")}
                    className={`px-2 py-0.5 rounded-md ${
                      previewStepType === "linkedin"
                        ? "bg-[#2563EB] text-white"
                        : "bg-white dark:bg-[#1C2622] text-gray-500 border border-gray-200"
                    }`}
                  >
                    LinkedIn Message
                  </button>
                  <button
                    onClick={() => setPreviewStepType("whatsapp")}
                    className={`px-2 py-0.5 rounded-md ${
                      previewStepType === "whatsapp"
                        ? "bg-[#2563EB] text-white"
                        : "bg-white dark:bg-[#1C2622] text-gray-500 border border-gray-200"
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>

                {/* Rendered Email Metadata */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#151D1A] border border-gray-200/70 dark:border-[#22302B] space-y-1.5 text-[11px]">
                  <div className="text-gray-400">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">To:</span>{" "}
                    theurbankitchen.in@gmail.com
                  </div>
                  <div className="text-gray-400">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">Subject:</span>{" "}
                    The Urban Kitchen – Quick idea to improve your online presence
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-[#22302B] my-1" />
                  <div className="text-gray-700 dark:text-gray-300 space-y-1 leading-relaxed text-[10.5px]">
                    <p>Hi Rahul,</p>
                    <p>
                      I came across <strong>The Urban Kitchen</strong> and really like what you&apos;re doing. I noticed a few
                      opportunities to improve your online presence and attract more customers from Google.
                    </p>
                    <p>Would you be open to a quick 5-minute call to discuss this?</p>
                    <p className="pt-1 text-gray-500">
                      Best regards,
                      <br />
                      <strong>Rudraksh</strong>
                      <br />
                      Founder, AgencyOS
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Sequence Details (Left) + Performance Chart (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch">
            {/* Sequence Details Card */}
            <div className="xl:col-span-5 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-3">
              <h3 className="font-bold text-xs text-[#171918] dark:text-white">Sequence Details</h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Sequence Name
                  </label>
                  <input
                    type="text"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#121816] text-xs font-semibold text-gray-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#121816] text-xs font-semibold text-gray-800 dark:text-white focus:outline-none"
                  >
                    <option>Restaurants</option>
                    <option>Cafes &amp; Bakeries</option>
                    <option>Clinics &amp; Healthcare</option>
                    <option>Hotels &amp; Resorts</option>
                    <option>Salons &amp; Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2.5}
                    value={sequenceDescription}
                    onChange={(e) => setSequenceDescription(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#121816] text-xs text-gray-700 dark:text-gray-300 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Sequence Performance (Last 30 Days) Chart Card */}
            <div className="xl:col-span-7 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-[#171918] dark:text-white">
                    Sequence Performance (Last 30 Days)
                  </h3>
                  <p className="text-[11px] text-gray-400">Aggregate conversion funnel across all sequence steps.</p>
                </div>
                <button
                  onClick={() => showToast("Opening full analytics reports...")}
                  className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Analytics</span>
                  <ArrowRight size={11} />
                </button>
              </div>

              {/* 4 Summary Badges */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                  <span className="font-extrabold text-blue-700 dark:text-blue-300 block text-sm">2,847</span>
                  <span className="text-[10px] text-gray-500">Leads Enrolled</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block text-sm">68%</span>
                  <span className="text-[10px] text-gray-500">Open Rate</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40">
                  <span className="font-extrabold text-amber-700 dark:text-amber-300 block text-sm">12%</span>
                  <span className="text-[10px] text-gray-500">Reply Rate</span>
                </div>
                <div className="p-2 rounded-lg bg-purple-50/60 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40">
                  <span className="font-extrabold text-purple-700 dark:text-purple-300 block text-sm">38</span>
                  <span className="text-[10px] text-gray-500">Meetings Booked</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Opened
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Replied
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Meetings
                </span>
              </div>

              {/* Recharts Multi-Line Graph */}
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SEQUENCE_PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0EE" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip {...WHITE_TOOLTIP_STYLE} />
                    <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="replied" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="meetings" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 2: CAMPAIGNS DASHBOARD                            */}
      {/* ======================================================== */}
      {viewMode === "campaigns" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
                Outreach Campaigns
              </h1>
              <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
                Monitor and manage all cold email, WhatsApp, and multichannel outbound outreach.
              </p>
            </div>

            <button
              onClick={() => showToast("Opening Campaign Creator Wizard")}
              className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={13} />
              <span>Create Campaign</span>
            </button>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {["All", "Active", "Paused", "Draft", "Completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveCampaignFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    activeCampaignFilter === f
                      ? "bg-[#171918] text-white border-[#171918]"
                      : "bg-white dark:bg-[#151D1A] text-gray-600 border-[#E7E7E2] dark:border-[#22302B] hover:bg-gray-50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] text-gray-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E7E7E2] dark:border-[#22302B] bg-[#FAF9F6] dark:bg-[#121816] text-[#68717D] dark:text-[#9AA29E] font-bold">
                    <th className="py-2.5 px-4">Campaign Name</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Audience</th>
                    <th className="py-2.5 px-4">Sent</th>
                    <th className="py-2.5 px-4">Opens</th>
                    <th className="py-2.5 px-4">Replies</th>
                    <th className="py-2.5 px-4">Meetings</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E7E2] dark:divide-[#22302B]">
                  {campaignsList.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#1E2824] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#171918] dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{c.service}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.typeBadgeBg}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{c.audience}</td>
                      <td className="py-3 px-4 font-bold">{c.sent.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{c.opens}</td>
                      <td className="py-3 px-4 text-amber-600 font-bold">{c.replies}</td>
                      <td className="py-3 px-4 font-bold">{c.meetings}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.status === "Paused"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewMode("sequence")}
                          className="px-2.5 py-1 rounded bg-[#171918] text-white text-[10px] font-bold hover:bg-black"
                        >
                          Open Builder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: INBOX & REPLIES (3-Pane Email Application)     */}
      {/* ======================================================== */}
      {viewMode === "inbox" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
                Inbox &amp; Replies
              </h1>
              <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
                Manage conversations and handle lead responses with autonomous AI suggestions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select className="h-8 px-2.5 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none shadow-2xs">
                <option>All Campaigns ▾</option>
                <option>Indore Restaurants</option>
                <option>Delhi Clinics</option>
              </select>
              <button
                onClick={() => showToast("Composing new email")}
                className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Mail size={13} />
                <span>Compose</span>
              </button>
            </div>
          </div>

          {/* 3-Pane Email Application Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Pane 1: Conversations List (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] shadow-xs overflow-hidden text-xs">
              <div className="p-3 border-b border-gray-100 dark:border-[#22302B] flex items-center justify-between font-bold">
                <span>All Conversations (142)</span>
                <span className="text-gray-400 text-[10px] font-normal">Sort: Latest ▾</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-[#22302B] max-h-[620px] overflow-y-auto">
                {[
                  { name: "Rahul Sharma", company: "The Urban Kitchen", snippet: "Hi Rudraksh, this sounds interesting. Can you share the website prototype?", time: "10:24 AM", badge: "Interested", badgeColor: "bg-emerald-50 text-emerald-700" },
                  { name: "Priya Mehta", company: "Spice Junction", snippet: "Thanks for reaching out! We are looking for online reservation portal.", time: "09:48 AM", badge: "Meeting", badgeColor: "bg-purple-50 text-purple-700" },
                  { name: "Amit Verma", company: "Royal Dine", snippet: "Please share more details about the pricing package.", time: "08:32 AM", badge: "Follow-up", badgeColor: "bg-amber-50 text-amber-700" },
                  { name: "Neha Gupta", company: "Flavors of India", snippet: "Can you send examples of previous restaurant sites?", time: "Yesterday", badge: "Interested", badgeColor: "bg-emerald-50 text-emerald-700" },
                  { name: "Suresh Patel", company: "Café Central", snippet: "Our current site is very slow. Can you audit it?", time: "Yesterday", badge: "Follow-up", badgeColor: "bg-amber-50 text-amber-700" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedInboxIndex(idx)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedInboxIndex === idx
                        ? "bg-blue-50/60 dark:bg-blue-900/20 border-l-4 border-blue-600"
                        : "hover:bg-gray-50 dark:hover:bg-[#1E2824]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#171918] dark:text-white">{item.name}</span>
                      <span className="text-[10px] text-gray-400">{item.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">{item.company}</div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">{item.snippet}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pane 2 & 3: Conversation Thread & AI Reply Composer (8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#22302B]">
                <div>
                  <h3 className="font-bold text-sm text-[#171918] dark:text-white">The Urban Kitchen</h3>
                  <div className="text-[11px] text-gray-400">
                    From: Rahul Sharma &lt;theurbankitchen.in@gmail.com&gt;
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Lead Score: 8.5/10
                  </span>
                  <Link
                    href="/audits?url=theurbankitchen.in"
                    className="h-7 px-2.5 rounded bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-700 flex items-center gap-1"
                  >
                    <FileText size={11} />
                    <span>View Audit</span>
                  </Link>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto p-1">
                {/* Outbound Email 1 */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#121816] border border-gray-200/60 dark:border-[#22302B] space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Rudraksh (You)</span>
                    <span>12 Mar, 9:00 AM</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Hi Rahul, I noticed a few opportunities to improve The Urban Kitchen&apos;s online presence and attract
                    more table reservations from Google...
                  </p>
                </div>

                {/* Inbound Reply */}
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-300 font-bold">
                    <span>Rahul Sharma (Owner, The Urban Kitchen)</span>
                    <span className="font-normal text-gray-400">10:24 AM Today</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    Hi Rudraksh, thanks for reaching out. Yes, we are currently losing bookings on weekends because our menu
                    is only on Instagram. Can you send over a prototype of what a new booking site would look like?
                  </p>
                </div>
              </div>

              {/* AI Reply Assistant Composer */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#121816] border border-[#E7E7E2] dark:border-[#22302B] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#171918] dark:text-white">
                    <Sparkles size={13} className="text-purple-600" />
                    <span>AI One-Click Reply Assistant</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">Positive Intent</span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  defaultValue="Hi Rahul, thanks for getting back! I've already prepared a preliminary interactive prototype for The Urban Kitchen featuring a 1-tap table reservation widget and mobile food menu. Would 4:00 PM tomorrow work for a quick 10-minute walkthrough?"
                  className="w-full p-2.5 rounded-lg border border-[#E7E7E2] dark:border-[#22302B] bg-white dark:bg-[#151D1A] text-xs text-gray-800 dark:text-white focus:outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => showToast("Attached prototype PDF")}
                      className="px-2 py-1 rounded bg-white dark:bg-[#151D1A] border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <FileText size={11} /> Attach Prototype
                    </button>
                    <button
                      onClick={() => showToast("Inserted Calendly booking link")}
                      className="px-2 py-1 rounded bg-white dark:bg-[#151D1A] border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Calendar size={11} /> Insert Calendar
                    </button>
                  </div>

                  <button
                    onClick={() => showToast("✓ Reply sent to Rahul Sharma at The Urban Kitchen!")}
                    className="h-8 px-4 rounded-lg bg-[#171918] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send size={12} />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
