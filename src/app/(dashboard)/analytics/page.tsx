"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Send,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Download,
  DollarSign,
  Briefcase,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Bot,
  Clock,
  ExternalLink,
  Search,
  MapPin,
  Building,
  Mail,
  PhoneCall,
  MessageSquare,
  Award,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

// --- DATASETS MATCHING 14_Analytics_Overview.png ---
const OVERVIEW_LEAD_GEN_TREND = [
  { day: "Mar 1", mapLeads: 180, websiteLeads: 110, manualLeads: 60 },
  { day: "Mar 5", mapLeads: 220, websiteLeads: 140, manualLeads: 75 },
  { day: "Mar 10", mapLeads: 260, websiteLeads: 165, manualLeads: 90 },
  { day: "Mar 15", mapLeads: 310, websiteLeads: 195, manualLeads: 110 },
  { day: "Mar 20", mapLeads: 340, websiteLeads: 210, manualLeads: 125 },
  { day: "Mar 25", mapLeads: 360, websiteLeads: 225, manualLeads: 135 },
  { day: "Mar 31", mapLeads: 390, websiteLeads: 245, manualLeads: 145 },
];

const OVERVIEW_OUTREACH_PERF = [
  { day: "Mar 1", emails: 120, replies: 28, meetings: 6 },
  { day: "Mar 5", emails: 180, replies: 36, meetings: 8 },
  { day: "Mar 10", emails: 240, replies: 44, meetings: 12 },
  { day: "Mar 15", emails: 310, replies: 56, meetings: 15 },
  { day: "Mar 20", emails: 290, replies: 52, meetings: 14 },
  { day: "Mar 25", emails: 380, replies: 64, meetings: 18 },
  { day: "Mar 31", emails: 420, replies: 72, meetings: 21 },
];

const OVERVIEW_CHANNELS_DONUT = [
  { name: "Google Maps", value: 42, count: 520, color: "#3568E8" },
  { name: "Website", value: 28, count: 350, color: "#10B981" },
  { name: "Direct Outreach", value: 18, count: 220, color: "#8B5CF6" },
  { name: "Referrals", value: 8, count: 100, color: "#F59E0B" },
  { name: "Other", value: 4, count: 58, color: "#68717D" },
];

const OVERVIEW_CLIENT_GROWTH = [
  { month: "Jan", clients: 12 },
  { month: "Feb", clients: 18 },
  { month: "Mar", clients: 24 },
  { month: "Apr", clients: 28 },
  { month: "May", clients: 34 },
  { month: "Jun", clients: 48 },
];

const OVERVIEW_REVENUE_TREND = [
  { month: "Jan", revenue: 1.2 },
  { month: "Feb", revenue: 2.1 },
  { month: "Mar", revenue: 3.1 },
  { month: "Apr", revenue: 3.8 },
  { month: "May", revenue: 4.2 },
  { month: "Jun", revenue: 4.8 },
];

const OVERVIEW_TOP_CAMPAIGNS = [
  { name: "Restaurant Outreach", sent: 340, replies: 48, rate: "4.8%" },
  { name: "Clinic & Dental", sent: 280, replies: 28, rate: "4.2%" },
  { name: "Gym & Fitness", sent: 180, replies: 18, rate: "3.8%" },
  { name: "Hotel & Hospitality", sent: 92, replies: 10, rate: "3.3%" },
  { name: "Café & Bakery", sent: 84, replies: 8, rate: "3.1%" },
];

const OVERVIEW_TOP_LOCATIONS = [
  { name: "Indore (MP)", count: 320, pct: "100%" },
  { name: "Vijay Nagar", count: 120, pct: "38%" },
  { name: "Bhawarkuan", count: 98, pct: "31%" },
  { name: "Palasia", count: 86, pct: "27%" },
  { name: "Dewas Naka", count: 72, pct: "23%" },
];

const OVERVIEW_RECENT_ACTIVITY = [
  { text: "New lead found: Spice Junction (Restaurant)", time: "12 minutes ago", type: "lead" },
  { text: "Rahul Sharma replied to your email", time: "1 hour ago", type: "reply" },
  { text: "Meeting booked with The Urban Kitchen", time: "3 hours ago", type: "meeting" },
  { text: "Project completed: Café Central", time: "5 hours ago", type: "project" },
  { text: "New client added: FitLife Gym", time: "1 day ago", type: "client" },
];

