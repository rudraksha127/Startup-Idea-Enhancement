"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop, Check, ChevronDown } from "lucide-react";

interface ThemeToggleProps {
  variant?: "dropdown" | "header" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "dropdown", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "light", label: "Light", icon: Sun, desc: "Pure white theme" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Deep dark theme" },
    { value: "system", label: "System Default", icon: Laptop, desc: "Auto sync with device" },
  ] as const;

  // Placeholder while mounting to avoid SSR hydration mismatch
  if (!mounted) {
    return (
      <div className={`h-9 px-3 rounded-lg border border-[#E2E8F0] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] flex items-center gap-1.5 opacity-60 ${className}`}>
        <Sun size={15} className="text-gray-400" />
        <span className="text-xs text-gray-400 hidden sm:inline">Theme</span>
      </div>
    );
  }

  // 1. SEGMENTED CONTROL (FOR SETTINGS & SIDEBAR)
  if (variant === "segmented") {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-[#1D2523] border border-gray-200 dark:border-[#2B3532] text-xs ${className}`}
        role="group"
        aria-label="Theme selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-[#25835B] text-[#0F172A] dark:text-white shadow-xs font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{opt.label.replace(" Default", "")}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. DROPDOWN COMPONENT (DEFAULT FOR HEADER - OPENS DOWNWARDS)
  const currentLabel =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Current theme: ${theme}. Click to switch theme.`}
        aria-expanded={isOpen}
        title={`Theme: ${currentLabel} (Click to change)`}
        className="h-9 px-2.5 sm:px-3 rounded-lg border border-[#E2E8F0] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] flex items-center gap-1.5 text-[#0F172A] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-all shadow-2xs relative"
      >
        <ActiveIcon
          size={15}
          className={resolvedTheme === "dark" ? "text-amber-400" : "text-amber-500"}
        />
        <span className="text-xs font-bold hidden sm:inline">{currentLabel}</span>
        <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Downward Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E2E8F0] dark:border-[#2B3532] shadow-xl py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-[#22302B] mb-1">
            Appearance Theme
          </div>

          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-blue-50/70 dark:bg-[#1D2523] text-[#3568E8] dark:text-emerald-400 font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523]/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon
                    size={14}
                    className={
                      opt.value === "light"
                        ? "text-amber-500"
                        : opt.value === "dark"
                        ? "text-amber-400"
                        : "text-blue-500 dark:text-emerald-400"
                    }
                  />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check size={13} className="stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
