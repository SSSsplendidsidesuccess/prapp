"use client";

import { LucideIcon } from "lucide-react";

interface ChipProps {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
  variant?: "default" | "amber" | "slate";
}

export default function Chip({
  label,
  icon: Icon,
  selected = false,
  onClick,
  variant = "default"
}: ChipProps) {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer";
  
  const variantClasses = {
    default: selected
      ? "bg-amber-500 text-slate-900 ring-2 ring-amber-400"
      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    slate: "bg-slate-800/50 text-slate-400 border border-slate-700"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-pressed={selected}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
}
