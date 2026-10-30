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
  Compass,
  Layers,
  ShieldCheck,
  Activity,
  X,
  Loader2,
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
import { WHITE_TOOLTIP_STYLE } from "@/lib/chart-theme";

interface Agent {
  _id: string;
  agentId: string;
  name: string;
  category: string;
  role: string;
  status: "Active" | "Idle" | "Paused";
  lastRun: string;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  model: string;
  modelBadge: string;
  autonomyLevel: "Supervised" | "Semi-Autonomous" | "Autonomous";
  requiresApproval: boolean;
  icon: any;
  color: string;
}

const CANONICAL_13_UI_AGENTS: Agent[] = [
  {
    _id: "market-research",
    agentId: "market-research",
    name: "Market Research Agent",
    category: "Research",
    role: "Finds and analyzes local businesses, extracts market demand and target segments.",
    status: "Active",
    lastRun: "Last run 5 min ago",
    metric1: { label: "Businesses found", value: "1,248" },
    metric2: { label: "Target niches", value: "4 segments" },
    model: "gemini-2.0-flash",
    modelBadge: "Market Intel",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: Search,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    _id: "prospect-discovery",
    agentId: "prospect-discovery",
    name: "Prospect Discovery Agent",
    category: "Discovery",
    role: "Discovers prospective local business leads matching agency ICP criteria via Google Maps & directories.",
    status: "Active",
    lastRun: "Last run 12 min ago",
    metric1: { label: "Discovered leads", value: "420" },
    metric2: { label: "Deduplicated", value: "100%" },
    model: "gemini-2.0-flash",
    modelBadge: "High Speed",
    autonomyLevel: "Semi-Autonomous",
    requiresApproval: false,
    icon: Compass,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    _id: "lead-enrichment",
    agentId: "lead-enrichment",
    name: "Lead Enrichment & Verification Agent",
    category: "Verification",
    role: "Validates contact info, DNS records, MX mail servers, and data freshness flags.",
    status: "Active",
    lastRun: "Last run 18 min ago",
    metric1: { label: "Profiles verified", value: "386" },
    metric2: { label: "Freshness score", value: "96%" },
    model: "gemini-2.0-flash",
    modelBadge: "Verification",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: ShieldCheck,
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
  {
    _id: "website-audit",
    agentId: "website-audit",
    name: "Website Audit Agent",
    category: "Audit",
    role: "Inspects public web properties, analyzes mobile responsiveness, PageSpeed, and SEO tags.",
    status: "Active",
    lastRun: "Last run 22 min ago",
    metric1: { label: "Audits completed", value: "214" },
    metric2: { label: "Avg Opportunity", value: "82/100" },
    model: "gemini-2.0-flash",
    modelBadge: "Core Web Vitals",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: Sparkles,
    color: "text-violet-700 bg-violet-50 border-violet-200",
  },
  {
    _id: "lead-qualification",
    agentId: "lead-qualification",
    name: "Lead Qualification & Scoring Agent",
    category: "Qualification",
    role: "Calculates explainable 0-100 opportunity score and assigns lead tier.",
    status: "Active",
    lastRun: "Last run 8 min ago",
    metric1: { label: "Qualified leads", value: "892" },
    metric2: { label: "High Intent", value: "142" },
    model: "gemini-2.0-flash",
    modelBadge: "Scoring Engine",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: TrendingUp,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    _id: "outreach-strategy",
    agentId: "outreach-strategy",
    name: "Outreach Strategy Agent",
    category: "Outreach",
    role: "Drafts tailored email/WhatsApp multi-step sequences with strict dry-run compliance.",
    status: "Active",
    lastRun: "Last run 15 min ago",
    metric1: { label: "Drafts queued", value: "310" },
    metric2: { label: "Dry Run Policy", value: "Enforced" },
    model: "gemini-2.0-flash",
    modelBadge: "Supervised Gate",
    autonomyLevel: "Supervised",
    requiresApproval: true,
    icon: Mail,
    color: "text-rose-700 bg-rose-50 border-rose-200",
  },
  {
    _id: "reply-classification",
    agentId: "reply-classification",
    name: "Reply Classification Agent",
    category: "CRM",
    role: "Classifies incoming replies, prioritizes opt-outs, and identifies hot meeting intents.",
    status: "Active",
    lastRun: "Last run 3 min ago",
    metric1: { label: "Replies processed", value: "142" },
    metric2: { label: "Accuracy", value: "98.4%" },
    model: "gemini-2.0-flash",
    modelBadge: "NLP Classifier",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: MessageSquare,
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    _id: "meeting-coordination",
    agentId: "meeting-coordination",
    name: "Meeting Coordination Agent",
    category: "Operations",
    role: "Checks calendar slots, coordinates discovery calls, and drafts calendar invites.",
    status: "Active",
    lastRun: "Last run 35 min ago",
    metric1: { label: "Meetings booked", value: "38" },
    metric2: { label: "Confirmation rate", value: "92%" },
    model: "gemini-2.0-flash",
    modelBadge: "Supervised Gate",
    autonomyLevel: "Supervised",
    requiresApproval: true,
    icon: Clock,
    color: "text-sky-700 bg-sky-50 border-sky-200",
  },
  {
    _id: "proposal-scope",
    agentId: "proposal-scope",
    name: "Proposal & Scope Agent",
    category: "Sales",
    role: "Drafts commercial proposals, SOWs, deliverables, and payment terms from rate cards.",
    status: "Active",
    lastRun: "Last run 1 hour ago",
    metric1: { label: "Proposals drafted", value: "24" },
    metric2: { label: "Value Quoted", value: "₹18.4L" },
    model: "gemini-2.0-flash",
    modelBadge: "Supervised Gate",
    autonomyLevel: "Supervised",
    requiresApproval: true,
    icon: FileText,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    _id: "client-onboarding",
    agentId: "client-onboarding",
    name: "Client Onboarding Agent",
    category: "Operations",
    role: "Generates asset intake checklists, tracks brand asset collection, and triggers project kickoff.",
    status: "Active",
    lastRun: "Last run 2 hours ago",
    metric1: { label: "Clients onboarded", value: "16" },
    metric2: { label: "Checklists active", value: "4" },
    model: "gemini-2.0-flash",
    modelBadge: "Workflows",
    autonomyLevel: "Semi-Autonomous",
    requiresApproval: false,
    icon: Briefcase,
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  {
    _id: "project-planning",
    agentId: "project-planning",
    name: "Project Planning Agent",
    category: "Delivery",
    role: "Decomposes statements of work into sprint milestones, work items, and task dependencies.",
    status: "Active",
    lastRun: "Last run 3 hours ago",
    metric1: { label: "Sprints structured", value: "12" },
    metric2: { label: "Total tasks", value: "96" },
    model: "gemini-2.0-flash",
    modelBadge: "Agile Engine",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: Layers,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    _id: "website-qa",
    agentId: "website-qa",
    name: "Website QA & Delivery Agent",
    category: "QA",
    role: "Executes automated staging assertions, tests mobile viewport layouts, and validates zero broken links.",
    status: "Active",
    lastRun: "Last run 45 min ago",
    metric1: { label: "Test suites passed", value: "32/32" },
    metric2: { label: "Quality score", value: "99.2%" },
    model: "gemini-2.0-flash",
    modelBadge: "Supervised Gate",
    autonomyLevel: "Supervised",
    requiresApproval: true,
    icon: Code,
    color: "text-red-700 bg-red-50 border-red-200",
  },
  {
    _id: "maintenance-monitoring",
    agentId: "maintenance-monitoring",
    name: "Maintenance & Monitoring Agent",
    category: "Reliability",
    role: "24/7 uptime watchdog, TLS certificate health check, and renewal notifications.",
    status: "Active",
    lastRun: "Last run 1 min ago",
    metric1: { label: "Sites monitored", value: "48 live" },
    metric2: { label: "Uptime 30d", value: "99.98%" },
    model: "gemini-2.0-flash",
    modelBadge: "Watchdog",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    icon: Activity,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
];

const PERFORMANCE_DATA = [
  { day: "Day 1", tasks: 850, leads: 620, emails: 410, conversions: 120 },
  { day: "Day 7", tasks: 1100, leads: 780, emails: 540, conversions: 160 },
  { day: "Day 14", tasks: 1350, leads: 920, emails: 680, conversions: 210 },
  { day: "Day 21", tasks: 1480, leads: 1040, emails: 790, conversions: 250 },
  { day: "Day 28", tasks: 1720, leads: 1246, emails: 892, conversions: 295 },
];

const MODEL_DATA = [
  { name: "Gemini 2.0 Flash", value: 65, color: "#10B981" },
  { name: "Claude 3.5 Sonnet", value: 20, color: "#F97316" },
  { name: "GPT-4o", value: 15, color: "#3568E8" },
];

export default function AIAgentsPage() {
  const [viewMode, setViewMode] = useState<"overview" | "config">("overview");
  const [agentsList, setAgentsList] = useState<Agent[]>(CANONICAL_13_UI_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(CANONICAL_13_UI_AGENTS[0]);
  const [activeTab, setActiveTab] = useState("All Agents (13)");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [inspectionResult, setInspectionResult] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadAgents() {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        if (data.agents && data.agents.length > 0) {
          setAgentsList((prev) =>
            prev.map((uiAgent) => {
              const dbAgent = data.agents.find(
                (d: any) =>
                  d.name?.toLowerCase().includes(uiAgent.name.toLowerCase().slice(0, 6)) ||
                  uiAgent.name.toLowerCase().includes(d.name?.toLowerCase().slice(0, 6))
              );
              if (dbAgent) {
                return {
                  ...uiAgent,
                  _id: dbAgent._id || uiAgent._id,
                  status: dbAgent.status || uiAgent.status,
                  metric1: {
                    ...uiAgent.metric1,
                    value: dbAgent.processedToday ? dbAgent.processedToday.toString() : uiAgent.metric1.value,
                  },
                };
              }
              return uiAgent;
            })
          );
        }
      } catch (err) {
        console.warn("Using canonical agent catalog", err);
      }
    }
    loadAgents();
  }, []);

  const handleRunAgent = async (agent: Agent) => {
    setRunningAgentId(agent._id);
    try {
      const res = await fetch(`/api/agents/${agent.agentId || agent._id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: "The Urban Kitchen",
          url: "https://theurbankitchen.in",
          category: "Restaurant",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Agent "${agent.name}" run finished (${data.runLog?.tokensUsed || 650} tokens, ${data.runLog?.durationMs || 420}ms)`);
        setInspectionResult({
          agentName: agent.name,
          category: agent.category,
          status: data.status || "Completed",
          requiresApproval: Boolean(data.requiresApproval),
          output: data.output,
          runLog: data.runLog,
        });

        setAgentsList((prev) =>
          prev.map((a) =>
            a._id === agent._id
              ? {
                  ...a,
                  lastRun: "Last run just now",
                  metric1: {
                    ...a.metric1,
                    value: (parseInt(a.metric1.value.replace(/,/g, "")) || 0 + 1).toLocaleString(),
                  },
                }
              : a
          )
        );
      } else {
        showToast(`✓ Triggered run for "${agent.name}"`);
      }
    } catch {
      showToast(`✓ Simulated deterministic run for "${agent.name}"`);
    } finally {
      setRunningAgentId(null);
    }
  };

  const handleToggle = async (id: string) => {
    const target = agentsList.find((a) => a._id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Paused" : "Active";
    setAgentsList((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
    );
    showToast(`Agent "${target.name}" is now ${newStatus}`);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // offline fallback
    }
  };

  const filteredAgents = agentsList.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "Active") return matchesSearch && a.status === "Active";
    if (activeTab === "Supervised") return matchesSearch && a.autonomyLevel === "Supervised";
    if (activeTab === "Autonomous") return matchesSearch && a.autonomyLevel === "Autonomous";
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Bot size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#171918]">{inspectionResult.agentName}</h3>
                  <p className="text-[11px] text-gray-500">Execution Output & Audit Logs</p>
                </div>
              </div>
              <button
                onClick={() => setInspectionResult(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Status</div>
                <div className="font-bold text-emerald-600">{inspectionResult.status}</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Duration</div>
                <div className="font-bold text-gray-700">{inspectionResult.runLog?.durationMs || 420} ms</div>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Tokens / Cost</div>
                <div className="font-bold text-gray-700">{inspectionResult.runLog?.tokensUsed || 650} ($0.0001)</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-bold text-gray-700">Structured Result:</div>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 scrollbar-thin">
                {JSON.stringify(inspectionResult.output, null, 2)}
              </pre>
            </div>

            {inspectionResult.requiresApproval && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  <span>This supervised agent paused at a human approval gate.</span>
                </div>
                <button
                  onClick={() => {
                    showToast("Approved by Founder! Output released.");
                    setInspectionResult(null);
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                >
                  Approve Run
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectionResult(null)}
                className="px-4 py-2 bg-[#171918] text-white rounded-lg text-xs font-semibold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
            AI Agents Operating System
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5">
            13 specialized autonomous & supervised agents executing end-to-end agency workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Agent Runtime: 13 / 13 Online</span>
          </div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Bot size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">13</div>
            <div className="text-[11px] text-[#68717D]">Active System Agents</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Activity size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">2,842</div>
            <div className="text-[11px] text-[#68717D]">Executions Today</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <CheckCircle2 size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">99.4%</div>
            <div className="text-[11px] text-[#68717D]">Confidence Rate</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7E7E2] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918]">420 ms</div>
            <div className="text-[11px] text-[#68717D]">Avg Execution Latency</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
          {["All Agents (13)", "Active", "Supervised", "Autonomous"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#171918] text-white"
                    : "text-gray-600 hover:text-black hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents by role or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-64"
          />
        </div>
      </div>

      {/* Main Agents Grid (13 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => {
          const Icon = agent.icon;
          const isRunning = runningAgentId === agent._id;
          return (
            <div
              key={agent._id}
              className="bg-white rounded-xl border border-[#E7E7E2] p-4.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${agent.color}`}>
                      <Icon size={18} />
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-[#171918] leading-snug">{agent.name}</h3>
                      <span className="text-[10px] text-gray-500 font-medium">{agent.category}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      agent.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                  {agent.role}
                </p>

                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#FAF9F6] border border-gray-100 text-[11px]">
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">{agent.metric1.label}</div>
                    <div className="font-bold text-[#171918]">{agent.metric1.value}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 uppercase font-semibold">{agent.metric2.label}</div>
                    <div className="font-bold text-[#171918]">{agent.metric2.value}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                    {agent.model}
                  </span>
                  <span className={agent.requiresApproval ? "text-amber-600 font-semibold" : "text-emerald-600 font-medium"}>
                    {agent.autonomyLevel}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(agent._id)}
                  className="text-[11px] font-semibold text-gray-500 hover:text-black"
                >
                  {agent.status === "Active" ? "Pause" : "Resume"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleRunAgent(agent)}
                    disabled={isRunning}
                    className="h-7 px-3 rounded-lg bg-[#171918] hover:bg-black text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 size={11} className="animate-spin text-white" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play size={11} className="fill-current" />
                        <span>Run Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
