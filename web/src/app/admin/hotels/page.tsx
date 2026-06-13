"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { adminGetHotels, type HotelSummary } from "@/lib/admin-api";
import { getToken } from "@/lib/admin-auth";
import StatusBadge from "@/components/superadmin/StatusBadge";
import { toast } from "sonner";
import {
  Building2,
  Search,
  ChevronRight,
  MapPin,
  Users,
  FileCheck2,
  CreditCard,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetHotels(token)
      .then((d) => setHotels(d.hotels))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.owner.name.toLowerCase().includes(q) ||
        h.district?.name.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q) ||
        h.state?.toLowerCase().includes(q)
    );
  }, [hotels, search]);

  const activeCount = hotels.filter((h) => h.subscriptions?.[0]?.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Assigned Hotels</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {hotels.length} registered ·{" "}
            <span className="text-emerald-600 font-semibold">{activeCount} active</span>
          </p>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 h-10 w-full sm:w-72 shadow-sm focus-within:ring-2 focus-within:ring-emerald-200">
          <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search hotels, owners, districts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Hotel
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Owner
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  District
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Managers
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Verifications
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Subscription
                </th>
                <th className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <Skeleton className="h-4 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">
                      {search ? "No hotels match your search" : "No hotels registered in your districts yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((hotel) => {
                  const activeSub = hotel.subscriptions?.[0];
                  const isSubActive = activeSub?.isActive;
                  return (
                    <tr
                      key={hotel.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">
                            {hotel.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[hotel.city, hotel.state].filter(Boolean).join(", ") || hotel.address.slice(0, 30)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">{hotel.owner.name}</p>
                        <p className="text-xs text-slate-400">{hotel.owner.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        {hotel.district ? (
                          <div>
                            <p className="font-medium text-slate-700">{hotel.district.name}</p>
                            <p className="text-xs text-slate-400">{hotel.district.state}</p>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold">{hotel.managers.length}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold">{hotel._count.verifications}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isSubActive && activeSub ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              <CreditCard className="h-3 w-3" />
                              Active
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Exp: {format(new Date(activeSub.endDate), "dd MMM yyyy")}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            No Plan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={hotel.status} dot />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/hotels/${hotel.id}`}
                          className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:border-emerald-300 hover:text-emerald-800 transition-all shadow-sm"
                        >
                          View
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 font-medium">
            Showing {filtered.length} of {hotels.length} hotels
          </div>
        )}
      </div>
    </div>
  );
}
