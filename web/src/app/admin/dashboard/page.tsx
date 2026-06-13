"use client";

import { useEffect, useState } from "react";
import { adminDashboard, type AdminDashboardStats } from "@/lib/admin-api";
import { getToken } from "@/lib/admin-auth";
import StatCard from "@/components/superadmin/StatCard";
import { toast } from "sonner";
import {
  Building2,
  FileCheck2,
  MapPin,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminDashboard(token)
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const metricConfig = [
    {
      label: "Assigned Districts",
      value: stats?.districts?.length ?? 0,
      icon: MapPin,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      href: "/admin/dashboard",
    },
    {
      label: "Total Hotels",
      value: stats?.totalHotels ?? 0,
      icon: Building2,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      href: "/admin/hotels",
    },
    {
      label: "ID Verifications",
      value: stats?.totalVerifications ?? 0,
      icon: FileCheck2,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      href: "/admin/verifications",
    },
  ];

  const quickLinks = [
    { label: "View Verifications", href: "/admin/verifications", icon: FileCheck2, color: "from-teal-500 to-emerald-600" },
    { label: "All Hotels", href: "/admin/hotels", icon: Building2, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-7 shadow-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 uppercase mb-2">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Regional Overview
            </p>
            <h2 className="text-2xl font-black text-white mb-1">
              Welcome, District Admin
            </h2>
            <p className="text-sm text-slate-400 max-w-xs">
              Visibility into Pahchaan ID operations restricted to your assigned districts.
            </p>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-teal-500/30">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">
          Regional Metrics
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {metricConfig.map((m) => (
              <Link key={m.label} href={m.href} className="block">
                <StatCard
                  label={m.label}
                  value={m.value}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((q) => (
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
