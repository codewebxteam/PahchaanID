"use client";

import { cn } from "@/lib/utils";

const CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ACTIVE: { label: "Active", color: "text-emerald-700", bg: "bg-emerald-50/50", border: "border-emerald-100" },
  INACTIVE: { label: "Inactive", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50/50", border: "border-amber-100" },
  SUSPENDED: { label: "Suspended", color: "text-rose-700", bg: "bg-rose-50/50", border: "border-rose-100" },
  SUCCESS: { label: "Success", color: "text-emerald-700", bg: "bg-emerald-50/50", border: "border-emerald-100" },
  FAILED: { label: "Failed", color: "text-rose-700", bg: "bg-rose-50/50", border: "border-rose-100" },
  COUPLE: { label: "Couple", color: "text-indigo-700", bg: "bg-indigo-50/50", border: "border-indigo-100" },
  FAMILY: { label: "Family", color: "text-violet-700", bg: "bg-violet-50/50", border: "border-violet-100" },
  STUDENT: { label: "Student", color: "text-cyan-700", bg: "bg-cyan-50/50", border: "border-cyan-100" },
  PROFESSIONAL: { label: "Professional", color: "text-blue-700", bg: "bg-blue-50/50", border: "border-blue-100" },
  AADHAAR: { label: "Aadhaar", color: "text-slate-600", bg: "bg-slate-100/50", border: "border-slate-200" },
  PAN: { label: "PAN Card", color: "text-slate-600", bg: "bg-slate-100/50", border: "border-slate-200" },
  VOTER_ID: { label: "Voter ID", color: "text-slate-600", bg: "bg-slate-100/50", border: "border-slate-200" },
  DRIVING_LICENSE: { label: "Driving License", color: "text-slate-600", bg: "bg-slate-100/50", border: "border-slate-200" },
};

export default function StatusBadge({
  status,
  size = "md",
  dot = false,
}: {
  status: string;
  size?: "sm" | "md";
  dot?: boolean;
}) {
  const config = CONFIG[status] || {
    label: status,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight",
        config.bg,
        config.color,
        config.border,
        size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[11px]"
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", config.color.replace("text-", "bg-"))} />
      )}
      {config.label}
    </span>
  );
}
