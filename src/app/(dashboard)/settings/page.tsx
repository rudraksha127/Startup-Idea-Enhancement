"use client";

import { useState } from "react";
import {
  Settings,
  Building,
  User,
  Shield,
  Key,
  Users,
  Cpu,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  DollarSign,
  FileText,
  Save,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type SettingsTab =
  | "workspace"
  | "team"
  | "integrations"
  | "ai-models"
  | "email"
  | "compliance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Workspace form state
  const [orgName, setOrgName] = useState("AgencyOS Headquarters");
  const [slug, setSlug] = useState("agencyos-hq");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +05:30)");
  const [currency, setCurrency] = useState("USD ($)");
  const [founderName, setFounderName] = useState("Rudraksh");
  const [founderEmail, setFounderEmail] = useState("founder@agencyos.ai");

  // AI & Budget state
  const [activeModel, setActiveModel] = useState("gemini-2.5-pro");
  const [monthlyBudget, setMonthlyBudget] = useState(250);
  const [dryRunMode, setDryRunMode] = useState(true);
  const [dailyActionCap, setDailyActionCap] = useState(150);

  // Integrations state
  const [geminiKey, setGeminiKey] = useState("••••••••••••••••••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("••••••••••••••••••••••••••••••••");
  const [resendKey, setResendKey] = useState("••••••••••••••••••••••••••••••••");
  const [stripeKey, setStripeKey] = useState("••••••••••••••••••••••••••••••••");

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    {
      id: "1",
      name: "Rudraksh (You)",
      email: "founder@agencyos.ai",
      role: "Owner / Full Access",
      status: "Active",
      twoFactor: true,
    },
    {
      id: "2",
      name: "Elena Rostova",
      email: "elena@agencyos.ai",
      role: "Lead Designer",
      status: "Active",
      twoFactor: true,
    },
    {
      id: "3",
      name: "Marcus Vance",
      email: "marcus@agencyos.ai",
      role: "Growth Specialist",
      status: "Active",
      twoFactor: false,
    },
  ]);

  const handleSave = (section: string) => {
    setSavedMessage(`${section} saved successfully.`);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E2]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#25835B] mb-1">
            <Settings size={14} />
            <span>WORKSPACE &amp; SECURITY CONTROLS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#171918]">
            Settings
          </h1>
          <p className="text-xs text-[#68717D]">
            Manage organization profile, team permissions, AI engine budgets, connected APIs, and legal compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedMessage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-xs font-semibold rounded-lg animate-in fade-in">
              <CheckCircle2 size={14} className="text-[#25835B]" />
              <span>{savedMessage}</span>
            </div>
          )}
          <button
            onClick={() => handleSave("All settings")}
            className="px-4 py-2 bg-[#151B1A] hover:bg-[#202927] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E7E2] overflow-x-auto pb-px text-xs font-medium">
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "workspace"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Building size={14} />
          <span>Workspace Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "team"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Users size={14} />
          <span>Team &amp; Roles</span>
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "integrations"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Key size={14} />
          <span>Integrations &amp; API Keys</span>
        </button>

        <button
          onClick={() => setActiveTab("ai-models")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "ai-models"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Cpu size={14} />
          <span>AI Models &amp; Spending Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "email"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Mail size={14} />
          <span>Email &amp; Sending Domains</span>
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center gap-2 pb-3 px-3 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "compliance"
              ? "border-[#3568E8] text-[#3568E8] font-semibold"
              : "border-transparent text-[#68717D] hover:text-[#171918]"
          }`}
        >
          <Shield size={14} />
          <span>Compliance &amp; Security</span>
        </button>
      </div>

      {/* Tab 1: Workspace Profile */}
      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <Building size={16} className="text-[#3568E8]" />
                General Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E7E2] rounded-lg text-xs bg-[#F7F6F2]/30 focus:bg-white focus:outline-none focus:border-[#3568E8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Workspace Identifier / Slug
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-[#F7F6F2] border border-r-0 border-[#E7E7E2] rounded-l-lg text-[#68717D] text-xs">
                      agencyos.ai/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7E7E2] rounded-r-lg text-xs bg-[#F7F6F2]/30 focus:bg-white focus:outline-none focus:border-[#3568E8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Default Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E7E2] rounded-lg text-xs bg-white focus:outline-none focus:border-[#3568E8]"
                  >
                    <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                    <option value="America/New_York (EST -05:00)">America/New_York (EST -05:00)</option>
                    <option value="America/Los_Angeles (PST -08:00)">America/Los_Angeles (PST -08:00)</option>
                    <option value="Europe/London (GMT +00:00)">Europe/London (GMT +00:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Billing Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E7E2] rounded-lg text-xs bg-white focus:outline-none focus:border-[#3568E8]"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <User size={16} className="text-[#3568E8]" />
                Primary Founder Profile
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Founder Name
                  </label>
                  <input
                    type="text"
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E7E2] rounded-lg text-xs bg-[#F7F6F2]/30 focus:bg-white focus:outline-none focus:border-[#3568E8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171918] mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="email"
                    value={founderEmail}
                    onChange={(e) => setFounderEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E7E2] rounded-lg text-xs bg-[#F7F6F2]/30 focus:bg-white focus:outline-none focus:border-[#3568E8]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#171918]">Interface Appearance</h3>
              <p className="text-xs text-[#68717D]">
                Choose how AgencyOS looks to you. Select between Light, Dark, or automatically match your System settings.
              </p>
              <div className="pt-1">
                <ThemeToggle variant="segmented" className="w-full justify-between" />
              </div>
            </div>

            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#171918]">Subscription Status</h3>
              <div className="p-3 bg-[#F7F6F2] rounded-lg border border-[#E7E7E2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171918]">Agency Growth Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#68717D]">
                  Next billing renewal on November 15, 2026 ($299.00/mo).
                </p>
              </div>
              <button className="w-full py-2 bg-[#F7F6F2] hover:bg-[#E7E7E2] text-xs font-semibold text-[#171918] rounded-lg border border-[#E7E7E2] transition-colors">
                Manage Invoices &amp; Plan
              </button>
            </div>

            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#171918]">Data Export &amp; Retention</h3>
              <p className="text-xs text-[#68717D]">
                Export all prospective leads, verified business audits, and active client project dossiers in JSON or CSV.
              </p>
              <button className="w-full py-2 border border-[#E7E7E2] hover:bg-[#F7F6F2] text-xs font-semibold text-[#171918] rounded-lg transition-colors">
                Download Full Workspace Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team & Roles */}
      {activeTab === "team" && (
        <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E2]">
            <div>
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <Users size={16} className="text-[#3568E8]" />
                Authorized Team Members
              </h2>
              <p className="text-xs text-[#68717D]">
                Invite agency partners, project managers, and engineers to collaborate with deterministic role boundaries.
              </p>
            </div>
            <button className="px-3.5 py-2 bg-[#3568E8] hover:bg-[#2853c3] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
              <Plus size={14} />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F2] text-[#68717D] border-b border-[#E7E7E2] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Name &amp; Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Two-Factor Auth</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E7E2]">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F7F6F2]/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#171918]">{member.name}</div>
                      <div className="text-[11px] text-[#68717D]">{member.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#F7F6F2] border border-[#E7E7E2] text-xs font-medium text-[#171918]">
                        {member.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {member.twoFactor ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25835B]">
                          <Lock size={12} /> Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D97706]">
                          <AlertTriangle size={12} /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-xs font-semibold text-[#3568E8] hover:underline mr-3">
                        Edit
                      </button>
                      {member.id !== "1" && (
                        <button className="text-xs font-semibold text-red-600 hover:underline">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Integrations & API Keys */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <Key size={16} className="text-[#3568E8]" />
                External Service Provider Credentials
              </h2>
              <p className="text-xs text-[#68717D]">
                API tokens are securely encrypted. In development, fallback deterministic mock providers execute when keys are empty.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              {/* Google Gemini */}
              <div className="p-4 rounded-xl border border-[#E7E7E2] bg-[#F7F6F2]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#171918]">Google Gemini API</div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-[#68717D]">
                  Powers autonomous website audits, opportunity scoring, and lead deep-research analysis.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[#E7E7E2] rounded-lg bg-white font-mono text-xs"
                  />
                  <button className="px-3 py-1.5 bg-white border border-[#E7E7E2] rounded-lg font-semibold hover:bg-[#F7F6F2]">
                    Update
                  </button>
                </div>
              </div>

              {/* Resend SMTP */}
              <div className="p-4 rounded-xl border border-[#E7E7E2] bg-[#F7F6F2]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#171918]">Resend (Transactional Outreach)</div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-[#68717D]">
                  Delivers cold outreach sequences and synchronizes inbound lead responses into the inbox.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={resendKey}
                    onChange={(e) => setResendKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[#E7E7E2] rounded-lg bg-white font-mono text-xs"
                  />
                  <button className="px-3 py-1.5 bg-white border border-[#E7E7E2] rounded-lg font-semibold hover:bg-[#F7F6F2]">
                    Update
                  </button>
                </div>
              </div>

              {/* OpenAI GPT */}
              <div className="p-4 rounded-xl border border-[#E7E7E2] bg-[#F7F6F2]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#171918]">OpenAI Engine (Fallback)</div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[10px]">
                    Standby
                  </span>
                </div>
                <p className="text-[11px] text-[#68717D]">
                  Used as automated failover gateway if Gemini rate limits or quota triggers engage.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[#E7E7E2] rounded-lg bg-white font-mono text-xs"
                  />
                  <button className="px-3 py-1.5 bg-white border border-[#E7E7E2] rounded-lg font-semibold hover:bg-[#F7F6F2]">
                    Update
                  </button>
                </div>
              </div>

              {/* Stripe Billing */}
              <div className="p-4 rounded-xl border border-[#E7E7E2] bg-[#F7F6F2]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#171918]">Stripe Billing &amp; Invoices</div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-[#68717D]">
                  Generates payment links and collects milestone payments directly from closed agency clients.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-[#E7E7E2] rounded-lg bg-white font-mono text-xs"
                  />
                  <button className="px-3 py-1.5 bg-white border border-[#E7E7E2] rounded-lg font-semibold hover:bg-[#F7F6F2]">
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Models & Spending Rules */}
      {activeTab === "ai-models" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <Cpu size={16} className="text-[#3568E8]" />
                Primary Autonomous Model Gateway
              </h2>

              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-[#171918]">
                  Selected Primary LLM
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setActiveModel("gemini-2.5-pro")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeModel === "gemini-2.5-pro"
                        ? "border-[#3568E8] bg-[#3568E8]/5 ring-1 ring-[#3568E8]"
                        : "border-[#E7E7E2] bg-white hover:border-[#171918]/20"
                    }`}
                  >
                    <div className="font-bold text-[#171918]">Gemini 2.5 Pro</div>
                    <div className="text-[11px] text-[#68717D] mt-0.5">High reasoning &amp; code analysis</div>
                    <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-bold text-[9px]">
                      Default
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveModel("gemini-2.5-flash")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeModel === "gemini-2.5-flash"
                        ? "border-[#3568E8] bg-[#3568E8]/5 ring-1 ring-[#3568E8]"
                        : "border-[#E7E7E2] bg-white hover:border-[#171918]/20"
                    }`}
                  >
                    <div className="font-bold text-[#171918]">Gemini 2.5 Flash</div>
                    <div className="text-[11px] text-[#68717D] mt-0.5">High-speed lead research</div>
                    <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-[#F7F6F2] text-[#68717D] font-bold text-[9px]">
                      Cost Effective
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveModel("gpt-4o")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeModel === "gpt-4o"
                        ? "border-[#3568E8] bg-[#3568E8]/5 ring-1 ring-[#3568E8]"
                        : "border-[#E7E7E2] bg-white hover:border-[#171918]/20"
                    }`}
                  >
                    <div className="font-bold text-[#171918]">GPT-4o Multi-Modal</div>
                    <div className="text-[11px] text-[#68717D] mt-0.5">Fallback pipeline</div>
                    <span className="inline-block mt-2 px-1.5 py-0.5 rounded bg-[#F7F6F2] text-[#68717D] font-bold text-[9px]">
                      Secondary
                    </span>
                  </div>
                </div>
              </div>

              {/* Safety & Dry-run Mode */}
              <div className="pt-4 border-t border-[#E7E7E2] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-[#171918] flex items-center gap-1.5">
                      <Shield size={14} className="text-[#25835B]" />
                      Outbound Safety Gate (Dry Run Mode)
                    </div>
                    <p className="text-[11px] text-[#68717D]">
                      When enabled, emails and automated changes are queued for founder approval rather than dispatched immediately.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dryRunMode}
                    onChange={(e) => setDryRunMode(e.target.checked)}
                    className="w-4 h-4 accent-[#3568E8] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <DollarSign size={16} className="text-[#25835B]" />
                Budget Constraints &amp; Hard Caps
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Monthly AI Spend Hard Limit</span>
                    <span className="text-[#3568E8] font-bold">${monthlyBudget} USD</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="25"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full accent-[#3568E8]"
                  />
                  <p className="text-[11px] text-[#68717D] mt-1">
                    Current spend this month: <strong className="text-[#171918]">$42.80</strong> (17.1% utilized).
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Daily Autonomous Actions Cap</span>
                    <span className="text-[#3568E8] font-bold">{dailyActionCap} actions/day</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={dailyActionCap}
                    onChange={(e) => setDailyActionCap(Number(e.target.value))}
                    className="w-full accent-[#3568E8]"
                  />
                  <p className="text-[11px] text-[#68717D] mt-1">
                    Limits lead extraction and cold email triggers to protect sending reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-[#171918]">Active AI Agents Running</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#F7F6F2] rounded-lg">
                  <div>
                    <div className="font-semibold text-[#171918]">Lead Research Agent</div>
                    <div className="text-[10px] text-[#68717D]">Deep website audit engine</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#25835B]" />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F7F6F2] rounded-lg">
                  <div>
                    <div className="font-semibold text-[#171918]">Outreach Copy Agent</div>
                    <div className="text-[10px] text-[#68717D]">Contextual cold email builder</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#25835B]" />
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F7F6F2] rounded-lg">
                  <div>
                    <div className="font-semibold text-[#171918]">Conversation Closer</div>
                    <div className="text-[10px] text-[#68717D]">Inbox objection handling</div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#25835B]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Email & Domains */}
      {activeTab === "email" && (
        <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E2]">
            <div>
              <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
                <Mail size={16} className="text-[#3568E8]" />
                Connected Sending Domains
              </h2>
              <p className="text-xs text-[#68717D]">
                Verify DNS records (SPF, DKIM, DMARC) to guarantee 99%+ deliverability directly to primary inboxes.
              </p>
            </div>
            <button className="px-3.5 py-2 bg-[#151B1A] hover:bg-[#202927] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
              <Plus size={14} />
              <span>Connect Custom Domain</span>
            </button>
          </div>

          <div className="p-4 border border-[#E7E7E2] rounded-xl bg-[#F7F6F2]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#171918]">agencyos-outreach.com</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-bold text-[10px]">
                  Verified &amp; Healthy
                </span>
              </div>
              <span className="text-[11px] text-[#25835B] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Warmup Complete (40 emails/day cap)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
              <div className="p-2.5 bg-white border border-[#E7E7E2] rounded-lg">
                <div className="font-semibold text-[#171918] flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#25835B]" /> SPF Record
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5 font-mono">v=spf1 include:resend.com ~all</div>
              </div>

              <div className="p-2.5 bg-white border border-[#E7E7E2] rounded-lg">
                <div className="font-semibold text-[#171918] flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#25835B]" /> DKIM Signature
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5 font-mono">resend._domainkey (2048-bit)</div>
              </div>

              <div className="p-2.5 bg-white border border-[#E7E7E2] rounded-lg">
                <div className="font-semibold text-[#171918] flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#25835B]" /> DMARC Policy
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5 font-mono">p=quarantine; pct=100</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Compliance & Security */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E7E2] rounded-xl p-5 shadow-xs space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#171918] flex items-center gap-2">
              <Shield size={16} className="text-[#25835B]" />
              Regulatory Compliance &amp; Policy Guardrails
            </h2>
            <p className="text-[#68717D]">
              AgencyOS enforces deterministic safeguards adhering to Indian DPDP Act 2023, TRAI TCCCPR rules, and international spam policies.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start justify-between p-3 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/30">
                <div>
                  <div className="font-bold text-[#171918]">Automated One-Click Unsubscribe Header</div>
                  <p className="text-[11px] text-[#68717D] mt-0.5">
                    Embeds RFC 8058 compliant `List-Unsubscribe` headers and opt-out links in all dispatched outreach.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 accent-[#3568E8] rounded mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/30">
                <div>
                  <div className="font-bold text-[#171918]">Strict Exclusion / Do-Not-Contact List</div>
                  <p className="text-[11px] text-[#68717D] mt-0.5">
                    Deterministic cross-check blocks any domain or email present on the organization suppression list.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 accent-[#3568E8] rounded mt-0.5"
                />
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg border border-[#E7E7E2] bg-[#F7F6F2]/30">
                <div>
                  <div className="font-bold text-[#171918]">Google Maps Terms of Service Strict Adherence</div>
                  <p className="text-[11px] text-[#68717D] mt-0.5">
                    Enforces Section 3.2.3 prohibiting scraping or exporting provider content into outbound sales databases.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  disabled
                  className="w-4 h-4 accent-[#3568E8] rounded mt-0.5"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