// --- DATASETS MATCHING 15_Analytics_Conversion_Funnel.png ---
const FUNNEL_CHEVRONS = [
  { stage: "Leads", count: 1248, rate: "100%", drop: null },
  { stage: "Contacted", count: 892, rate: "71.5%", drop: "↓ 28.5% (356 leads lost)" },
  { stage: "Replied", count: 348, rate: "27.9%", drop: "↓ 61.0% (544 leads lost)" },
  { stage: "Meetings", count: 142, rate: "11.4%", drop: "↓ 59.2% (206 leads lost)" },
  { stage: "Proposals", count: 86, rate: "6.9%", drop: "↓ 39.4% (56 leads lost)" },
  { stage: "Clients", count: 48, rate: "3.8%", drop: "↓ 44.2% (38 leads lost)" },
];

const FUNNEL_SOURCE_RATES = [
  { source: "Google Maps", rate: 6.2 },
  { source: "Website", rate: 4.8 },
  { source: "Direct Outreach", rate: 3.1 },
  { source: "Referrals", rate: 2.9 },
  { source: "Social Media", rate: 2.1 },
];

const FUNNEL_INDUSTRY_RATES = [
  { industry: "Restaurant", rate: 6.2 },
  { industry: "Café & Bakery", rate: 5.4 },
  { industry: "Clinic & Dental", rate: 4.2 },
  { industry: "Gym & Fitness", rate: 3.8 },
  { industry: "Hotel & Hospitality", rate: 3.3 },
  { industry: "Salon & Spa", rate: 3.1 },
  { industry: "Real Estate", rate: 2.4 },
];

const FUNNEL_CLIENT_DIST = [
  { name: "Restaurant", value: 14, color: "#3568E8" },
  { name: "Clinic & Dental", value: 10, color: "#10B981" },
  { name: "Gym & Fitness", value: 8, color: "#8B5CF6" },
  { name: "Café & Bakery", value: 6, color: "#F59E0B" },
  { name: "Others", value: 10, color: "#68717D" },
];

// --- DATASETS MATCHING 16_Analytics_Lead_Source_Performance_Preferred.png ---
const SOURCES_BAR_DATA = [
  { source: "Google Maps", count: 520, color: "#3568E8" },
  { source: "Website", count: 348, color: "#10B981" },
  { source: "Direct Outreach", count: 220, color: "#8B5CF6" },
  { source: "Referrals", count: 180, color: "#F59E0B" },
  { source: "Social Media", count: 98, color: "#EC4899" },
  { source: "Events", count: 80, color: "#06B6D4" },
  { source: "Others", count: 38, color: "#9CA3AF" },
];

const SOURCES_REVENUE_DATA = [
  { name: "Google Maps", amount: "₹1,80,000", width: "100%", color: "bg-[#3568E8]" },
  { name: "Website", amount: "₹1,20,000", width: "67%", color: "bg-[#10B981]" },
  { name: "Direct Outreach", amount: "₹60,000", width: "33%", color: "bg-[#8B5CF6]" },
  { name: "Referrals", amount: "₹45,000", width: "25%", color: "bg-[#F59E0B]" },
  { name: "Social Media", amount: "₹28,000", width: "16%", color: "bg-[#EC4899]" },
  { name: "Events", amount: "₹22,000", width: "12%", color: "bg-[#06B6D4]" },
  { name: "Others", amount: "₹15,000", width: "8%", color: "bg-gray-400" },
];

const SOURCES_TABLE_DATA = [
  { source: "Google Maps", leads: 520, contacted: 420, replied: 180, meetings: 64, clients: 32, revenue: "₹1,80,000", conv: "6.2%" },
  { source: "Website", leads: 348, contacted: 280, replied: 98, meetings: 38, clients: 16, revenue: "₹1,20,000", conv: "4.8%" },
  { source: "Direct Outreach", leads: 220, contacted: 220, replied: 42, meetings: 18, clients: 7, revenue: "₹60,000", conv: "3.1%" },
  { source: "Referrals", leads: 180, contacted: 150, replied: 48, meetings: 20, clients: 5, revenue: "₹45,000", conv: "2.9%" },
  { source: "Social Media", leads: 98, contacted: 80, replied: 22, meetings: 8, clients: 2, revenue: "₹28,000", conv: "2.1%" },
  { source: "Events", leads: 80, contacted: 65, replied: 18, meetings: 6, clients: 1, revenue: "₹22,000", conv: "1.8%" },
];

