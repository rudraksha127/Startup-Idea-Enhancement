"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, FolderPlus } from "lucide-react";

interface ProjectBriefDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lead: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreated?: (project: any) => void;
}

export function ProjectBriefDialog({ isOpen, onClose, lead, onCreated }: ProjectBriefDialogProps) {
  const [title, setTitle] = useState(
    lead ? `${lead.businessName} — Complete Website Redesign` : "Client Website Redesign"
  );
  const [clientName, setClientName] = useState(lead?.businessName || "");
  const [budget, setBudget] = useState(45000);
  const [deadline, setDeadline] = useState("28 Apr 2026");
  const [scope, setScope] = useState(
    "High-performance Next.js responsive website with direct online booking, digital menu showcase, and local SEO schema markup."
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName,
          budget,
          deadline,
          scope,
          features: [
            "Responsive Next.js Frontend",
            "Direct Table Booking / Appointment Engine",
            "Local Schema Markup",
            "WhatsApp Instant Notification Integration",
          ],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        onCreated?.(json.project);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to create project brief:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-[#161f1b]/15 p-6 shadow-2xl text-[#101413]">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <FolderPlus size={15} />
            </span>
            <h3 className="font-serif text-xl font-bold">Create Dev-Ready Project Brief</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-black/5"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center text-xs text-green-700 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-green-600 animate-bounce" />
            <b className="text-sm block">Project Brief Generated &amp; Saved!</b>
            <p>Added to Projects Pipeline for developer handoff.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label htmlFor="projectTitle" className="block font-semibold mb-1">Project Title</label>
              <input
                id="projectTitle"
                type="text"
                required
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="clientName" className="block font-semibold mb-1">Client Name</label>
                <input
                  id="clientName"
                  type="text"
                  required
                  placeholder="Client Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div>
                <label htmlFor="budget" className="block font-semibold mb-1">Budget (INR)</label>
                <input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Target Delivery Deadline</label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Scope &amp; Deliverables</label>
              <textarea
                rows={4}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-[#101513] text-white font-bold inline-flex items-center gap-1.5 shadow"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : "Save Project Brief"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

