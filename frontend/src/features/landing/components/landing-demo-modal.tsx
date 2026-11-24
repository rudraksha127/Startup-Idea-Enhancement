"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Bot, CheckCircle } from "lucide-react";

interface LandingDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingDemoModal({ isOpen, onClose }: LandingDemoModalProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEnterWorkspace = () => {
    onClose();
    router.push("/dashboard");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#fbfaf6] dark:bg-[#151d1a] border border-[#161f1b]/15 dark:border-[#22302b] p-6 shadow-2xl text-[#101413] dark:text-white">
        <div className="flex items-start justify-between pb-4 border-b border-[#161f1b]/10 dark:border-[#22302b]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e9ece5] dark:bg-[#1a2420] text-[11px] font-bold text-[#0d251f] dark:text-emerald-400 mb-2">
              <Bot size={13} />
              AI AGENCY ENGINE
            </div>
            <h3 className="font-serif text-2xl font-bold">Meet your AI agency team</h3>
            <p className="text-xs text-[#555956] dark:text-[#94a3b8] mt-1">
              One connected workflow takes you from business discovery to a development-ready handoff.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo"
            className="p-1.5 rounded-lg text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-5 p-4 rounded-xl bg-white dark:bg-[#111715] border border-[#161f1b]/10 dark:border-[#22302b] space-y-3 font-mono text-xs text-[#2b3530] dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0da66c]" />
            <b className="text-[#101413] dark:text-white">● Lead Finder Agent</b>
            <span className="text-gray-500 dark:text-gray-400 ml-auto font-sans text-[11px]">Scans local opportunities</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
            <b className="text-[#101413] dark:text-white">● Research &amp; Audit Agent</b>
            <span className="text-gray-500 dark:text-gray-400 ml-auto font-sans text-[11px]">Detects mobile &amp; SEO gaps</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#e1306c]" />
            <b className="text-[#101413] dark:text-white">● Outreach Agent</b>
            <span className="text-gray-500 dark:text-gray-400 ml-auto font-sans text-[11px]">Personalizes pitch emails</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <b className="text-[#101413] dark:text-white">● Handoff Brief Agent</b>
            <span className="text-gray-500 dark:text-gray-400 ml-auto font-sans text-[11px]">Generates dev specifications</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <CheckCircle size={12} className="text-[#0da66c]" /> Live simulated environment ready
          </span>
          <button
            onClick={handleEnterWorkspace}
            className="px-5 py-2 rounded-lg bg-[#101513] hover:bg-[#1a2c27] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-xs"
          >
            Got it, enter workspace
          </button>
        </div>
      </div>
    </div>
  );
}

