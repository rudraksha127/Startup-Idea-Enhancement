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
  ArrowLeft,
  Settings,
  Terminal,
  Cpu,
  Database,
  Save,
  Download,
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
  systemPrompt?: string;
  userPromptTemplate?: string;
  capabilities?: {
    webScraping: boolean;
    placesApi: boolean;
    emailVerification: boolean;
    opportunityScoring: boolean;
    crmSync: boolean;
  };
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
    systemPrompt: "You are an expert market intelligence analyst specialized in local digital economy expansion. Analyze competition density, pricing tiers, and underserved market segments for {{business_type}} in {{location}}.",
    userPromptTemplate: "Analyze market opportunity for {{business_type}} within {{radius}} radius of {{location}}.",
    capabilities: {
      webScraping: true,
      placesApi: true,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
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
    systemPrompt: "You are a prospect discovery specialist. Identify high-potential SMB leads from Google Maps Platform query results matching category {{business_type}} with rating under {{rating_min}} or missing website.",
    userPromptTemplate: "Extract {{business_type}} in {{location}} within {{radius}} radius.",
    capabilities: {
      webScraping: true,
      placesApi: true,
      emailVerification: true,
      opportunityScoring: true,
      crmSync: true,
    },
    icon: Compass,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    _id: "website-audit",
    agentId: "website-audit",
    name: "Website Audit Agent",
    category: "Audit",
    role: "Crawls existing SMB sites, identifies performance bottlenecks, mobile failures, and SEO gaps.",
    status: "Active",
    lastRun: "Last run 20 min ago",
    metric1: { label: "Audits executed", value: "186" },
    metric2: { label: "Avg website score", value: "58/100" },
    model: "gemini-2.0-flash",
    modelBadge: "Technical",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    systemPrompt: "You are a technical web performance auditor. Audit target URL {{website_url}} across 6 core vectors: LCP page speed, mobile responsive viewport, SSL certificate, meta tags, schema markup, and call-to-actions.",
    userPromptTemplate: "Perform diagnostic technical audit on {{website_url}}.",
    capabilities: {
      webScraping: true,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
    icon: Code,
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    _id: "opportunity-scoring",
    agentId: "opportunity-scoring",
    name: "Opportunity Scoring Agent",
    category: "Intelligence",
    role: "Calculates commercial value score (1-10) based on review volume, traffic potential, and website health.",
    status: "Active",
    lastRun: "Last run 32 min ago",
    metric1: { label: "High opp leads", value: "88" },
    metric2: { label: "Avg opp score", value: "8.4/10" },
    model: "gemini-2.0-flash",
    modelBadge: "Predictive",
    autonomyLevel: "Autonomous",
    requiresApproval: false,
    systemPrompt: "You are a deal prioritization intelligence engine. Calculate commercial upside score (1-10) using formula: Inverse(Website Quality) * Review Volume Weight * Local Search Density.",
    userPromptTemplate: "Calculate opportunity score for {{business_name}} at {{location}}.",
    capabilities: {
      webScraping: false,
      placesApi: true,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
    icon: TrendingUp,
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    _id: "lead-enrichment",
    agentId: "lead-enrichment",
    name: "Lead Enrichment Agent",
    category: "Enrichment",
    role: "Finds decision maker contact details, validates phone numbers, and verifies deliverable email addresses.",
    status: "Active",
    lastRun: "Last run 15 min ago",
    metric1: { label: "Enriched contacts", value: "312" },
    metric2: { label: "Verified emails", value: "94%" },
    model: "gemini-2.0-flash",
    modelBadge: "Multi-Source",
    autonomyLevel: "Semi-Autonomous",
    requiresApproval: false,
    systemPrompt: "You are an executive enrichment researcher. Uncover verified business owner contacts, WhatsApp lines, and official emails for {{business_name}}.",
    userPromptTemplate: "Enrich executive contact details for {{business_name}} in {{location}}.",
    capabilities: {
      webScraping: true,
      placesApi: true,
      emailVerification: true,
      opportunityScoring: false,
      crmSync: true,
    },
    icon: ShieldCheck,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    _id: "email-outreach",
    agentId: "email-outreach",
    name: "Email Outreach Agent",
    category: "Outreach",
    role: "Drafts hyper-personalized value pitches citing specific audit findings and simulated redesign previews.",
    status: "Active",
    lastRun: "Last run 2 min ago",
    metric1: { label: "Emails sent", value: "892" },
    metric2: { label: "Open rate", value: "68.4%" },
    model: "gemini-2.0-flash",
    modelBadge: "Personalized",
    autonomyLevel: "Semi-Autonomous",
    requiresApproval: false,
    systemPrompt: "You are a consultative sales copywriter. Generate ultra-tailored cold outreach highlighting specific website vulnerabilities and offering a free interactive prototype.",
    userPromptTemplate: "Draft cold email pitch for {{owner_name}} at {{business_name}} regarding their {{business_type}} website.",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: true,
      opportunityScoring: true,
      crmSync: true,
    },
    icon: Mail,
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    _id: "whatsapp-outreach",
    agentId: "whatsapp-outreach",
    name: "WhatsApp Outreach Agent",
    category: "Outreach",
    role: "Dispatches direct WhatsApp messages to verified business mobile numbers with quick interactive demo links.",
    status: "Active",
    lastRun: "Last run 8 min ago",
    metric1: { label: "Messages sent", value: "430" },
    metric2: { label: "Response rate", value: "34.2%" },
    model: "gemini-2.0-flash",
    modelBadge: "Direct Link",
    autonomyLevel: "Semi-Autonomous",
    requiresApproval: false,
    systemPrompt: "Draft friendly, professional WhatsApp business messages with concise bullet points and 1 clear action link.",
    userPromptTemplate: "Generate WhatsApp intro message for {{business_name}}.",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: true,
      opportunityScoring: false,
      crmSync: true,
    },
    icon: MessageSquare,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    _id: "inbox-triage",
    agentId: "inbox-triage",
    name: "Inbox & Reply Triage Agent",
    category: "Communications",
    role: "Classifies incoming responses, detects positive intent, and drafts contextual replies for human approval.",
    status: "Active",
    lastRun: "Last run 4 min ago",
    metric1: { label: "Triaged replies", value: "142" },
    metric2: { label: "Intent accuracy", value: "98.6%" },
    model: "gemini-2.0-flash",
    modelBadge: "Supervised Gate",
    autonomyLevel: "Supervised",
    requiresApproval: true,
    systemPrompt: "Classify incoming replies into: Interested, Pricing Question, Meeting Request, Objection, or Unsubscribe. Formulate contextual next-step answer.",
    userPromptTemplate: "Classify incoming reply from {{sender_name}}: '{{reply_text}}'",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
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
    systemPrompt: "Structure formal agency proposal with milestones: UX Wireframe, Next.js Frontend, Cloudflare Edge Deployment, Local SEO Schema, and 30-day warranty.",
    userPromptTemplate: "Generate formal proposal for {{business_name}} for total value of {{budget}}.",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
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
    systemPrompt: "Create automated client onboarding checklists including logo, color palette, menu/services catalog, staff photos, and domain DNS access.",
    userPromptTemplate: "Generate onboarding intake checklist for {{business_name}}.",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: true,
      opportunityScoring: false,
      crmSync: true,
    },
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
    systemPrompt: "Break down client deliverable into 4 discrete sprint milestones with explicit dependencies and verification criteria.",
    userPromptTemplate: "Create project sprint plan for {{project_name}}.",
    capabilities: {
      webScraping: false,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: false,
      crmSync: true,
    },
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
    systemPrompt: "Validate staging URL for Lighthouse score > 90, zero console errors, mobile touch targets >= 48px, and valid Schema.org tags.",
    userPromptTemplate: "Run full QA test suite on staging build {{staging_url}}.",
    capabilities: {
      webScraping: true,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: true,
      crmSync: true,
    },
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
    systemPrompt: "Monitor endpoint HTTP status codes, latency percentiles, SSL expiration days remaining, and DNS health.",
    userPromptTemplate: "Check health status for all live client production URLs.",
    capabilities: {
      webScraping: true,
      placesApi: false,
      emailVerification: false,
      opportunityScoring: false,
      crmSync: true,
    },
    icon: Activity,
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
];

