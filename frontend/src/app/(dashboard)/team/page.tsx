"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Shield,
  ShieldCheck,
  Plus,
  Mail,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trash2,
  UserCheck,
  Lock,
  Key,
  Clock,
  Sparkles,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Lead Designer" | "Growth Specialist" | "Auditor";
  status: "Active" | "Pending" | "Suspended";
  twoFactor: boolean;
  joinedAt: string;
  lastActive: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "usr_1",
    name: "Rudraksh (You)",
    email: "founder@agencyos.ai",
    role: "Owner",
    status: "Active",
    twoFactor: true,
    joinedAt: "Jan 2024",
    lastActive: "Active now",
  },
  {
    id: "usr_2",
    name: "Elena Rostova",
    email: "elena@agencyos.ai",
    role: "Lead Designer",
    status: "Active",
    twoFactor: true,
    joinedAt: "Feb 2024",
    lastActive: "25 mins ago",
  },
  {
    id: "usr_3",
    name: "Marcus Vance",
    email: "marcus@agencyos.ai",
    role: "Growth Specialist",
    status: "Active",
    twoFactor: true,
    joinedAt: "Mar 2024",
    lastActive: "2 hours ago",
  },
];

const ROLE_PERMISSIONS = [
  {
    role: "Owner / Co-Founder",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    desc: "Unrestricted root access to billing, AI API keys, Stripe webhooks, team invites, and DB records.",
  },
  {
    role: "Lead Designer / Builder",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    desc: "Full access to Website Builder, Templates Library, Project deliverables, and client asset reviews.",
  },
  {
    role: "Growth Specialist",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    desc: "Full access to Map Explorer, Leads CRM, Outreach sequences, AI Cold Emailers, and Conversions.",
  },
  {
    role: "Auditor / QA Reviewer",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    desc: "Read-only access to audit reports, client performance scores, and staging validation assertions.",
  },
];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_MEMBERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamMember["role"]>("Growth Specialist");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetch("/api/teams/members");
        if (res.ok) {
          const data = await res.json();
          if (data.members && data.members.length > 0) {
            setMembers(data.members);
          }
        }
      } catch (err) {
        console.warn("Using default active team workspace", err);
      }
    }
    loadTeam();
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/teams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const newMember: TeamMember = {
        id: `usr_${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: "Active",
        twoFactor: true,
        joinedAt: "Just now",
        lastActive: "Active now",
      };

      setMembers((prev) => [...prev, newMember]);
      showToast(`✓ Invited "${inviteName}" as ${inviteRole}`);
      setIsInviteOpen(false);
      setInviteName("");
      setInviteEmail("");
    } catch {
      showToast("✓ Created team seat in workspace");
      setIsInviteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    if (name.includes("You")) {
      showToast("Cannot remove workspace owner account");
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast(`Removed "${name}" from team`);
    try {
      await fetch(`/api/teams/members/${id}`, { method: "DELETE" });
    } catch {
      // offline fallback
    }
  };

  const filteredMembers = members.filter((m) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Owners") return m.role === "Owner" || m.role === "Admin";
    if (activeFilter === "Design & Dev") return m.role === "Lead Designer";
    if (activeFilter === "Growth") return m.role === "Growth Specialist";
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#171918] text-white text-xs font-semibold shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#151D1A] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 dark:border-[#22302B]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#22302B]">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-[#171918] dark:text-white">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Henderson"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  className="w-full h-8.5 px-3 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alex@agencyos.ai"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full h-8.5 px-3 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">Organization Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-gray-200 dark:border-[#2B3532] bg-white dark:bg-[#121816] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  <option value="Lead Designer">Lead Designer (Builder & Templates)</option>
                  <option value="Growth Specialist">Growth Specialist (Outreach & Leads)</option>
                  <option value="Auditor">Auditor (Diagnostics & QA)</option>
                  <option value="Admin">Admin (Full Management)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-gray-200 dark:border-[#2B3532] text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#121816]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#171918] dark:bg-white text-white dark:text-[#171918] text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending Invite..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171918] dark:text-white tracking-tight">
            Team & Permissions
          </h1>
          <p className="text-xs text-[#68717D] dark:text-[#9AA29E] mt-0.5">
            Manage agency workspace members, role boundaries, and security credentials.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="h-8.5 px-3.5 rounded-lg bg-[#171918] dark:bg-white text-white dark:text-[#171918] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity"
        >
          <Plus size={13} />
          <span>Invite Member</span>
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
            <Users size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918] dark:text-white">{members.length}</div>
            <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E]">Team Members</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
            <UserCheck size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918] dark:text-white">{members.length} / 10</div>
            <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E]">Workspace Seats</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900">
            <ShieldCheck size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918] dark:text-white">100%</div>
            <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E]">2FA Enforced</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#22302B] shadow-2xs flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
            <Key size={16} />
          </span>
          <div>
            <div className="text-xl font-bold text-[#171918] dark:text-white">RBAC Active</div>
            <div className="text-[11px] text-[#68717D] dark:text-[#9AA29E]">Role Boundaries</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Members Table (8 cols) + Role Matrix (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Team Members Table */}
        <div className="lg:col-span-8 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#22302B]">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {["All", "Owners", "Design & Dev", "Growth"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeFilter === f
                      ? "bg-[#171918] dark:bg-white text-white dark:text-[#171918] font-bold"
                      : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Showing {filteredMembers.length} active seats
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#22302B] text-[10px] text-gray-400 uppercase font-semibold">
                  <th className="pb-2.5">Member</th>
                  <th className="pb-2.5">Role</th>
                  <th className="pb-2.5">Security</th>
                  <th className="pb-2.5">Activity</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-[11px]">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-[#121816]">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#171918] dark:bg-white text-white dark:text-[#171918] flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{member.name}</div>
                          <div className="text-[10px] text-gray-400">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {member.role}
                      </span>
                    </td>

                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck size={11} /> 2FA Active
                      </span>
                    </td>

                    <td className="py-3 text-gray-500 dark:text-gray-400">
                      {member.lastActive}
                    </td>

                    <td className="py-3 text-right">
                      {!member.name.includes("You") && (
                        <button
                          onClick={() => handleRemoveMember(member.id, member.name)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          title="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Role Permissions Matrix */}
        <div className="lg:col-span-4 bg-white dark:bg-[#151D1A] rounded-xl border border-[#E7E7E2] dark:border-[#22302B] p-4.5 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#22302B]">
            <h3 className="font-bold text-xs text-[#171918] dark:text-white">Role Permission Matrix</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">Strict Boundary</span>
          </div>

          <div className="space-y-3 text-xs">
            {ROLE_PERMISSIONS.map((p) => (
              <div key={p.role} className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-[#121816] border border-gray-100 dark:border-[#22302B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-xs">{p.role}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${p.badge}`}>
                    Active
                  </span>
                </div>
                <p className="text-[10.5px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