// --- DATASETS MATCHING 17_Analytics_Campaign_Performance.png ---
const CAMPAIGNS_AREA_DATA = [
  { month: "Feb", sent: 1800, replies: 240, clients: 6 },
  { month: "Apr", sent: 2600, replies: 380, clients: 12 },
  { month: "May", sent: 3400, replies: 480, clients: 16 },
  { month: "Jul", sent: 4200, replies: 590, clients: 22 },
  { month: "Aug", sent: 5100, replies: 720, clients: 30 },
  { month: "Sep", sent: 6200, replies: 860, clients: 38 },
  { month: "Oct", sent: 7400, replies: 1040, clients: 48 },
  { month: "Nov", sent: 8800, replies: 1250, clients: 64 },
];

const CAMPAIGNS_RANKED = [
  { id: 1, name: "Restaurant Owners - Indore", leads: "3,200 leads", replies: "420 replies", clients: "68 clients", rate: "12.4% reply rate", revenue: "₹4,20,000" },
  { id: 2, name: "Premium Salon Chain", leads: "2,100 leads", replies: "280 replies", clients: "42 clients", rate: "9.8% reply rate", revenue: "₹2,80,000" },
  { id: 3, name: "Multi-Speciality Clinics", leads: "1,800 leads", replies: "220 replies", clients: "32 clients", rate: "8.6% reply rate", revenue: "₹2,10,000" },
  { id: 4, name: "Gym & Fitness Studios", leads: "1,200 leads", replies: "140 replies", clients: "18 clients", rate: "7.2% reply rate", revenue: "₹1,40,000" },
  { id: 5, name: "Boutique Hotels", leads: "850 leads", replies: "110 replies", clients: "14 clients", rate: "6.1% reply rate", revenue: "₹95,000" },
];

// --- DATASETS MATCHING 18_Analytics_Revenue_and_MRR.png ---
const REVENUE_OVER_TIME = [
  { month: "Jan", total: 4.8, mrr: 1.8, onetime: 3.0 },
  { month: "Feb", total: 6.2, mrr: 2.2, onetime: 4.0 },
  { month: "Mar", total: 7.8, mrr: 2.6, onetime: 5.2 },
  { month: "May", total: 8.9, mrr: 3.1, onetime: 5.8 },
  { month: "Jun", total: 9.8, mrr: 3.4, onetime: 6.4 },
  { month: "Aug", total: 11.2, mrr: 3.8, onetime: 7.4 },
  { month: "Sep", total: 12.8, mrr: 4.2, onetime: 8.6 },
];

const REVENUE_TOP_CLIENTS = [
  { name: "Spice Villa Restaurant", industry: "Restaurant", mrr: "₹40,000", date: "Jan 2024" },
  { name: "Glow & Grace Salon", industry: "Salon", mrr: "₹30,000", date: "Feb 2024" },
  { name: "CityCare Clinic", industry: "Clinic", mrr: "₹25,000", date: "Feb 2024" },
  { name: "FitZone Gym", industry: "Fitness", mrr: "₹20,000", date: "Mar 2024" },
  { name: "Hotel Bliss Inn", industry: "Hospitality", mrr: "₹18,000", date: "Mar 2024" },
];

// --- DATASETS MATCHING 19_Analytics_AI_Agent_Performance.png ---
const AGENTS_TASK_DIST = [
  { name: "Email Outreach", value: 1280, color: "#3568E8" },
  { name: "Lead Research", value: 980, color: "#10B981" },
  { name: "Follow-up Agent", value: 620, color: "#8B5CF6" },
  { name: "LinkedIn Outreach", value: 420, color: "#06B6D4" },
  { name: "SMS Outreach", value: 280, color: "#F59E0B" },
  { name: "WhatsApp Agent", value: 180, color: "#EC4899" },
];

const AGENTS_RECENT_FEED = [
  { agent: "Email Outreach Agent", action: "Sent Email", target: "TO: spicevilla123@gmail.com", time: "2 mins ago" },
  { agent: "Follow-up Agent", action: "Follow-up Email", target: "Restaurant - Indore", time: "5 mins ago" },
  { agent: "Lead Research Agent", action: "Audited 12 Leads", target: "Gyms in Indore", time: "8 mins ago" },
  { agent: "LinkedIn Outreach Agent", action: "Sent Message", target: "TO: FitZone Gym", time: "12 mins ago" },
  { agent: "Email Outreach Agent", action: "Received Reply", target: "From Citycare Clinic", time: "18 mins ago" },
  { agent: "Follow-up Agent", action: "Meeting Booked", target: "Spice Villa Restaurant", time: "25 mins ago" },
];

