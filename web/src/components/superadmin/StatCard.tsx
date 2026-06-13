"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-slate-600",
  iconBg = "bg-slate-100",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:bg-slate-50/50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            {label}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {value}
          </h4>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 shadow-sm",
            iconBg,
            iconColor
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
