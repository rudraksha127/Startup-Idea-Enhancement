"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Search,
  Mail,
  MessageSquare,
  Briefcase,
  FileText,
  Plus,
  Play,
  CheckCircle2,
  MoreHorizontal,
  ChevronDown,
  TrendingUp,
  Clock,
  Send,
  Zap,
  Sliders,
  Sparkles,
  ChevronRight,
  Code,
  Check,
  AlertCircle,
  Copy,
  Edit,
  ExternalLink,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Agent {
  _id: string;
  name: string;
  category: string;
  role: string;
  status: "Active" | "Idle" | "Paused";
  lastRun: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  model: string;
  modelBadge: string;
  icon: typeof Search;
  color: string;
}

const AGENTS: Agent[] = [
  {
    _id: "1",
    name: "Research Agent",
    category: "Research",
    role: "Finds and analyzes local businesses, extracts key information and scores opportunities.",
    status: "Active",
    lastRun: "Last run 5 min ago",
    metric1: { label: "Businesses found", value: "1,248" },
    metric2: { label: "Qualified leads", value: "892" },
    model: "GPT-4o",
    modelBadge: "High Accuracy",
    icon: Search,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    _id: "2",
    name: "Outreach Agent",
    category: "Outreach",
    role: "Creates personalized emails and handles multi-step outreach sequences.",
    status: "Active",
    lastRun: "Last run 12 min ago",
    metric1: { label: "Emails sent", value: "892" },
    metric2: { label: "Open rate", value: "68%" },
    model: "Claude 3.5",
    modelBadge: "High Performance",
    icon: Mail,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    _id: "3",
    name: "Reply Manager",
    category: "Communication",
    role: "Reads and understands client replies, classifies intent and suggests actions.",
    status: "Active",
    lastRun: "Last run 3 min ago",
    metric1: { label: "Replies handled", value: "142" },
    metric2: { label: "Classification", value: "94%" },
    model: "GPT-4o",
    modelBadge: "High Accuracy",
    icon: MessageSquare,
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    _id: "4",
    name: "Sales Agent",
    category: "Sales",
    role: "Schedules meetings, qualifies clients and moves them through the pipeline.",
    status: "Active",
    lastRun: "Last run 28 min ago",
    metric1: { label: "Meetings booked", value: "38" },
    metric2: { label: "Clients converted", value: "24" },
    model: "Claude 3.5",
    modelBadge: "High Performance",
    icon: Briefcase,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    _id: "5",
    name: "Content Agent",
    category: "Content",
    role: "Creates website content, SEO drafts and project proposals.",
    status: "Active",
    lastRun: "Last run 1 hour ago",
    metric1: { label: "Content pieces", value: "56" },
    metric2: { label: "Proposals created", value: "12" },
    model: "GPT-4o",
    modelBadge: "Creative Mode",
    icon: FileText,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
];

const PERFORMANCE_DATA = [
  { day: "Mar 1", tasks: 850, leads: 620, emails: 410, conversions: 120 },
  { day: "Mar 7", tasks: 1100, leads: 780, emails: 540, conversions: 160 },
  { day: "Mar 14", tasks: 1350, leads: 920, emails: 680, conversions: 210 },
  { day: "Mar 21", tasks: 1480, leads: 1040, emails: 790, conversions: 250 },
  { day: "Mar 28", tasks: 1720, leads: 1246, emails: 892, conversions: 295 },
];

const MODEL_DATA = [
  { name: "GPT-4o", value: 42, color: "#3568E8" },
  { name: "Claude 3.5", value: 28, color: "#F97316" },
  { name: "GPT-4 Turbo", value: 16, color: "#EAB308" },
  { name: "Gemini 1.5", value: 8, color: "#10B981" },
  { name: "Others", value: 6, color: "#6B7280" },
];

export default function AIAgentsPage() {
  const [viewMode, setViewMode] = useState<"overview" | "config">("overview");
  const [agentsList, setAgentsList] = useState<Agent[]>(AGENTS);
  const [activeTab, setActiveTab] = useState("All Agents (5)");
  const [searchQuery, setSearchQuery] = useState("");
  const [configSubTab, setConfigSubTab] = useState("Configuration");

  const filteredAgents = agentsList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "Research (1)") return matchesSearch && a.category === "Research";
    if (activeTab === "Outreach (1)") return matchesSearch && a.category === "Outreach";
    if (activeTab === "Sales (1)") return matchesSearch && a.category === "Sales";
    if (activeTab === "Content (1)") return matchesSearch && a.category === "Content";
    if (activeTab === "Other (1)") return matchesSearch && a.category === "Communication";
    return matchesSearch;
  });

  const handleToggle = (id: string) => {
    setAgentsList((prev) =>
      prev.map((a) =>
        a._id === id
          ? { ...a, status: a.status === "Active" ? "Paused" : "Active" }
          : a
      )
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E2]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "overview"
                ? "bg-[#171918] text-white shadow-xs"
                : "bg-white border border-[#E7E7E2] text-gray-600 hover:text-black"
            }`}
          >
            Agents Overview (5)
          </button>
          <button
            onClick={() => setViewMode("config")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "config"
                ? "bg-[#171918] text-white shadow-xs"
                : "bg-white border border-[#E7E7E2] text-gray-600 hover:text-black"
            }`}
          >
            Research Agent (Config &amp; History)
          </button>
        </div>

        <div className="text-xs text-gray-500 hidden sm:block">
          Autonomous Agent Runtime: Online
        </div>
      </div>

      {/* VIEW 1: AGENTS OVERVIEW (06_AI_Agents_Overview.png) */}
      {viewMode === "overview" && (
        <div className="space-y-5">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
                AI Agents
              </h1>
              <p className="text-xs text-[#68717D] mt-0.5">
                Deploy and manage your autonomous AI team for lead research, outreach and client handling.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("config")}
                className="h-8 px-3 rounded-lg border border-[#E7E7E2] bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
              >
                Configure Agents
              </button>
              <button
                onClick={() => setViewMode("config")}
                className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>Create Agent</span>
              </button>
            </div>
          </div>

          {/* 5 Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Bot size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">5</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 25%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Active Agents</div>
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
                  <Zap size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">1,246</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 32%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Tasks Completed</div>
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
                  <Send size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">892</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 18%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Emails Sent</div>
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
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">142</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↑ 28%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Leads Qualified</div>
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
                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Clock size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-[#171918]">3.2 min</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                      ↓ 18%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#68717D]">Avg. Task Time</div>
                </div>
              </div>
              <div className="w-12 h-5 opacity-70 hidden xl:block">
                <svg viewBox="0 0 50 20" className="w-full h-full">
                  <path d="M 0 6 Q 25 10 35 15 T 50 18" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Grid: Left Your Agents List + Right Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (8 cols): Your AI Agents */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">Your AI Agents</h3>
                  <p className="text-[11px] text-[#68717D]">Specialized agents working together to grow your business</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search agents..."
                      className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-gray-200 bg-[#FAF9F6] focus:bg-white focus:outline-none w-36"
                    />
                  </div>
                  <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-2xs">
                    Filter
                  </button>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1 border-b border-gray-100 text-xs font-semibold overflow-x-auto scrollbar-none pb-1">
                {["All Agents (5)", "Research (1)", "Outreach (1)", "Sales (1)", "Content (1)", "Other (1)"].map((tab) => (
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

              {/* Agents List */}
              <div className="space-y-3">
                {filteredAgents.map((agent) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={agent._id}
                      className="p-4 rounded-xl border border-gray-100 bg-[#FAF9F6] hover:bg-white hover:border-gray-200 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div
                        onClick={() => setViewMode("config")}
                        className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${agent.color}`}>
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#171918] hover:text-blue-600">{agent.name}</span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-gray-200/70 text-gray-700">
                              {agent.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#68717D] mt-0.5 line-clamp-1">{agent.role}</p>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {agent.status}
                            </span>
                            <span>•</span>
                            <span>{agent.lastRun}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-200/60">
                        <div className="text-center">
                          <div className="font-bold text-sm text-[#171918]">{agent.metric1.value}</div>
                          <div className="text-[10px] text-gray-400">{agent.metric1.label}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-sm text-[#171918]">{agent.metric2.value}</div>
                          <div className="text-[10px] text-gray-400">{agent.metric2.label}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-xs text-[#171918]">{agent.model}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">{agent.modelBadge}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggle(agent._id)}
                            className="h-8 px-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs"
                          >
                            Run Now
                          </button>
                          <button
                            onClick={() => setViewMode("config")}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
                            title="Configure Agent"
                          >
                            <Sliders size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (4 cols): Performance + Model Usage */}
            <div className="lg:col-span-4 space-y-5">
              {/* Agents Performance Bar Chart */}
              <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#171918]">Agents Performance</h3>
                  <span className="text-[11px] text-gray-400 cursor-pointer hover:text-black">This Month ⌄</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Tasks</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Leads</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Emails</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Conversions</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" stroke="#A0A6A3" fontSize={10} tickLine={false} />
                      <YAxis stroke="#A0A6A3" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#171918", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                      />
                      <Bar dataKey="tasks" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="leads" fill="#10B981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="emails" fill="#38BDF8" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="conversions" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Usage Donut Chart */}
              <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#171918]">Model Usage</h3>
                  <span className="text-[11px] text-gray-400 cursor-pointer hover:text-black">This Month ⌄</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={MODEL_DATA} innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="value">
                          {MODEL_DATA.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] text-gray-400 uppercase font-semibold">Total</span>
                      <span className="text-xs font-bold text-[#171918]">12,846</span>
                      <span className="text-[8px] text-gray-400">credits</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs flex-1">
                    {MODEL_DATA.map((m) => (
                      <div key={m.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                          <span className="text-gray-700">{m.name}</span>
                        </span>
                        <span className="font-bold text-[#171918]">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Recent Agent Runs + Upcoming Tasks + AI Agent Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Agent Runs */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171918]">Recent Agent Runs</h3>
                <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { agent: "Research Agent", task: "Scan Indore - Restaurants", status: "Completed", time: "12 Mar, 10:24 AM", dur: "2m 14s" },
                  { agent: "Outreach Agent", task: "Send follow-up emails", status: "Completed", time: "12 Mar, 10:18 AM", dur: "1m 32s" },
                  { agent: "Reply Manager", task: "Analyze new replies", status: "Running", time: "12 Mar, 10:26 AM", dur: "–" },
                  { agent: "Sales Agent", task: "Qualify interested leads", status: "Completed", time: "12 Mar, 09:45 AM", dur: "3m 12s" },
                ].map((run, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF9F6] border border-gray-100">
                    <div>
                      <div className="font-semibold text-[#171918] text-[11px]">{run.task}</div>
                      <div className="text-[10px] text-gray-400">{run.agent} • {run.time}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${run.status === "Running" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171918]">Upcoming Tasks</h3>
                <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { task: "Run research on salons in Indore", time: "Today, 11:00 AM" },
                  { task: "Send follow-up to 48 leads", time: "Today, 12:30 PM" },
                  { task: "Analyze 12 new replies", time: "Today, 2:00 PM" },
                  { task: "Schedule meetings for interested leads", time: "Today, 3:00 PM" },
                ].map((t, i) => (
                  <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#171918] focus:ring-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#171918] text-[11px] truncate">{t.task}</div>
                      <div className="text-[10px] text-gray-400">{t.time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Agent Templates */}
            <div className="p-5 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#171918]">AI Agent Templates</h3>
                <span className="text-xs text-gray-400 hover:text-black cursor-pointer">View All →</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: "Local Business Researcher", desc: "Finds and analyzes businesses in any location" },
                  { name: "Cold Email Outreach", desc: "Personalized multi-step email campaigns" },
                  { name: "Client Reply Handler", desc: "Smart response analysis and categorization" },
                  { name: "Sales Meeting Booker", desc: "Qualify leads and schedule meetings automatically" },
                ].map((tmpl, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-100 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-[11px] text-[#171918]">{tmpl.name}</div>
                      <div className="text-[10px] text-gray-500 leading-snug">{tmpl.desc}</div>
                    </div>
                    <button
                      onClick={() => setViewMode("config")}
                      className="text-[10px] font-bold text-[#3568E8] hover:underline text-left"
                    >
                      Use Template →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AGENT CONFIGURATION & RUN HISTORY (07_AI_Agent_Configuration_and_Run_History.png) */}
      {viewMode === "config" && (
        <div className="space-y-5">
          {/* Breadcrumb & Agent Hero Header */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="w-14 h-14 rounded-2xl bg-[#0F5338] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Search size={26} />
                </span>
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold mb-0.5">
                    &lt; AI Agents &gt; Research Agent
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#171918]">Research Agent</h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>
                  <p className="text-xs text-[#68717D] mt-1">
                    Finds and analyzes local businesses, extracts key information and scores opportunities.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                    {["Research", "Lead Generation", "Data Analysis", "Enrichment"].map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-gray-200 text-gray-600 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 Top KPI Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 min-w-[100px]">
                  <div className="text-lg font-bold text-[#171918]">1,248</div>
                  <div className="text-[10px] text-gray-400">Businesses Found</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 min-w-[100px]">
                  <div className="text-lg font-bold text-[#171918]">892</div>
                  <div className="text-[10px] text-gray-400">Qualified Leads</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 min-w-[100px]">
                  <div className="text-lg font-bold text-emerald-700">68%</div>
                  <div className="text-[10px] text-gray-400">Accuracy Rate</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 min-w-[100px]">
                  <div className="text-lg font-bold text-[#171918]">2.3 min</div>
                  <div className="text-[10px] text-gray-400">Avg. Run Time</div>
                </div>
              </div>
            </div>

            {/* Sub-nav tabs */}
            <div className="flex items-center gap-1 border-t border-gray-100 pt-3 text-xs font-semibold overflow-x-auto scrollbar-none">
              {[
                "Configuration",
                "Input & Triggers",
                "Tools & Integrations",
                "Prompt & Instructions",
                "Output Format",
                "Schedule",
                "Run History",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setConfigSubTab(tab)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    configSubTab === tab
                      ? "bg-[#171918] text-white font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-tab Content */}
          {configSubTab === "Configuration" && (
            /* 3-Column Configuration Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Col 1 (3.5 cols): Basic Info & Capabilities */}
            <div className="lg:col-span-4 space-y-5">
              {/* Basic Information */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-sm text-[#171918]">Basic Information</h3>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Agent Name</label>
                  <input
                    type="text"
                    defaultValue="Research Agent"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-semibold text-emerald-700">
                    <option>● Active</option>
                    <option>Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="Finds and analyzes local businesses, extracts key information, checks online presence and scores opportunities for outreach."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Category</label>
                    <select className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white">
                      <option>Research</option>
                      <option>Outreach</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Model</label>
                    <select className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-blue-700">
                      <option>GPT-4o</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>Gemini 1.5 Pro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span>Temperature</span>
                    <span className="text-blue-600 font-bold">0.3</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" className="w-full accent-blue-600" />
                  <span className="text-[10px] text-gray-400">More focused and consistent results</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    defaultValue={4000}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>

              {/* Capabilities Toggles */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#171918]">Capabilities</h3>

                {[
                  { title: "Web Search & Data Extraction", desc: "Search Google Maps, websites and public data", on: true },
                  { title: "Website Analysis", desc: "Analyze design, SEO, mobile-friendliness", on: true },
                  { title: "Social Media Check", desc: "Find and analyze social media presence", on: true },
                  { title: "Opportunity Scoring", desc: "Score potential based on multiple factors", on: true },
                  { title: "Personalized Insights", desc: "Generate custom outreach angles", on: true },
                ].map((cap) => (
                  <label key={cap.title} className="flex items-start justify-between cursor-pointer py-1">
                    <div className="pr-3">
                      <div className="font-semibold text-gray-800 text-[11px]">{cap.title}</div>
                      <div className="text-[10px] text-gray-400">{cap.desc}</div>
                    </div>
                    <input type="checkbox" defaultChecked={cap.on} className="rounded text-[#0F5338] mt-0.5" />
                  </label>
                ))}
              </div>
            </div>

            {/* Col 2 (4.5 cols): System Prompt & Output Format */}
            <div className="lg:col-span-5 space-y-5 text-xs">
              {/* Prompt & Instructions */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#171918]">Prompt &amp; Instructions</h3>
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1">
                    <Edit size={11} /> Edit
                  </button>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-700 block mb-1">System Prompt</span>
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200 font-mono text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap">
{`You are a professional business research assistant for AgencyOS.

Your task is to find and analyze local businesses based on the given location, category and search parameters.

For each business, extract:
- Business name, category, address, phone, email (if available)
- Website URL and social media links
- Google reviews count and rating
- Analyze website quality (design, mobile-friendliness, SEO)
- Identify potential opportunities for a modern, professional website
- Provide a short personalized outreach angle

Return structured JSON data for each business.`}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-700 block mb-1">User Prompt Template</span>
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-200 font-mono text-[10px] text-gray-700 leading-relaxed whitespace-pre-wrap">
{`Search for {{business_type}} businesses in {{location}} within {{radius}} km.

Focus on businesses that:
- Have low or outdated websites
- Have good customer reviews (min {{min_reviews}})
- Are actively operating

Return top {{limit}} results with complete information and analysis.`}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
                    <span className="text-gray-400 font-semibold">Variables:</span>
                    {["business_type", "location", "radius", "min_reviews", "limit"].map((v) => (
                      <span key={v} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Output Format (JSON) */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#171918]">Output Format (JSON)</h3>
                  <button className="text-[11px] text-blue-600 font-semibold hover:underline">Edit Schema</button>
                </div>

                <div className="p-3 rounded-xl bg-[#171918] text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto">
{`{
  "name": "The Urban Kitchen",
  "category": "Restaurant",
  "address": "Connaught Place, New Delhi 110001",
  "phone": "+91 98765 43210",
  "email": "info@theurbankitchen.in",
  "website": "https://theurbankitchen.in",
  "rating": 4.4,
  "review_count": 1234,
  "social_media": {
    "instagram": "https://instagram.com/theurbankitchen",
    "facebook": "https://facebook.com/theurbankitchen"
  }
}`}
                </div>
              </div>
            </div>

            {/* Col 3 (4 cols): Test Run Sandbox & Recent Runs */}
            <div className="lg:col-span-3 space-y-5 text-xs">
              {/* Test Run Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#171918]">Test Run</h3>
                <p className="text-[10px] text-[#68717D]">Run a test to see results before scheduling.</p>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue="Indore, Madhya Pradesh"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-1">Business Type</label>
                    <select className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs">
                      <option>Restaurant</option>
                      <option>Salon</option>
                      <option>Gym</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-1">Radius</label>
                    <select className="w-full px-2 py-1.5 rounded-lg border border-gray-300 bg-white text-xs">
                      <option>5 km</option>
                      <option>10 km</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Limit</label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-xs"
                  />
                </div>

                <button className="w-full py-2 rounded-lg bg-[#171918] hover:bg-[#232B29] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                  <Play size={12} className="fill-white" />
                  <span>Run Test Now</span>
                </button>
              </div>

              {/* Recent Runs */}
              <div className="p-5 rounded-2xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#171918]">Recent Runs</h3>
                  <span className="text-[11px] text-gray-400 hover:text-black cursor-pointer">View All →</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#171918] text-[11px]">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Indore - Restaurants</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">Completed</span>
                    </div>
                    <div className="text-[10px] text-gray-400">12 Mar 2024, 10:24 AM</div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span><strong>20</strong> Found</span>
                      <span><strong>16</strong> Qualified</span>
                      <span className="text-gray-500">2m 14s</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#171918] text-[11px]">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Jaipur - Cafes</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">Completed</span>
                    </div>
                    <div className="text-[10px] text-gray-400">12 Mar 2024, 09:18 AM</div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span><strong>25</strong> Found</span>
                      <span><strong>18</strong> Qualified</span>
                      <span className="text-gray-500">2m 32s</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-[#171918] text-[11px]">
                        <Clock size={13} className="text-blue-600" />
                        <span>Mumbai - Clinics</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700">Running</span>
                    </div>
                    <div className="text-[10px] text-gray-400">12 Mar 2024, 08:45 AM</div>
                    <div className="flex justify-between text-[11px] pt-1">
                      <span>–</span>
                      <span>–</span>
                      <span className="text-blue-600 font-bold">1m 12s Elapsed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Sub-tab 2: Input & Triggers */}
          {configSubTab === "Input & Triggers" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-8 bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm text-[#171918]">Webhook Ingest &amp; Event Triggers</h3>
                  <p className="text-[11px] text-[#68717D]">Configure when this research agent initiates automated analysis runs</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Webhook Endpoint URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://api.agencyos.ai/v1/agents/research/trigger"
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 font-mono text-[11px] text-gray-700"
                      />
                      <button className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1.5 shadow-2xs">
                        <Copy size={13} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <span className="font-semibold text-gray-700 block">Trigger Conditions</span>
                    {[
                      { title: "New map search batch initiated", desc: "Runs qualification when user clicks New Search in Map Explorer", active: true },
                      { title: "Manual lead import via CSV", desc: "Automatically scores every newly imported business row", active: true },
                      { title: "Scheduled weekday morning scan", desc: "Triggers autonomous discovery at 09:00 AM IST", active: true },
                    ].map((trig, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                        <div>
                          <div className="font-semibold text-[#171918]">{trig.title}</div>
                          <div className="text-[11px] text-gray-500">{trig.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked={trig.active} className="accent-[#171918] w-4 h-4 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-3 text-xs">
                <h4 className="font-bold text-sm text-[#171918]">Required Input Variables</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-mono font-bold text-blue-700">business_type</span>
                    <p className="text-gray-500 mt-0.5">String: e.g. "restaurant", "cafe", "clinic"</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-mono font-bold text-blue-700">location</span>
                    <p className="text-gray-500 mt-0.5">String: City, state or geographic coordinates</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="font-mono font-bold text-blue-700">radius_km</span>
                    <p className="text-gray-500 mt-0.5">Integer: 1 - 25 kilometers</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Tools & Integrations */}
          {configSubTab === "Tools & Integrations" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {[
                { name: "Google Maps Scraper", desc: "Finds place listings, phone, address, and ratings.", status: "Connected", latency: "1.2s", badge: "Primary" },
                { name: "Firecrawl Scraper", desc: "Headless browser audits website tags and mobile friendliness.", status: "Connected", latency: "2.4s", badge: "Audit" },
                { name: "Gemini 2.5 Flash", desc: "Core reasoning engine for scoring and insight synthesis.", status: "Active", latency: "650ms", badge: "LLM" },
                { name: "Resend Email Gateway", desc: "Dispatches qualified outreach drafts to inbox queue.", status: "Dry Run", latency: "180ms", badge: "Outbound" },
                { name: "Supabase Database", desc: "Stores lead records, dossiers and audit snapshots.", status: "Connected", latency: "45ms", badge: "Database" },
                { name: "WhatsApp Business API", desc: "Direct conversational messaging for verified business owners.", status: "Configured", latency: "310ms", badge: "Messaging" },
              ].map((tool, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#171918]">{tool.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{tool.badge}</span>
                  </div>
                  <p className="text-[11px] text-[#68717D]">{tool.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {tool.status}
                    </span>
                    <span className="text-gray-400">Avg {tool.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tab 4: Prompt & Instructions */}
          {configSubTab === "Prompt & Instructions" && (
            <div className="bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#171918]">System Instructions Prompt</h3>
                  <p className="text-[11px] text-[#68717D]">Defines research persona, evaluation heuristics, and opportunity scoring rubrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1 shadow-2xs">
                    <Edit size={12} />
                    <span>Edit Prompt</span>
                  </button>
                  <button className="h-7 px-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1 shadow-2xs">
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={12}
                defaultValue={`You are an elite B2B Research Agent specialized in evaluating local businesses for web design, SEO, and digital transformation opportunities.

For each business provided:
1. Verify if the official domain is live, responsive, and has SSL/HTTPS enabled.
2. Evaluate local competitive density and check customer sentiment on Google Reviews.
3. Compute an Opportunity Score (1-10) based on:
   - Outdated or missing website (High Opportunity: +4 points)
   - High Google Review volume (>200 reviews) with no table/service booking system (+3 points)
   - Poor Mobile 4G PageSpeed (<50) or missing Open Graph tags (+2 points)
4. Synthesize a concise 2-sentence developer brief describing the highest-ROI deliverable.`}
                className="w-full p-4 rounded-xl border border-gray-200 bg-[#FAF9F6] font-mono text-[11px] leading-relaxed text-gray-800 focus:outline-none"
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                <span>Prompt Length: 138 words • ~182 tokens</span>
                <span className="text-emerald-700 font-semibold">Deterministic Output Enforced (Temperature 0.3)</span>
              </div>
            </div>
          )}

          {/* Sub-tab 5: Output Format */}
          {configSubTab === "Output Format" && (
            <div className="bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#171918]">Strict JSON Schema &amp; Validation</h3>
                  <p className="text-[11px] text-[#68717D]">All model outputs are parsed and validated via Zod schemas before database persistence</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  Zod Validated
                </span>
              </div>
              <pre className="p-4 rounded-xl border border-gray-200 bg-[#171918] text-gray-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "businessName": { "type": "string" },
    "opportunityScore": { "type": "number", "minimum": 1, "maximum": 10 },
    "websiteHealth": {
      "type": "object",
      "properties": {
        "pageSpeedScore": { "type": "number" },
        "hasSSL": { "type": "boolean" },
        "mobileResponsive": { "type": "boolean" }
      },
      "required": ["pageSpeedScore", "hasSSL", "mobileResponsive"]
    },
    "opportunityFindings": {
      "type": "array",
      "items": { "type": "string" }
    },
    "recommendedTemplateSlug": { "type": "string" }
  },
  "required": ["businessName", "opportunityScore", "websiteHealth", "opportunityFindings"]
}`}
              </pre>
            </div>
          )}

          {/* Sub-tab 6: Schedule */}
          {configSubTab === "Schedule" && (
            <div className="bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-[#171918]">Recurring Autonomous Execution Schedule</h3>
                <p className="text-[11px] text-[#68717D]">Configure cron triggers and background execution intervals</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171918]">Cron Expression</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">Active</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-gray-800 bg-white p-2.5 rounded-lg border border-gray-200">
                    0 9 * * 1-5
                  </div>
                  <p className="text-[11px] text-gray-500">Executes Monday through Friday at 09:00 AM IST.</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#171918]">Safety Guardrails</span>
                    <span className="text-emerald-700 font-bold text-[11px]">Enforced</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-gray-600">
                    <div className="flex justify-between">
                      <span>Max Daily Leads Scan:</span>
                      <strong className="text-gray-800">150 businesses</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Per-lead LLM token limit:</span>
                      <strong className="text-gray-800">4,000 tokens</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Execution jitter:</span>
                      <strong className="text-gray-800">± 120 seconds</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 7: Run History */}
          {configSubTab === "Run History" && (
            <div className="bg-white rounded-xl border border-[#E7E7E2] p-5 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#171918]">Agent Execution History Logs</h3>
                  <p className="text-[11px] text-[#68717D]">Complete audit trail of past automated research runs</p>
                </div>
                <span className="text-xs text-gray-500">Total 1,248 businesses audited</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FAF9F6] border-b border-gray-200 text-gray-500 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Run ID</th>
                      <th className="py-2.5 px-3">Target Query</th>
                      <th className="py-2.5 px-3">Found</th>
                      <th className="py-2.5 px-3">Qualified</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[11px]">
                    {[
                      { id: "RUN-9421", query: "Indore • Restaurants", found: 48, qual: 32, dur: "3m 12s", status: "Completed", date: "Today, 10:30 AM" },
                      { id: "RUN-9420", query: "Jaipur • Cafes", found: 25, qual: 18, dur: "2m 32s", status: "Completed", date: "12 Mar, 09:18 AM" },
                      { id: "RUN-9419", query: "Mumbai • Clinics", found: 15, qual: 12, dur: "1m 45s", status: "Completed", date: "11 Mar, 02:40 PM" },
                      { id: "RUN-9418", query: "New Delhi • Hotels", found: 30, qual: 24, dur: "3m 48s", status: "Completed", date: "10 Mar, 11:15 AM" },
                      { id: "RUN-9417", query: "Indore • Salons & Spas", found: 42, qual: 29, dur: "2m 58s", status: "Completed", date: "09 Mar, 04:20 PM" },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">{row.id}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">{row.query}</td>
                        <td className="py-2.5 px-3 text-gray-600 font-bold">{row.found}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{row.qual}</td>
                        <td className="py-2.5 px-3 text-gray-500">{row.dur}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">{row.date}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="text-blue-600 hover:underline font-semibold">View →</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
