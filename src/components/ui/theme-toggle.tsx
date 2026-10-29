"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  variant?: "dropdown" | "segmented";
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

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-[#E7E7E2] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] flex items-center justify-center opacity-60 ${className}`}>
        <Sun size={15} className="text-gray-400" />
      </div>
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ] as const;

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
              onClick={() => setTheme(opt.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-[#25835B] text-[#171918] dark:text-white shadow-xs font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={13} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Current theme: ${theme}. Click to switch theme.`}
        title={`Theme: ${theme}`}
        className="w-9 h-9 rounded-lg border border-[#E7E7E2] dark:border-[#2B3532] bg-white dark:bg-[#151D1A] flex items-center justify-center text-[#171918] dark:text-[#F3F4F6] hover:bg-gray-50 dark:hover:bg-[#1D2523] transition-colors shadow-2xs relative"
      >
        <ActiveIcon size={15} className={resolvedTheme === "dark" ? "text-amber-400" : "text-amber-500"} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-[#151D1A] border border-[#E7E7E2] dark:border-[#2B3532] shadow-xl py-1 text-xs z-50">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-[#F7F6F2] dark:bg-[#1D2523] text-[#3568E8] dark:text-emerald-400 font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1D2523]/60"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={13} />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check size={12} className="stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
