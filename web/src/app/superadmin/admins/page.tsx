"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  saGetAdmins,
  saCreateAdmin,
  saAssignDistricts,
  saRemoveDistrict,
  saGetDistricts,
  type AdminRecord,
  type DistrictRecord,
} from "@/lib/superadmin-api";
import { getToken } from "@/lib/superadmin-auth";
import StatusBadge from "@/components/superadmin/StatusBadge";
import ConfirmDialog from "@/components/superadmin/ConfirmDialog";
import { toast } from "sonner";
import {
  Shield,
  Search,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create admin
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Assign districts
  const [assignTarget, setAssignTarget] = useState<AdminRecord | null>(null);
  const [selectedDistrictIds, setSelectedDistrictIds] = useState<string[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");

  // Remove district
  const [removeTarget, setRemoveTarget] = useState<{ adminId: string; districtId: string; districtName: string } | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const token = getToken();

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [adminsData, districtData] = await Promise.all([
        saGetAdmins(token),
        saGetDistricts(),
      ]);
      setAdmins(adminsData.admins);
      setDistricts(districtData.districts);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return admins;
    return admins.filter(
      (a) => a.name.toLowerCase().includes(q) || a.phone.toLowerCase().includes(q)
    );
  }, [admins, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !createName.trim() || createPhone.trim().length !== 10) return;
    setCreateLoading(true);
    try {
      await saCreateAdmin(token, {
        name: createName.trim(),
        phone: `+91${createPhone.trim()}`,
      });
      toast.success("Admin created successfully");
      setShowCreate(false);
      setCreateName("");
      setCreatePhone("");
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const openAssign = (admin: AdminRecord) => {
    setAssignTarget(admin);
    setSelectedDistrictIds([]);
    setDistrictSearch("");
  };

  const handleAssign = async () => {
    if (!token || !assignTarget || selectedDistrictIds.length === 0) return;
    setAssignLoading(true);
    try {
      await saAssignDistricts(token, assignTarget.id, selectedDistrictIds);
      toast.success("Districts assigned");
      setAssignTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!token || !removeTarget) return;
    setRemoveLoading(true);
    try {
      await saRemoveDistrict(token, removeTarget.adminId, removeTarget.districtId);
      toast.success("District removed");
      setRemoveTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const availableDistricts = districts.filter(
    (d) =>
      !(assignTarget?.districts ?? []).some((ad) => ad.district.id === d.id) &&
      !selectedDistrictIds.includes(d.id) &&
      d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">District Admins</h2>
          <p className="text-sm text-slate-500 mt-0.5">{admins.length} admins managing districts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 h-10 w-full sm:w-60 shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search admins…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 h-10 text-sm font-bold text-white shadow-md shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <Shield className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No admins yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((admin) => (
            <div key={admin.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              {/* Admin header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-100">
                  <span className="text-lg font-black text-white">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800">{admin.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {admin.phoneVerified ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-slate-300" />
                    )}
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {admin.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Since</p>
                  <p className="text-xs font-semibold text-slate-600">
                    {format(new Date(admin.createdAt), "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              {/* District chips */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Districts ({admin.districts.length})
                </p>
                {admin.districts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No districts assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {admin.districts.map((ad) => (
                      <span
                        key={ad.id}
                        className="group inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <MapPin className="h-3 w-3 text-slate-400 group-hover:text-red-400" />
                        {ad.district.name}
                        <span className="text-slate-400 group-hover:text-red-400">· {ad.district.state}</span>
                        <button
                          onClick={() =>
                            setRemoveTarget({
                              adminId: admin.id,
                              districtId: ad.district.id,
                              districtName: `${ad.district.name}, ${ad.district.state}`,
                            })
                          }
                          className="ml-1 rounded-full p-0.5 hover:bg-red-100 transition-colors"
                        >
                          <X className="h-2.5 w-2.5 text-slate-400 group-hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <button
                  onClick={() => openAssign(admin)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Assign Districts
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Admin Modal ──────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-2xl max-w-sm border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800">Create District Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-11 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 h-11 focus-within:border-slate-400 focus-within:bg-white transition-all">
                <span className="text-sm font-semibold text-slate-500 mr-2">+91</span>
                <span className="w-px h-4 bg-slate-200 mr-3" />
                <input
                  type="tel"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="XXXXX XXXXX"
                  inputMode="numeric"
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                disabled={createLoading}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!createName.trim() || createPhone.trim().length !== 10 || createLoading}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                  createName.trim() && createPhone.trim().length === 10 && !createLoading
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-md hover:shadow-orange-200"
                    : "bg-slate-200 cursor-not-allowed"
                )}
              >
                {createLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating…
                  </span>
                ) : "Create Admin"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Assign Districts Modal ──────────────────────────── */}
      <Dialog open={!!assignTarget} onOpenChange={() => setAssignTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800">
              Assign Districts to {assignTarget?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Already assigned (read-only) */}
            {assignTarget && assignTarget.districts.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  Currently Assigned
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assignTarget.districts.map((ad) => (
                    <span key={ad.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {ad.district.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search districts */}
            <div>
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                Add New Districts
              </p>
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="Search districts…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-10 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all mb-2"
              />
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 divide-y divide-slate-100">
                {availableDistricts.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">
                    {districtSearch ? "No districts match" : "All districts already assigned"}
                  </p>
                ) : (
                  availableDistricts.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDistrictIds((prev) => [...prev, d.id])}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-white transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-slate-700">{d.name}</p>
                      <p className="text-xs text-slate-400 ml-auto">{d.state}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Selected preview */}
            {selectedDistrictIds.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
                  To Assign ({selectedDistrictIds.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDistrictIds.map((id) => {
                    const d = districts.find((x) => x.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        {d?.name}
                        <button onClick={() => setSelectedDistrictIds((prev) => prev.filter((x) => x !== id))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                disabled={assignLoading}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={selectedDistrictIds.length === 0 || assignLoading}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                  selectedDistrictIds.length > 0 && !assignLoading
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-md"
                    : "bg-slate-200 cursor-not-allowed"
                )}
              >
                {assignLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Assigning…
                  </span>
                ) : `Assign ${selectedDistrictIds.length} District${selectedDistrictIds.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Remove District Confirm ─────────────────────────── */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove District"
        description={`Remove "${removeTarget?.districtName}" from this admin's jurisdiction? They will lose access to manage hotels in this district.`}
        onConfirm={handleRemove}
        loading={removeLoading}
        confirmLabel="Remove"
        variant="destructive"
      />
    </div>
  );
}
