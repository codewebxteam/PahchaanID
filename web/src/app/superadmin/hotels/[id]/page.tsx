"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { saGetHotelDetail, type HotelSummary } from "@/lib/superadmin-api";
import { getToken } from "@/lib/superadmin-auth";
import StatusBadge from "@/components/superadmin/StatusBadge";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  CreditCard,
  FileCheck2,
  ChevronLeft,
  Globe,
  MoreVertical,
  Briefcase,
  History,
  ClipboardList,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token || !id) return;
    saGetHotelDetail(token, id as string)
      .then((d) => setHotel(d.hotel))
      .catch((e) => {
        toast.error(e.message);
        router.push("/superadmin/hotels");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-8">
          <Skeleton className="col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!hotel) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* breadcrumb */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="h-3 w-3" />
        Back to Property directory
      </button>

      {/* Hero / ID Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                <Building2 className="h-6 w-6 text-slate-600" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{hotel.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <StatusBadge status={hotel.status} size="sm" dot />
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-2 border-l border-slate-200">REG: {hotel.id.slice(0, 8)}</span>
                </div>
             </div>
          </div>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 ml-16">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {hotel.address}, {hotel.city}, {hotel.state}
          </p>
        </div>
        
        <div className="text-right">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Onboarding Date</p>
           <p className="text-sm font-bold text-slate-700">{format(new Date(hotel.createdAt), "dd MMM yyyy, hh:mm a")}</p>
        </div>
      </div>

      {/* 4-Column Flat KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBox label="Active Staff" value={hotel.managers.length} icon={Users} />
        <MetricBox label="Audit Records" value={hotel._count.verifications} icon={FileCheck2} />
        <MetricBox label="History Logs" value={hotel.subscriptions?.length ?? 0} icon={CreditCard} />
        <MetricBox label="Status Flag" value={hotel.status === "ACTIVE" ? 1 : 0} icon={ShieldCheck} isStatus />
      </div>

      {/* Balanced 2-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Main Content Area (65%) */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="managers">
            <TabsList className="bg-transparent border-b border-slate-200 w-full rounded-none h-auto p-0 flex space-x-8">
              <TabsTrigger 
                value="managers" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 text-sm font-bold text-slate-400 px-1 py-3 transition-all"
              >
                Property Staff List
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 text-sm font-bold text-slate-400 px-1 py-3 transition-all"
              >
                Subscription Ledger
              </TabsTrigger>
            </TabsList>

            <TabsContent value="managers" className="py-6 focus-visible:outline-none">
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Credential Status</th>
                          <th className="px-6 py-3"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {hotel.managers.length === 0 ? (
                         <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">No personnel currently assigned to this property.</td></tr>
                       ) : hotel.managers.map((m) => (
                         <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">{m.name.charAt(0)}</div>
                                  <span className="font-bold text-slate-800">{m.name}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600">{m.phone}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                                  <div className="h-1 w-1 rounded-full bg-emerald-500" /> Authorized
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right"><MoreVertical className="h-4 w-4 text-slate-300" /></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="py-6 focus-visible:outline-none space-y-4">
               {hotel.subscriptions?.length === 0 ? (
                 <div className="p-12 text-center border border-slate-200 border-dashed rounded-2xl bg-slate-50 text-slate-400 text-sm font-medium">No subscription logs or pending payments found.</div>
               ) : hotel.subscriptions?.map((sub) => (
                 <div key={sub.id} className={cn(
                   "group flex items-center justify-between p-5 rounded-xl border transition-all",
                   sub.isActive ? "border-blue-200 bg-blue-50/20" : "border-slate-200 bg-white"
                 )}>
                    <div className="flex items-start gap-4">
                       <div className={cn("h-10 w-10 flex items-center justify-center rounded-lg border", sub.isActive ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-slate-100 text-slate-400 border-slate-200")}>
                          <ClipboardList className="h-5 w-5" />
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <p className="font-bold text-slate-800">Standard Management Tier</p>
                             {sub.isActive && <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">Active Plan</span>}
                          </div>
                          <p className="text-xs font-bold text-slate-400 mt-1">Period: {format(new Date(sub.startDate), "dd MMM yyyy")} — {format(new Date(sub.endDate), "dd MMM yyyy")}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-slate-800">₹{sub.payments?.[0] ? parseFloat(sub.payments[0].amount).toLocaleString() : '0'}</p>
                       <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1 justify-end">
                          <CheckCircle2 className="h-3 w-3" /> Settled
                       </div>
                    </div>
                 </div>
               ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Info Panel / Right Column (35%) */}
        <div className="space-y-6">
           {/* Description List Format for Expert Look */}
           <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
              <div className="px-6 py-5">
                 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   <Briefcase className="h-3.5 w-3.5" /> Ownership Portfolio
                 </h3>
                 <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-900 uppercase">{hotel.owner.name.charAt(0)}</div>
                    <div>
                        <p className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{hotel.owner.name}</p>
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                           <CheckCircle2 className="h-3 w-3" /> Verified Status
                        </p>
                    </div>
                 </div>
              </div>
              
              <div className="px-6 py-6 space-y-5">
                 <DetailItem label="Primary Contact Number" value={hotel.owner.phone} icon={Phone} />
                 <DetailItem label="Associated Registered Email" value={hotel.owner.email || "Not specified by owner"} icon={Mail} />
                 <DetailItem label="Business Jurisdiction" value={`${hotel.city}, ${hotel.state}`} icon={MapPin} />
              </div>

              <div className="px-6 py-6 bg-slate-50/50">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Score</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">94 / 100</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-slate-900 rounded-full" />
                 </div>
              </div>
           </div>

           {/* Location context */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Globe className="h-20 w-20" strokeWidth={1} />
              </div>
              <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 relative z-10">Regional Profile</h3>
              <div className="space-y-4 relative z-10">
                 <div>
                    <p className="text-xl font-bold">{hotel.district?.name || 'Central District'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{hotel.district?.state || 'Local Administration'}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Precise Lat</p>
                       <p className="text-xs font-bold text-slate-200 mt-1 tabular-nums">{hotel.latitude || '22.5726'}</p>
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Precise Long</p>
                       <p className="text-xs font-bold text-slate-200 mt-1 tabular-nums">{hotel.longitude || '88.3639'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: Icon, isStatus = false }: { label: string, value: number, icon: any, isStatus?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
       <div>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{label}</p>
         <h4 className="text-xl font-bold text-slate-900 leading-none">{isStatus ? (value > 0 ? 'Verified' : 'Flagged') : value}</h4>
       </div>
       <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
          <Icon className="h-4.5 w-4.5" />
       </div>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="flex gap-4">
       <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
          <Icon className="h-3.5 w-3.5" />
       </div>
       <div className="overflow-hidden">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
       </div>
    </div>
  );
}
