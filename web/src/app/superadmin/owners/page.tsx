"use client";

import { useEffect, useState, useMemo } from "react";
import { saGetOwners, type OwnerRecord } from "@/lib/superadmin-api";
import { getToken } from "@/lib/superadmin-auth";
import StatusBadge from "@/components/superadmin/StatusBadge";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Landmark,
  ShieldCheck,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OwnersPage() {
  const [owners, setOwners] = useState<OwnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    saGetOwners(token)
      .then((d) => setOwners(d.owners))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return owners;
    return owners.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q)
    );
  }, [owners, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Hotel Owners Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Maintain and audit a directory of {owners.length} registered property owners.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input
                type="text"
                placeholder="Search by owner identity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
             />
          </div>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Volume</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Properties</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-5">
                        <Skeleton className="h-4 w-full rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                       <Landmark className="h-12 w-12 mb-3" />
                       <p className="font-bold uppercase tracking-widest text-xs">No owner data available</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((owner) => {
                  const totalVerifications = owner.hotels.reduce((acc, h) => acc + h._count.verifications, 0);
                  const activeHotels = owner.hotels.filter((h) => h.subscriptions?.[0]?.isActive).length;

                  return (
                    <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md text-white font-black">
                            {owner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{owner.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Phone className="h-2.5 w-2.5" /> {owner.phone}</span>
                               {owner.email && (
                                 <>
                                   <span className="h-1 w-1 rounded-full bg-slate-200" />
                                   <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 truncate max-w-[120px]"><Mail className="h-2.5 w-2.5" /> {owner.email}</span>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                               <Building2 className="h-3 w-3 text-slate-400" /> {owner.hotels.length} Properties
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter ml-4.5">
                               {activeHotels} Active Plans
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-xs text-slate-900 tabular-nums shadow-inner">
                            {totalVerifications}
                         </div>
                      </td>
                      <td className="px-6 py-5 max-w-[200px]">
                         <div className="flex flex-wrap gap-1.5">
                            {owner.hotels.slice(0, 2).map(h => (
                               <div key={h.id} className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                                  <div className={cn("h-1 w-1 rounded-full", h.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-300')} />
                                  {h.name}
                               </div>
                            ))}
                            {owner.hotels.length > 2 && (
                               <span className="text-[9px] font-bold text-slate-300">+{owner.hotels.length - 2} more</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {format(new Date(owner.createdAt), "dd MMM, yyyy")}
                         </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                            {owner.phoneVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-slate-300" />}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{owner.phoneVerified ? 'Verified' : 'Pending'}</span>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
               System Record: Entry 01 - {filtered.length.toString().padStart(2, '0')} · Total Index {owners.length}
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