type AnalyticsTab = "overview" | "funnel" | "sources" | "campaigns" | "revenue" | "agents";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("Mar 1, 2024 - Mar 31, 2024");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveKpis, setLiveKpis] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/analytics/overview");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setLiveKpis(json.data.kpis);
          }
        }
      } catch (e) {
        console.error("Failed to load analytics overview:", e);
      }
    }
    loadAnalytics();
  }, []);

  const handleExportReport = () => {
    const reportData = [
      ["Metric", "Value"],
      ["Total Leads", liveKpis ? String(liveKpis.totalLeads) : "1,248"],
      ["Emails Sent", liveKpis ? String(liveKpis.emailsSent) : "892"],
      ["Replies Received", liveKpis ? String(liveKpis.repliesReceived) : "142"],
      ["Meetings Booked", liveKpis ? String(liveKpis.meetingsBooked) : "38"],
      ["Active Clients", liveKpis ? String(liveKpis.activeClients) : "48"],
      ["Conversion Rate", liveKpis ? String(liveKpis.conversionRate) : "4.9%"],
      ["", ""],
      ["Lead Source", "Leads Count"],
      ...SOURCES_BAR_DATA.map((s) => [s.source, String(s.count)]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + reportData.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgencyOS_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Analytics report downloaded successfully!");
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Sub-view Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E2]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: "overview", label: "Overview" },
            { id: "funnel", label: "Conversion Funnel" },
            { id: "sources", label: "Lead Sources" },
            { id: "campaigns", label: "Campaign Performance" },
            { id: "revenue", label: "Revenue & MRR" },
            { id: "agents", label: "AI Agent Performance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#171918] text-white shadow-xs"
                  : "bg-white border border-[#E7E7E2] text-[#68717D] hover:text-[#171918]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center px-3 py-1.5 rounded-lg border border-[#E7E7E2] bg-white text-xs text-[#171918] shadow-2xs">
            <Calendar size={13} className="text-[#68717D] mr-2" />
            <span className="font-medium text-[11px]">{dateRange}</span>
            <ChevronDown size={12} className="text-[#68717D] ml-2" />
          </div>

          <button
            onClick={handleExportReport}
            className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-[#171918] shadow-2xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} className="text-[#68717D]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW (Matches 14_Analytics_Overview.png)                           */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Header Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              Analytics
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Track your performance, measure growth and get insights to make better decisions.
            </p>
          </div>

          {/* 6 Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: "Total Leads", value: liveKpis ? String(liveKpis.totalLeads) : "1,248", trend: "32%" },
              { label: "Emails Sent", value: liveKpis ? String(liveKpis.emailsSent) : "892", trend: "28%" },
              { label: "Replies Received", value: liveKpis ? String(liveKpis.repliesReceived) : "142", trend: "18%" },
              { label: "Meetings Booked", value: liveKpis ? String(liveKpis.meetingsBooked) : "38", trend: "25%" },
              { label: "Total Clients", value: liveKpis ? String(liveKpis.activeClients) : "48", trend: "20%" },
              { label: "Total Revenue", value: "₹4.8L", trend: "42%" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#171918] tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    ↑ {kpi.trend}
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] font-medium mt-1">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Lead Gen Trend (Line) + Outreach Performance (Line/Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Lead Gen Trend */}
            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Lead Generation Trend</h3>
                  <p className="text-[11px] text-[#68717D]">Total leads discovered and added over time</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#68717D]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3568E8]" /> Map Leads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Website Leads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Manual Leads
                  </span>
                </div>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={OVERVIEW_LEAD_GEN_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                    <Line type="monotone" dataKey="mapLeads" stroke="#3568E8" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="websiteLeads" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="manualLeads" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outreach Performance */}
            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Outreach Performance</h3>
                  <p className="text-[11px] text-[#68717D]">Email campaign performance over time</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#68717D]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3568E8]" /> Emails Sent
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Replies
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> Meetings
                  </span>
                </div>
              </div>

              <div className="h-52 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={OVERVIEW_OUTREACH_PERF} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                    <Bar dataKey="emails" fill="#3568E8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="replies" fill="#10B981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="meetings" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2: 3 Cards (Top Channels Donut, Client Growth Bar, Revenue Overview Area) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Top Performing Channels */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#171918]">Top Performing Channels</h3>
                <p className="text-[11px] text-[#68717D]">Which channels bring the most leads &amp; clients</p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="w-28 h-28 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={OVERVIEW_CHANNELS_DONUT} innerRadius={32} outerRadius={48} dataKey="value">
                        {OVERVIEW_CHANNELS_DONUT.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] space-y-1.5 flex-1">
                  {OVERVIEW_CHANNELS_DONUT.map((ch) => (
                    <div key={ch.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#68717D]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                        {ch.name} ({ch.count})
                      </span>
                      <strong className="text-[#171918]">{ch.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Client Growth */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Client Growth</h3>
                  <p className="text-[11px] text-[#68717D]">New clients added each month</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  48 Total
                </span>
              </div>

              <div className="h-32 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={OVERVIEW_CLIENT_GROWTH}>
                    <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <Bar dataKey="clients" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Overview */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Revenue Overview</h3>
                  <p className="text-[11px] text-[#68717D]">Monthly revenue from projects</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  ₹4.8L Total
                </span>
              </div>

              <div className="h-32 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={OVERVIEW_REVENUE_TREND}>
                    <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: 3 Cards (Lead to Client Funnel, Top Performing Campaigns, Top Locations) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Lead to Client Funnel */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div>
                <h3 className="text-sm font-bold text-[#171918]">Lead to Client Funnel</h3>
                <p className="text-[11px] text-[#68717D]">Conversion at each stage</p>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 flex justify-between text-blue-900 font-medium">
                  <span>1,248 Total Leads</span>
                  <strong>100%</strong>
                </div>
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 flex justify-between text-sky-900 font-medium">
                  <span>892 Emails Sent</span>
                  <strong>71%</strong>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 flex justify-between text-emerald-900 font-medium">
                  <span>142 Replied</span>
                  <strong>11%</strong>
                </div>
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 flex justify-between text-purple-900 font-medium">
                  <span>38 Meetings</span>
                  <strong>3%</strong>
                </div>
                <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-200 flex justify-between text-emerald-950 font-bold">
                  <span>18 Clients Won</span>
                  <strong>1.4%</strong>
                </div>
              </div>
            </div>

            {/* Top Performing Campaigns */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Top Performing Campaigns</h3>
                  <p className="text-[11px] text-[#68717D]">Outreach response and conversion</p>
                </div>
                <button
                  onClick={() => setActiveTab("campaigns")}
                  className="text-xs font-bold text-[#3568E8] hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F6F2] text-[#68717D] text-[10px] font-semibold">
                    <tr>
                      <th className="py-2 px-2">Campaign</th>
                      <th className="py-2 px-1">Sent</th>
                      <th className="py-2 px-1">Replies</th>
                      <th className="py-2 px-1 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    {OVERVIEW_TOP_CAMPAIGNS.map((c) => (
                      <tr key={c.name} className="hover:bg-gray-50/50">
                        <td className="py-2 px-2 font-medium text-[#171918]">{c.name}</td>
                        <td className="py-2 px-1 text-[#68717D]">{c.sent}</td>
                        <td className="py-2 px-1 font-bold text-emerald-700">{c.replies}</td>
                        <td className="py-2 px-1 text-right font-bold text-[#3568E8]">{c.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Locations */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Top Locations</h3>
                  <p className="text-[11px] text-[#68717D]">Cities/areas with highest opportunities</p>
                </div>
                <span className="text-xs font-bold text-[#3568E8] hover:underline cursor-pointer">
                  View All →
                </span>
              </div>

              <div className="space-y-2.5 pt-1 text-[11px]">
                {OVERVIEW_TOP_LOCATIONS.map((loc) => (
                  <div key={loc.name} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#171918] flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#3568E8]" /> {loc.name}
                      </span>
                      <strong className="text-[#171918]">{loc.count} leads</strong>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3568E8]" style={{ width: loc.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Recent Activity Feed */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171918]">Recent Activity</h3>
                <p className="text-[11px] text-[#68717D]">Real-time operational events from your pipeline</p>
              </div>
              <span className="text-xs font-bold text-[#3568E8] hover:underline cursor-pointer">
                View All →
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              {OVERVIEW_RECENT_ACTIVITY.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#68717D]">
                    <Clock size={11} /> {act.time}
                  </div>
                  <div className="font-semibold text-[#171918] text-[11px] leading-snug">
                    {act.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONVERSION FUNNEL (Matches 15_Analytics_Conversion_Funnel.png)         */}
      {/* ========================================================================= */}
      {activeTab === "funnel" && (
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold text-[#68717D] mb-1">
              Analytics &gt; Conversion Funnel
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              Conversion Funnel
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Track how leads move from discovery to paying clients and identify opportunities to improve conversion rates.
            </p>
          </div>

          {/* Top 6 Funnel KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: "Total Leads", value: "1,248", trend: "32%" },
              { label: "Contacted", value: "892", trend: "28%" },
              { label: "Replied", value: "348", trend: "18%" },
              { label: "Meetings Booked", value: "142", trend: "25%" },
              { label: "Proposals Sent", value: "86", trend: "15%" },
              { label: "Converted Clients", value: "48", trend: "20%" },
            ].map((k) => (
              <div key={k.label} className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918]">{k.value}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    ↑ {k.trend}
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Chevron Funnel Flow Banner */}
          <div className="p-6 rounded-2xl bg-white border border-[#E7E7E2] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171918]">Lead to Client Conversion Funnel</h3>
                <span className="text-xs text-[#68717D]">
                  Overall conversion rate: <strong>3.8%</strong> (48 out of 1,248 leads)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Conversion Yield: 3.8%
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-2">
              {FUNNEL_CHEVRONS.map((stage, idx) => (
                <div
                  key={stage.stage}
                  className="p-3.5 rounded-xl border border-[#E7E7E2] bg-[#F7F6F2]/50 text-center space-y-1"
                >
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#68717D]">
                    Step {idx + 1}
                  </div>
                  <div className="font-bold text-lg text-[#171918]">
                    {stage.count.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-700">{stage.stage}</div>
                  <div className="text-[11px] font-bold text-[#3568E8]">{stage.rate}</div>
                  {stage.drop && (
                    <div className="text-[9px] text-rose-600 font-semibold pt-1 border-t border-gray-200/60">
                      {stage.drop}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row of Cards: Conversion Rate by Source + Drop-off Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#171918]">Conversion Rate by Source</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FUNNEL_SOURCE_RATES}>
                    <XAxis dataKey="source" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                    <Bar dataKey="rate" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-[#171918]">Drop-off Analysis</h3>
              <div className="space-y-2">
                {[
                  { step: "Leads → Contacted", drop: "28.5% drop-off", lost: "356 leads lost" },
                  { step: "Contacted → Replied", drop: "61.0% drop-off", lost: "544 leads lost" },
                  { step: "Replied → Meetings", drop: "59.2% drop-off", lost: "206 leads lost" },
                  { step: "Meetings → Proposals", drop: "39.4% drop-off", lost: "56 leads lost" },
                  { step: "Proposals → Clients", drop: "44.2% drop-off", lost: "38 leads lost" },
                ].map((item) => (
                  <div key={item.step} className="p-2.5 rounded-lg bg-[#F7F6F2] border border-[#E7E7E2] flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171918]">{item.step}</span>
                    <span className="font-bold text-rose-600">{item.drop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights & Industry Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#171918]">Conversion Rate by Industry</h3>
              <div className="space-y-2 pt-1 text-[11px]">
                {FUNNEL_INDUSTRY_RATES.map((ind) => (
                  <div key={ind.industry} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-[#171918]">{ind.industry}</span>
                      <strong className="text-[#3568E8]">{ind.rate}%</strong>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#3568E8]" style={{ width: `${ind.rate * 14}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-[#171918]">Key Conversion Insights</h3>
              <div className="space-y-2 pt-1">
                {[
                  "Highest conversion rate observed in Restaurant industry (6.2%). Consider scaling outreach budget.",
                  "Major drop-off (61%) between Contacted and Replied. Improve email copy and personalization.",
                  "Leads from Google Maps convert 2.3x better than raw social media leads.",
                  "Follow-up within 24 hours increases meeting bookings by 40%.",
                  "Sending case studies alongside dev briefs increases proposal conversion by 28%.",
                ].map((insight, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#F7F6F2] border border-[#E7E7E2] flex items-start gap-2 text-[11px]">
                    <span className="w-4 h-4 rounded-full bg-[#3568E8] text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[#171918] leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LEAD SOURCES (Matches 16_Analytics_Lead_Source_Performance_Preferred) */}
      {/* ========================================================================= */}
      {activeTab === "sources" && (
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold text-[#68717D] mb-1">
              Analytics &gt; Lead Source Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              Lead Source Performance
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Understand which channels bring the best leads, clients and revenue to your business.
            </p>
          </div>

          {/* 5 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Total Leads", value: "1,248", trend: "32%" },
              { label: "Contacted", value: "892", trend: "28%" },
              { label: "Average Response Rate", value: "24%", trend: "4%" },
              { label: "Converted Clients", value: "48", trend: "20%" },
              { label: "Total Revenue", value: "₹4.8L", trend: "42%" },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#171918]">{kpi.value}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    ↑ {kpi.trend}
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Leads by Source & Revenue by Source */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#171918]">Leads by Source</h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SOURCES_BAR_DATA}>
                    <XAxis dataKey="source" stroke="#A0A6A3" fontSize={9} tickLine={false} />
                    <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                    <Bar dataKey="count" fill="#3568E8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-[#171918]">Revenue by Source</h3>
              <div className="space-y-2.5 pt-1">
                {SOURCES_REVENUE_DATA.map((r) => (
                  <div key={r.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-[#171918]">{r.name}</span>
                      <strong className="text-[#171918]">{r.amount}</strong>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.color}`} style={{ width: r.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Source Details Table */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#171918]">Lead Source Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F2] border-b border-[#E7E7E2] text-[#68717D] text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Source Channel</th>
                    <th className="py-2.5 px-2">Leads Found</th>
                    <th className="py-2.5 px-2">Contacted</th>
                    <th className="py-2.5 px-2">Replied</th>
                    <th className="py-2.5 px-2">Meetings</th>
                    <th className="py-2.5 px-2">Clients</th>
                    <th className="py-2.5 px-2">Total Revenue</th>
                    <th className="py-2.5 px-2 text-right">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {SOURCES_TABLE_DATA.map((s) => (
                    <tr key={s.source} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-bold text-[#171918]">{s.source}</td>
                      <td className="py-2.5 px-2">{s.leads}</td>
                      <td className="py-2.5 px-2 text-[#68717D]">{s.contacted}</td>
                      <td className="py-2.5 px-2 font-bold text-emerald-700">{s.replied}</td>
                      <td className="py-2.5 px-2 font-bold text-purple-700">{s.meetings}</td>
                      <td className="py-2.5 px-2 font-bold text-[#3568E8]">{s.clients}</td>
                      <td className="py-2.5 px-2 font-bold text-[#171918]">{s.revenue}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-[#25835B]">{s.conv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CAMPAIGN PERFORMANCE (Matches 17_Analytics_Campaign_Performance.png)  */}
      {/* ========================================================================= */}
      {activeTab === "campaigns" && (
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold text-[#68717D] mb-1">
              Analytics &gt; Campaign Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              Campaign Performance
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Track the performance of your outreach campaigns, compare results and optimize for better conversions.
            </p>
          </div>

          {/* 5 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Emails Sent", value: "24,580" },
              { label: "Total Replies", value: "3,420" },
              { label: "Meetings Booked", value: "480" },
              { label: "Converted Clients", value: "82" },
              { label: "Revenue Generated", value: "₹14.2L" },
            ].map((k) => (
              <div key={k.label} className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
                <span className="text-xl font-bold text-[#171918] block tracking-tight">{k.value}</span>
                <span className="text-[11px] text-[#68717D] mt-1 block">{k.label}</span>
              </div>
            ))}
          </div>

          {/* Campaign Area Trend */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#171918]">Campaign Performance Overview</h3>
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CAMPAIGNS_AREA_DATA}>
                  <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                  <Area type="monotone" dataKey="sent" stroke="#3568E8" fill="#3568E8" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="replies" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ranked Campaigns */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#171918]">Top Performing Campaigns</h3>
            <div className="space-y-2.5">
              {CAMPAIGNS_RANKED.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#151B1A] text-white flex items-center justify-center font-bold text-[11px]">
                      {c.id}
                    </span>
                    <div>
                      <div className="font-bold text-[#171918]">{c.name}</div>
                      <div className="text-[11px] text-[#68717D]">
                        {c.leads} • {c.replies} • {c.clients}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                      {c.rate}
                    </span>
                    <strong className="text-sm font-bold text-[#171918]">{c.revenue}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REVENUE & MRR (Matches 18_Analytics_Revenue_and_MRR.png)                */}
      {/* ========================================================================= */}
      {activeTab === "revenue" && (
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold text-[#68717D] mb-1">
              Analytics &gt; Revenue &amp; MRR
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              Revenue &amp; MRR Analytics
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Track your revenue, recurring income and business growth over time.
            </p>
          </div>

          {/* 5 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {[
              { label: "Monthly Recurring Revenue (MRR)", value: "₹4,20,000", trend: "38%" },
              { label: "Total Revenue", value: "₹12,80,000", trend: "52%" },
              { label: "Average Deal Size", value: "₹28,500", trend: "14%" },
              { label: "Active Clients", value: "45", trend: "22%" },
              { label: "Client Retention Rate", value: "92%", trend: "4%" },
            ].map((k) => (
              <div key={k.label} className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#171918]">{k.value}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    ↑ {k.trend}
                  </span>
                </div>
                <div className="text-[11px] text-[#68717D] mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue Over Time Chart */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#171918]">Revenue Over Time</h3>
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_OVER_TIME}>
                  <XAxis dataKey="month" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                  <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip contentStyle={WHITE_TOOLTIP_STYLE.contentStyle} itemStyle={WHITE_TOOLTIP_STYLE.itemStyle} labelStyle={WHITE_TOOLTIP_STYLE.labelStyle} />
                  <Area type="monotone" dataKey="total" stroke="#3568E8" fill="#3568E8" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="mrr" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Paying Clients */}
          <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-[#171918]">Top Paying Clients</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F2] border-b border-[#E7E7E2] text-[#68717D] text-[10px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Client Name</th>
                    <th className="py-2.5 px-2">Industry</th>
                    <th className="py-2.5 px-2">Monthly Retainer (MRR)</th>
                    <th className="py-2.5 px-2 text-right">Client Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {REVENUE_TOP_CLIENTS.map((c) => (
                    <tr key={c.name} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-bold text-[#171918]">{c.name}</td>
                      <td className="py-2.5 px-2 text-[#68717D]">{c.industry}</td>
                      <td className="py-2.5 px-2 font-bold text-emerald-700">{c.mrr}</td>
                      <td className="py-2.5 px-2 text-right text-[#68717D]">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. AI AGENTS PERFORMANCE (Matches 19_Analytics_AI_Agent_Performance.png)  */}
      {/* ========================================================================= */}
      {activeTab === "agents" && (
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold text-[#68717D] mb-1">
              Analytics &gt; AI Agent Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918] tracking-tight">
              AI Agent Performance
            </h1>
            <p className="text-xs text-[#68717D] mt-0.5">
              Track how your AI agents are performing across lead generation, outreach, and client conversion.
            </p>
          </div>

          {/* 6 KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { label: "Total AI Agents", value: "12" },
              { label: "Emails Sent by AI", value: "24,580" },
              { label: "AI Replies Received", value: "3,420" },
              { label: "AI Meetings Booked", value: "480" },
              { label: "AI Converted Clients", value: "82" },
              { label: "Revenue from AI", value: "₹12.8L" },
            ].map((k) => (
              <div key={k.label} className="p-3.5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs">
                <span className="text-xl font-bold text-[#171918] block tracking-tight">{k.value}</span>
                <span className="text-[10px] text-[#68717D] mt-1 block">{k.label}</span>
              </div>
            ))}
          </div>

          {/* Task Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#171918]">Task Distribution by AI Agents</h3>
              <div className="space-y-2 pt-1 text-[11px]">
                {AGENTS_TASK_DIST.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between p-2 rounded-lg bg-[#F7F6F2]">
                    <span className="font-semibold text-[#171918] flex items-center gap-2">
                      <Bot size={13} style={{ color: agent.color }} /> {agent.name}
                    </span>
                    <strong className="text-[#171918]">{agent.value} tasks</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#171918]">Recent AI Agent Activity</h3>
              <div className="space-y-2 pt-1 text-[11px]">
                {AGENTS_RECENT_FEED.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#171918]">{f.agent}</div>
                      <div className="text-[10px] text-[#68717D]">{f.action} • {f.target}</div>
                    </div>
                    <span className="text-[10px] text-[#68717D] font-medium">{f.time}</span>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
