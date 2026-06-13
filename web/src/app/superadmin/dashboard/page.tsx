"use client";

import { useEffect, useState } from "react";
import { saDashboard, type DashboardStats } from "@/lib/superadmin-api";
import { getToken } from "@/lib/superadmin-auth";
import StatCard from "@/components/superadmin/StatCard";
import { toast } from "sonner";
import {
  Building2,
  Users,
  UserCheck,
  Shield,
  FileCheck2,
  MapPin,
  CreditCard,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const METRIC_CONFIG = [
  {
    key: "totalHotels" as keyof DashboardStats,
    label: "Total Hotels",
    icon: Building2,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    href: "/superadmin/hotels",
  },
  {
    key: "totalOwners" as keyof DashboardStats,
    label: "Hotel Owners",
    icon: Users,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    href: "/superadmin/owners",
  },
  {
    key: "totalManagers" as keyof DashboardStats,
    label: "Active Managers",
    icon: UserCheck,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50",
    href: "/superadmin/hotels",
  },
  {
    key: "totalAdmins" as keyof DashboardStats,
    label: "District Admins",
    icon: Shield,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-50",
    href: "/superadmin/admins",
  },
  {
    key: "totalVerifications" as keyof DashboardStats,
    label: "ID Verifications",
    icon: FileCheck2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    href: "/superadmin/verifications",
  },
  {
    key: "totalDistricts" as keyof DashboardStats,
    label: "Registered Districts",
    icon: MapPin,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
    href: "/superadmin/districts",
  },
  {
    key: "activeSubscriptions" as keyof DashboardStats,
    label: "Active Subscriptions",
    icon: CreditCard,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    href: "/superadmin/hotels",
  },
];

const QUICK_LINKS = [
  { label: "Add District Admin", href: "/superadmin/admins", icon: Shield, color: "from-orange-400 to-amber-500" },
  { label: "Manage Districts", href: "/superadmin/districts", icon: MapPin, color: "from-rose-500 to-pink-600" },
  { label: "View Verifications", href: "/superadmin/verifications", icon: FileCheck2, color: "from-emerald-500 to-teal-600" },
  { label: "All Hotels", href: "/superadmin/hotels", icon: Building2, color: "from-blue-500 to-indigo-600" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    saDashboard(token)
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-7 shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-400 uppercase mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Live System Overview
            </p>
            <h2 className="text-2xl font-black text-white mb-1">
              Welcome, Super Admin
            </h2>
            <p className="text-sm text-slate-400 max-w-xs">
              Full visibility into Pahchaan ID operations across all districts and hotels.
            </p>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          System Metrics
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRIC_CONFIG.map((m) => (
              <Link key={m.key} href={m.href} className="block">
                <StatCard
                  label={m.label}
                  value={stats?.[m.key] ?? 0}
                  icon={m.icon}
                  iconColor={m.iconColor}
                  iconBg={m.iconBg}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${q.color} p-5 text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <q.icon className="h-6 w-6 mb-3 relative" />
              <p className="font-bold text-sm relative">{q.label}</p>
              <ArrowRight className="h-4 w-4 mt-2 opacity-70 transition-transform group-hover:translate-x-1 relative" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