const PERFORMANCE_DATA = [
  { agent: "Prospect", tasks: 420 },
  { agent: "Auditor", tasks: 312 },
  { agent: "Outreach", tasks: 892 },
  { agent: "Triage", tasks: 184 },
  { agent: "QA", tasks: 96 },
];

const MODEL_DATA = [
  { name: "Gemini 2.0 Flash", value: 65, color: "#10B981" },
  { name: "Claude 3.5 Sonnet", value: 20, color: "#F97316" },
  { name: "GPT-4o", value: 15, color: "#3568E8" },
];

const RECENT_RUNS_DATA = [
  { id: "r1", agent: "Prospect Discovery Agent", task: "Google Places Discovery", trigger: "Schedule (09:00 AM)", duration: "1.4s", status: "Success", result: "24 leads found" },
  { id: "r2", agent: "Email Outreach Agent", task: "Batch Cold Outreach", trigger: "Event Trigger", duration: "2.1s", status: "Success", result: "48 emails dispatched" },
  { id: "r3", agent: "Website Audit Agent", task: "Mobile Speed Diagnostics", trigger: "Manual Run", duration: "3.2s", status: "Success", result: "Audit Score: 62/100" },
  { id: "r4", agent: "Inbox & Reply Triage", task: "Intent Classification", trigger: "Webhook", duration: "0.8s", status: "Needs Approval", result: "Positive Intent Detected" },
];

