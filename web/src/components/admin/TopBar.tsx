"use client";

import { usePathname } from "next/navigation";
import { getAdminName } from "@/lib/admin-auth";
import { ShieldCheck, ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Analytics Overview",
  "/admin/hotels": "Property Management",
  "/admin/verifications": "Verification Logs",
};

function getLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "admin" && parts[1] === "hotels" && parts[2]) {
    return "Property Detail View";
  }
  return "Overview";
}

export default function TopBar({ title }: { title?: string }) {
  const pathname = usePathname();
  const label = title ?? getLabel(pathname);
  const name = getAdminName();

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8 shadow-sm">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          <Home className="h-2.5 w-2.5" />
          <ChevronRight className="h-2.5 w-2.5" />
          <span>District Admin</span>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-slate-500">{dateStr}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-none">{label}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Gov badge - Grounded */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Official</span>
            <span className="text-[9px] font-medium text-emerald-600/80 italic">Gov of India</span>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{name}</p>
            <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-tighter">District Access</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <span className="text-xs font-bold text-white uppercase">{name.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
