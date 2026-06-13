"use client";

import { usePathname } from "next/navigation";
import { getAdminName } from "@/lib/superadmin-auth";
import { ShieldCheck, ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/superadmin/dashboard": "Analytics Overview",
  "/superadmin/hotels": "Property Management",
  "/superadmin/owners": "Owner Directory",
  "/superadmin/verifications": "Verification Logs",
  "/superadmin/admins": "Administrative Personnel",
  "/superadmin/districts": "Regional Districts",
};

function getLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "superadmin" && parts[1] === "hotels" && parts[2]) {
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
          <span>Super Admin</span>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-slate-500">{dateStr}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 leading-none">{label}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Gov badge - Grounded */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">Official</span>
            <span className="text-[9px] font-medium text-slate-400 italic">Gov of India</span>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{name}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Admin Access</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <span className="text-xs font-bold text-white uppercase">{name.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