const UPCOMING_TASKS_DATA = [
  { id: "u1", agent: "Maintenance Watchdog", scheduled: "In 4 mins", task: "Health Check (48 domains)", priority: "Normal" },
  { id: "u2", agent: "Prospect Discovery", scheduled: "In 25 mins", task: "Indore Cafes Scan (Radius 10km)", priority: "High" },
  { id: "u3", agent: "Email Outreach", scheduled: "Tomorrow 10:00 AM", task: "Sequence Step #2 Follow-ups", priority: "Normal" },
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

  // Configuration View Subtabs & State
  const [configTab, setConfigTab] = useState<"basic" | "prompts" | "tools" | "history">("basic");
  const [editedAgent, setEditedAgent] = useState<Agent>(CANONICAL_13_UI_AGENTS[0]);
  const [testLocation, setTestLocation] = useState("Connaught Place, New Delhi");
  const [testCategory, setTestCategory] = useState("Restaurant");
  const [testRadius, setTestRadius] = useState("5 km");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationOutput, setSimulationOutput] = useState<any | null>(null);

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

  const handleOpenConfig = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditedAgent({ ...agent });
    setSimulationOutput(null);
    setViewMode("config");
  };

  const handleRunAgent = async (agent: Agent) => {
    setRunningAgentId(agent._id);
    try {
      const idempotencyKey = `ui_${agent.agentId || agent._id}_${Date.now()}`;
      const res = await fetch(`/api/agents/${agent.agentId || agent._id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: `${testCategory} (${testLocation.split(",")[0]})`,
          category: testCategory,
          location: testLocation,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const tokens = data.runLog?.tokensUsed ?? 0;
        const duration = data.runLog?.durationMs ?? 0;
        showToast(`Agent "${agent.name}" finished (${tokens} tokens, ${duration}ms)`);
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
                    value: ((parseInt(a.metric1.value.replace(/,/g, ""), 10) || 0) + 1).toLocaleString(),
                  },
                }
              : a
          )
        );
      } else {
        showToast(data?.error || `Execution blocked for "${agent.name}"`);
      }
    } catch {
      showToast(`Network error executing "${agent.name}"`);
    } finally {
      setRunningAgentId(null);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/agents/${editedAgent.agentId || editedAgent._id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: `${testCategory} at ${testLocation.split(",")[0]}`,
          category: testCategory,
          location: testLocation,
          radius: testRadius,
          idempotencyKey: `sim_${editedAgent.agentId || editedAgent._id}_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSimulationOutput({
          status: `HTTP ${res.status} - Rejected`,
          latency: "0 ms",
          tokens: "0 tokens",
          cost: "$0.00",
          output: { error: data?.error || "Execution failed" },
        });
        showToast(data?.error || "Simulation rejected");
        return;
      }
      setSimulationOutput({
        status: `${data.status || "Completed"} (${data.runLog?.mode || "deterministic"})`,
        latency: `${data.runLog?.durationMs ?? 0} ms`,
        tokens: `${data.runLog?.tokensUsed ?? 0} tokens`,
        cost: `$${Number(data.runLog?.costUsd ?? 0).toFixed(6)}`,
        output: data.output,
      });
      showToast(`Execution completed for ${editedAgent.name}`);
    } catch {
      setSimulationOutput({
        status: "Network Error",
        latency: "0 ms",
        tokens: "0 tokens",
        cost: "$0.00",
        output: { error: "Unable to reach /api/agents execution endpoint" },
      });
      showToast("Failed to reach agent execution API");
    } finally {
      setIsSimulating(false);
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

  const handleSaveConfig = () => {
    setAgentsList((prev) =>
      prev.map((a) => (a._id === editedAgent._id ? { ...editedAgent } : a))
    );
    showToast(`✓ Saved configuration for "${editedAgent.name}"`);
  };

  const insertVariable = (varName: string) => {
    setEditedAgent((prev) => ({
      ...prev,
      systemPrompt: (prev.systemPrompt || "") + ` {{${varName}}}`,
    }));
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
          <div className="bg-white dark:bg-[#151D1A] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#22302B] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Bot size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#171918] dark:text-white">{inspectionResult.agentName}</h3>
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

      {/* ========================================================================= */}
      {/* VIEW MODE 1: CONFIGURATION SCREEN (AgencyOS AI Agent Configuration)      */}
      {/* ========================================================================= */}
      {viewMode === "config" ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Breadcrumbs & Configuration Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("overview")}
                className="h-8 px-2.5 rounded-lg border border-gray-200 bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ArrowLeft size={13} />
                <span>Back to AI Agents</span>
              </button>

              <div className="h-4 w-px bg-gray-300" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[#171918] dark:text-white tracking-tight">{editedAgent.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ● Active
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700">
                    v2.4.1
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure model parameters, instructions, tool permissions, and live test simulations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunAgent(editedAgent)}
                disabled={Boolean(runningAgentId)}
                className="h-8 px-3 rounded-lg border border-gray-200 bg-white dark:bg-[#151D1A] hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {runningAgentId ? <Loader2 size={13} className="animate-spin" /> : <Play size={12} />}
                <span>Test Live</span>
              </button>

              <button
                onClick={handleSaveConfig}
                className="h-8 px-3.5 rounded-lg bg-[#171918] hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Save size={13} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200 text-xs font-semibold">
            {[
              { id: "basic", label: "Basic Config", icon: Settings },
              { id: "prompts", label: "Prompts & Instructions", icon: Terminal },
              { id: "tools", label: "Tools & Capabilities", icon: Cpu },
              { id: "history", label: "Run History & Audits", icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = configTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className={`pb-2.5 px-3 transition-colors border-b-2 inline-flex items-center gap-1.5 ${
                    isActive
                      ? "border-[#171918] text-[#171918] dark:text-white font-bold"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Split: Form Editor (Left) & Live Simulator (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Config Panels */}
            <div className="lg:col-span-7 space-y-4">
              {/* Basic Config Tab Content */}
              {configTab === "basic" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3.5 shadow-2xs">
                    <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                      General Information
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Agent Name</label>
                        <input
                          type="text"
                          value={editedAgent.name}
                          onChange={(e) => setEditedAgent({ ...editedAgent, name: e.target.value })}
                          className="w-full h-8.5 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Category</label>
                          <select
                            value={editedAgent.category}
                            onChange={(e) => setEditedAgent({ ...editedAgent, category: e.target.value })}
                            className="w-full h-8.5 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                          >
                            {["Research", "Discovery", "Audit", "Intelligence", "Enrichment", "Outreach", "Communications", "Sales", "Operations", "Delivery", "QA", "Reliability"].map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-1">Inference Model</label>
                          <select
                            value={editedAgent.model}
                            onChange={(e) => setEditedAgent({ ...editedAgent, model: e.target.value })}
                            className="w-full h-8.5 px-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black font-medium"
                          >
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest / Production)</option>
                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (High Reasoning)</option>
                            <option value="gpt-4o">GPT-4o (Multimodal)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">Role & Objective</label>
                        <textarea
                          rows={2}
                          value={editedAgent.role}
                          onChange={(e) => setEditedAgent({ ...editedAgent, role: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Autonomy & Guardrails Card */}
                  <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3.5 shadow-2xs">
                    <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                      Autonomy & Approval Gates
                    </h3>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      {[
                        { title: "Autonomous", desc: "Executes end-to-end without stopping" },
                        { title: "Semi-Autonomous", desc: "Auto-executes within rate boundaries" },
                        { title: "Supervised", desc: "Pauses for founder approval before mutating" },
                      ].map((lvl) => {
                        const isSelected = editedAgent.autonomyLevel === lvl.title;
                        return (
                          <div
                            key={lvl.title}
                            onClick={() => setEditedAgent({ ...editedAgent, autonomyLevel: lvl.title as any })}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#171918] text-white border-[#171918] shadow-2xs"
                                : "bg-white dark:bg-[#151D1A] text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="font-bold text-xs">{lvl.title}</div>
                            <div className={`text-[10px] mt-0.5 ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                              {lvl.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#22302B] text-xs">
                      <div>
                        <span className="font-semibold text-gray-800">Human-in-the-Loop Gate</span>
                        <p className="text-[11px] text-gray-400">Require manual click approval before sending external emails or writing DB updates.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editedAgent.requiresApproval}
                        onChange={(e) => setEditedAgent({ ...editedAgent, requiresApproval: e.target.checked })}
                        className="w-4 h-4 rounded text-black focus:ring-black accent-[#171918]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Prompts & Instructions Tab */}
              {configTab === "prompts" && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                        System Prompt
                      </h3>
                      <span className="text-[11px] text-gray-400 font-mono">Tokens: ~120</span>
                    </div>

                    {/* Variable Pills */}
                    <div className="space-y-1">
                      <div className="text-[11px] text-gray-500 font-medium">Click to insert dynamic variable:</div>
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {["business_type", "location", "radius", "rating_min", "website_url", "owner_name"].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => insertVariable(v)}
                            className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-mono transition-colors"
                          >
                            + {`{{${v}}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={6}
                      value={editedAgent.systemPrompt || ""}
                      onChange={(e) => setEditedAgent({ ...editedAgent, systemPrompt: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-900 bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed"
                    />
                  </div>

                  <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-2 shadow-2xs">
                    <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                      User Prompt Template
                    </h3>
                    <input
                      type="text"
                      value={editedAgent.userPromptTemplate || ""}
                      onChange={(e) => setEditedAgent({ ...editedAgent, userPromptTemplate: e.target.value })}
                      className="w-full h-8.5 px-3 rounded-lg border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Tools & Capabilities Tab */}
              {configTab === "tools" && (
                <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3.5 shadow-2xs">
                  <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                    Agent Capabilities & Sandboxed Tools
                  </h3>

                  <div className="space-y-3 text-xs">
                    {[
                      { key: "placesApi", name: "Google Places API (New)", desc: "Allows querying real-time local business coordinates, ratings, and phones." },
                      { key: "webScraping", name: "Web Scraping & HTML Parser", desc: "Extracts client landing pages, evaluates Lighthouse speed, and detects broken links." },
                      { key: "emailVerification", name: "Email & MX Verifier", desc: "Verifies deliverability before sending cold outreach sequences." },
                      { key: "opportunityScoring", name: "Opportunity Score Engine", desc: "Calculates 1-10 priority scoring based on website gaps and review volume." },
                      { key: "crmSync", name: "Leads Database Auto-Sync", desc: "Saves high-scoring candidates directly into MongoDB leads collection." },
                    ].map((tool) => {
                      const enabled = Boolean(editedAgent.capabilities?.[tool.key as keyof typeof editedAgent.capabilities]);
                      return (
                        <div key={tool.key} className="flex items-start justify-between p-2.5 rounded-lg bg-gray-50/60 border border-gray-100 dark:border-[#22302B]">
                          <div>
                            <div className="font-bold text-gray-900">{tool.name}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{tool.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => {
                              const caps = { ...(editedAgent.capabilities || { webScraping: true, placesApi: true, emailVerification: true, opportunityScoring: true, crmSync: true }) };
                              caps[tool.key as keyof typeof caps] = e.target.checked;
                              setEditedAgent({ ...editedAgent, capabilities: caps });
                            }}
                            className="w-4 h-4 rounded text-black focus:ring-black accent-[#171918] mt-0.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Run History Tab */}
              {configTab === "history" && (
                <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
                  <h3 className="text-xs font-bold text-[#171918] dark:text-white uppercase tracking-wider text-gray-500">
                    Recent Execution Logs
                  </h3>
                  <div className="space-y-2 text-xs">
                    {RECENT_RUNS_DATA.map((run) => (
                      <div key={run.id} className="p-3 rounded-lg border border-gray-100 dark:border-[#22302B] bg-[#FAF9F6] dark:bg-[#121816] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-gray-900">{run.task}</div>
                          <div className="text-[10px] text-gray-400">{run.trigger} • {run.duration}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {run.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Simulator & Test Runner */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#171918] text-white rounded-xl p-5 space-y-4 shadow-xl border border-gray-800">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={15} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-200">
                      Live Test Simulator
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                    Sandbox Mode
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Test Location</label>
                    <input
                      type="text"
                      value={testLocation}
                      onChange={(e) => setTestLocation(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={testCategory}
                        onChange={(e) => setTestCategory(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Radius</label>
                      <input
                        type="text"
                        value={testRadius}
                        onChange={(e) => setTestRadius(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="w-full h-8.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                  >
                    {isSimulating ? <Loader2 size={13} className="animate-spin text-black" /> : <Play size={12} className="fill-current" />}
                    <span>{isSimulating ? "Executing Simulator..." : "▶ Run Test Now"}</span>
                  </button>
                </div>

                {/* Simulation Output Window */}
                {simulationOutput && (
                  <div className="space-y-2 pt-2 border-t border-gray-800 animate-in fade-in">
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-mono">
                      <div className="p-1.5 bg-gray-900 rounded">Lat: <span className="text-emerald-400 font-bold">{simulationOutput.latency}</span></div>
                      <div className="p-1.5 bg-gray-900 rounded">Tok: <span className="text-emerald-400 font-bold">{simulationOutput.tokens}</span></div>
                      <div className="p-1.5 bg-gray-900 rounded">Cost: <span className="text-emerald-400 font-bold">{simulationOutput.cost}</span></div>
                    </div>

                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-black text-emerald-400 font-mono text-[10.5px] max-h-56 overflow-y-auto overflow-x-auto scrollbar-thin border border-gray-800">
                        {JSON.stringify(simulationOutput.output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW MODE 2: OVERVIEW SCREEN (AgencyOS AI Agents Dashboard)               */
        /* ========================================================================= */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
                AI Agents Operating System
              </h1>
              <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
                13 specialized autonomous & supervised agents executing end-to-end agency workflows.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Agent Runtime: 13 / 13 Online</span>
              </div>
            </div>
          </div>

          {/* 5 KPI Summary Cards matching Reference Mockup */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Bot size={16} />
              </span>
              <div>
                <div className="text-lg font-bold text-[#171918] dark:text-white">13 / 13</div>
                <div className="text-[10px] text-[#68717D] dark:text-[#9AA29E]">Active Agents</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Activity size={16} />
              </span>
              <div>
                <div className="text-lg font-bold text-[#171918] dark:text-white">1,428</div>
                <div className="text-[10px] text-[#68717D] dark:text-[#9AA29E]">Tasks Done (+18%)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Mail size={16} />
              </span>
              <div>
                <div className="text-lg font-bold text-[#171918] dark:text-white">892</div>
                <div className="text-[10px] text-[#68717D] dark:text-[#9AA29E]">Emails Sent (+12%)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <CheckCircle2 size={16} />
              </span>
              <div>
                <div className="text-lg font-bold text-[#171918] dark:text-white">348</div>
                <div className="text-[10px] text-[#68717D] dark:text-[#9AA29E]">Leads Qualified</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Clock size={16} />
              </span>
              <div>
                <div className="text-lg font-bold text-[#171918] dark:text-white">1.8s</div>
                <div className="text-[10px] text-[#68717D] dark:text-[#9AA29E]">Avg Task Time</div>
              </div>
            </div>
          </div>

          {/* Main 12-Column Grid: Left Agent Catalog (8 cols) + Right Analytics Rail (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8 space-y-4">
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
                    placeholder="Search agents by role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white dark:bg-[#151D1A] text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-56 shadow-2xs"
                  />
                </div>
              </div>

              {/* Agents Grid (2 columns on left rail) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredAgents.map((agent) => {
                  const Icon = agent.icon;
                  const isRunning = runningAgentId === agent._id;
                  return (
                    <div
                      key={agent._id}
                      className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${agent.color}`}>
                              <Icon size={16} />
                            </span>
                            <div>
                              <h3 className="font-bold text-xs text-[#171918] dark:text-white leading-snug">{agent.name}</h3>
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

                        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#FAF9F6] dark:bg-[#121816] border border-gray-100 dark:border-[#22302B] text-[11px]">
                          <div>
                            <div className="text-[9px] text-gray-400 uppercase font-semibold">{agent.metric1.label}</div>
                            <div className="font-bold text-[#171918] dark:text-white">{agent.metric1.value}</div>
                          </div>
                          <div>
                            <div className="text-[9px] text-gray-400 uppercase font-semibold">{agent.metric2.label}</div>
                            <div className="font-bold text-[#171918] dark:text-white">{agent.metric2.value}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                            {agent.model}
                          </span>
                          <span className={agent.requiresApproval ? "text-amber-600 font-semibold" : "text-emerald-600 font-medium"}>
                            {agent.autonomyLevel}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 dark:border-[#22302B] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenConfig(agent)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Settings size={12} />
                          <span>Configure</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggle(agent._id)}
                            className="text-[11px] font-semibold text-gray-500 hover:text-black px-1.5"
                          >
                            {agent.status === "Active" ? "Pause" : "Resume"}
                          </button>

                          <button
                            onClick={() => handleRunAgent(agent)}
                            disabled={isRunning}
                            className="h-6.5 px-2.5 rounded-lg bg-[#171918] hover:bg-black text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {isRunning ? <Loader2 size={10} className="animate-spin text-white" /> : <Play size={9} className="fill-current" />}
                            <span>Run</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Columns: Performance Charts & Templates */}
            <div className="lg:col-span-4 space-y-4">
              {/* Agents Performance Bar Chart */}
              <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#171918] dark:text-white">Agents Performance</h3>
                  <span className="text-[11px] text-gray-400">Tasks Handled</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="agent" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip {...WHITE_TOOLTIP_STYLE} />
                      <Bar dataKey="tasks" fill="#171918" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Usage Donut */}
              <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#171918] dark:text-white">Model Usage</h3>
                  <span className="text-[11px] text-gray-400">Tokens %</span>
                </div>
                <div className="h-36 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={MODEL_DATA} innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={4}>
                        {MODEL_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip {...WHITE_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-around text-[10px] text-gray-500 pt-1 border-t border-gray-100 dark:border-[#22302B]">
                  {MODEL_DATA.map((m) => (
                    <div key={m.name} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span>{m.name.split(" ")[0]} ({m.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Agent Templates */}
              <div className="bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-[#171918] dark:text-white">AI Agent Templates</h3>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">View All</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { name: "Local SEO Booster", desc: "Automates schema injection & GBP audit", time: "Instant" },
                    { name: "E-Commerce Prospector", desc: "Finds Shopify stores with slow mobile LCP", time: "Instant" },
                    { name: "SaaS B2B Outreacher", desc: "LinkedIn + Email multi-touch sequence", time: "Instant" },
                  ].map((tpl) => (
                    <div key={tpl.name} className="p-2.5 rounded-lg bg-[#FAF9F6] dark:bg-[#121816] border border-gray-100 dark:border-[#22302B] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-gray-900">{tpl.name}</div>
                        <div className="text-[10px] text-gray-500">{tpl.desc}</div>
                      </div>
                      <button
                        onClick={() => showToast(`✓ Deployed "${tpl.name}" into active roster`)}
                        className="h-6 px-2 rounded-md bg-[#171918] hover:bg-black text-white text-[10px] font-bold"
                      >
                        Deploy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tables: Recent Agent Runs & Upcoming Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Recent Agent Runs Table */}
            <div className="lg:col-span-7 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#171918] dark:text-white">Recent Agent Runs</h3>
                <span className="text-[11px] text-emerald-600 font-semibold">Live Feed</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#22302B] text-[10px] text-gray-400 uppercase font-semibold">
                      <th className="pb-2">Agent</th>
                      <th className="pb-2">Task</th>
                      <th className="pb-2">Trigger</th>
                      <th className="pb-2">Duration</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[11px]">
                    {RECENT_RUNS_DATA.map((run) => (
                      <tr key={run.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 font-bold text-gray-800">{run.agent}</td>
                        <td className="py-2.5 text-gray-600">{run.task}</td>
                        <td className="py-2.5 text-gray-400">{run.trigger}</td>
                        <td className="py-2.5 font-mono text-gray-500">{run.duration}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            run.status === "Success"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Scheduled Tasks */}
            <div className="lg:col-span-5 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-[#171918] dark:text-white">Upcoming Tasks Queue</h3>
                <span className="text-[11px] text-gray-400 font-medium">3 Scheduled</span>
              </div>
              <div className="space-y-2 text-xs">
                {UPCOMING_TASKS_DATA.map((task) => (
                  <div key={task.id} className="p-2.5 rounded-lg bg-[#FAF9F6] dark:bg-[#121816] border border-gray-100 dark:border-[#22302B] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-gray-800">{task.agent}</div>
                      <div className="text-[10px] text-gray-500">{task.task}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-blue-600">{task.scheduled}</div>
                      <div className="text-[9px] text-gray-400 uppercase font-semibold">{task.priority} Priority</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
