"use client";

import { useEffect, useState, useMemo } from "react";
import { adminGetVerifications, type VerificationRecord } from "@/lib/admin-api";
import { getToken } from "@/lib/admin-auth";
import StatusBadge from "@/components/superadmin/StatusBadge";
import { toast } from "sonner";
import {
  FileCheck2,
  Search,
  Building2,
  ShieldCheck,
  Eye,
  Calendar,
  Users,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedVerification, setSelectedVerification] = useState<VerificationRecord | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const TYPES = ["ALL", "COUPLE", "FAMILY", "STUDENT", "PROFESSIONAL"];

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    adminGetVerifications(token)
      .then((d) => setVerifications(d.verifications))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return verifications.filter((v) => {
      const matchesType = typeFilter === "ALL" || v.type === typeFilter;
      const matchesSearch =
        !q ||
        v.hotel.name.toLowerCase().includes(q) ||
        v.manager.name.toLowerCase().includes(q) ||
        v.hotel.district?.name.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [verifications, search, typeFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit: ID Verifications</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time access logs for {verifications.length} visitor registrations across your districts.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-72">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input
                type="text"
                placeholder="Search hotel, manager..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
             />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl w-fit border border-slate-200/50">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              typeFilter === t
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {t === "ALL" ? "All Logs" : t}
          </button>
        ))}
      </div>

      {/* Audit Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Property Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stay Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrar (Manager)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Roster</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400 italic font-medium">No matching audit logs within current filter.</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr 
                    key={v.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedVerification(v)}
                  >
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                             <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900 leading-tight">{v.hotel.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{v.hotel.district?.name || 'Local District'}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <StatusBadge status={v.type} size="sm" />
                    </td>
                    <td className="px-6 py-5">
                       <p className="font-bold text-slate-800 leading-tight">{v.manager.name}</p>
                       <p className="text-[10px] font-medium text-slate-400 text-xs">{v.manager.phone}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{v.persons.length} IDs</span>
                          <span className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {v.adults}A {v.children > 0 && `· ${v.children}C`}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-slate-600">{format(new Date(v.createdAt), "dd MMM yyyy")}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-0.5">{format(new Date(v.createdAt), "HH:mm")}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                          <Eye className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Case File Sheet */}
      <Sheet open={!!selectedVerification} onOpenChange={(open) => !open && setSelectedVerification(null)}>
         <SheetContent className="w-full sm:max-w-xl p-0 overflow-hidden flex flex-col border-l border-slate-200 shadow-2xl">
            {selectedVerification && (
              <>
                <div className="bg-slate-900 px-8 py-10 text-white relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck className="h-32 w-32" strokeWidth={1} />
                   </div>
                   <SheetHeader className="relative z-10 text-left space-y-4">
                      <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
                         <ClipboardList className="h-3.5 w-3.5" />
                         Audit Case File
                      </div>
                      <SheetTitle className="text-3xl font-black text-white tracking-tight leading-none uppercase">
                         Log #{selectedVerification.id.slice(0, 8)}
                      </SheetTitle>
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                         <StatusBadge status={selectedVerification.type} />
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> {format(new Date(selectedVerification.createdAt), "dd MMM yyyy, HH:mm")}
                         </span>
                      </div>
                   </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                   <div className="px-8 py-10 space-y-10">
                      
                      {/* Section: Context */}
                      <section className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" /> Reporting Attribution
                         </h4>
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Registered At</p>
                               <p className="text-sm font-black text-slate-900">{selectedVerification.hotel.name}</p>
                               <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-tighter">
                                  {selectedVerification.hotel.district?.name || 'Local Jurisdiction'}
                               </p>
                            </div>
                            <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Audit Registrar</p>
                               <p className="text-sm font-black text-slate-900">{selectedVerification.manager.name}</p>
                               <p className="text-[10px] font-bold text-slate-500 mt-0.5 tabular-nums">{selectedVerification.manager.phone}</p>
                            </div>
                         </div>
                      </section>

                      {/* Section: Guest Roster */}
                      <section className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                               <Users className="h-3.5 w-3.5" /> Authenticated Roster
                            </h4>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                               {selectedVerification.persons.length} Identity Files
                            </span>
                         </div>
                         
                         <div className="space-y-3">
                            {selectedVerification.persons.map((p) => (
                               <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-all group">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                                     <UserCheck className="h-5 w-5 text-slate-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="font-black text-slate-900 leading-tight truncate uppercase tracking-tight">{p.name || 'Unknown'}</p>
                                     <div className="flex items-center gap-2 mt-1">
                                        <StatusBadge status={p.idType} size="sm" />
                                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{p.idNumber}</span>
                                     </div>
                                  </div>
                                  <div className={cn(
                                     "h-7 w-7 rounded-full flex items-center justify-center border",
                                     p.verified ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-300"
                                  )}>
                                     {p.verified ? <ShieldCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>

                      {/* Section: Misc */}
                      {selectedVerification.purpose && (
                        <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <ClipboardList className="h-3 w-3" /> Declaration of Purpose
                           </h4>
                           <p className="text-sm font-bold text-slate-700 leading-relaxed italic border-l-2 border-emerald-500 pl-4">
                              "{selectedVerification.purpose}"
                           </p>
                        </section>
                      )}
                   </div>
                </div>

                <div className="px-8 py-6 border-t border-slate-100 bg-white">
                   <button 
                     onClick={() => setSelectedVerification(null)}
                     className="w-full bg-slate-900 text-white rounded-xl py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                   >
                      Acknowledge Case File
                   </button>
                </div>
              </>
            )}
         </SheetContent>
      </Sheet>
    </div>
  );
}
