"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  saGetDistricts,
  saCreateDistrict,
  saUpdateDistrict,
  saDeleteDistrict,
  type DistrictRecord,
} from "@/lib/superadmin-api";
import { getToken } from "@/lib/superadmin-auth";
import ConfirmDialog from "@/components/superadmin/ConfirmDialog";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const INDIAN_STATES = [
  "ANDHRA PRADESH","ARUNACHAL PRADESH","ASSAM","BIHAR","CHHATTISGARH",
  "GOA","GUJARAT","HARYANA","HIMACHAL PRADESH","JHARKHAND","KARNATAKA",
  "KERALA","MADHYA PRADESH","MAHARASHTRA","MANIPUR","MEGHALAYA","MIZORAM",
  "NAGALAND","ODISHA","PUNJAB","RAJASTHAN","SIKKIM","TAMIL NADU","TELANGANA",
  "TRIPURA","UTTAR PRADESH","UTTARAKHAND","WEST BENGAL",
  "ANDAMAN AND NICOBAR ISLANDS","CHANDIGARH","DADRA AND NAGAR HAVELI AND DAMAN AND DIU",
  "DELHI","JAMMU AND KASHMIR","LADAKH","LAKSHADWEEP","PUDUCHERRY",
];

type ModalMode = "create" | "edit" | null;

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<DistrictRecord | null>(null);
  const [formName, setFormName] = useState("");
  const [formState, setFormState] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DistrictRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = getToken();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await saGetDistricts();
      setDistricts(d.districts);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const uniqueStates = useMemo(() => {
    const s = [...new Set(districts.map((d) => d.state))].sort();
    return ["ALL", ...s];
  }, [districts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return districts.filter((d) => {
      const matchState = stateFilter === "ALL" || d.state === stateFilter;
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q);
      return matchState && matchSearch;
    });
  }, [districts, search, stateFilter]);

  const openCreate = () => {
    setFormName(""); setFormState(""); setModalMode("create");
  };

  const openEdit = (d: DistrictRecord) => {
    setEditTarget(d);
    setFormName(d.name);
    setFormState(d.state);
    setModalMode("edit");
  };

  const closeModal = () => { setModalMode(null); setEditTarget(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !formName.trim() || !formState.trim()) return;
    setFormLoading(true);
    try {
      if (modalMode === "create") {
        await saCreateDistrict(token, { name: formName.trim(), state: formState });
        toast.success("District created successfully");
      } else if (modalMode === "edit" && editTarget) {
        await saUpdateDistrict(token, editTarget.id, { name: formName.trim(), state: formState });
        toast.success("District updated");
      }
      closeModal();
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleteLoading(true);
    try {
      await saDeleteDistrict(token, deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Group by state
  const byState = useMemo(() => {
    const map = new Map<string, DistrictRecord[]>();
    filtered.forEach((d) => {
      if (!map.has(d.state)) map.set(d.state, []);
      map.get(d.state)!.push(d);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Districts</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {districts.length} districts across {uniqueStates.length - 1} states
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 h-10 w-full sm:w-60 shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
            <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search districts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 h-10 text-sm font-bold text-white shadow-md shadow-rose-200 hover:shadow-rose-300 hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add District
          </button>
        </div>
      </div>

      {/* State filter */}
      {uniqueStates.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {uniqueStates.map((s) => (
            <button
              key={s}
              onClick={() => setStateFilter(s)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all",
                stateFilter === s
                  ? "bg-slate-800 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {s === "ALL" ? "All States" : s}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <MapPin className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No districts found</p>
          <button
            onClick={openCreate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add First District
          </button>
        </div>
      ) : stateFilter === "ALL" ? (
        // Grouped by state
        <div className="space-y-6">
          {Array.from(byState.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([state, dists]) => (
            <div key={state}>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                {state} ({dists.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {dists.map((d) => (
                  <DistrictCard
                    key={d.id}
                    district={d}
                    onEdit={() => openEdit(d)}
                    onDelete={() => setDeleteTarget(d)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((d) => (
            <DistrictCard
              key={d.id}
              district={d}
              onEdit={() => openEdit(d)}
              onDelete={() => setDeleteTarget(d)}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {districts.length} districts
        </p>
      )}

      {/* ── Create / Edit Modal ───────────────────────────── */}
      <Dialog open={!!modalMode} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="rounded-2xl max-w-sm border-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800">
              {modalMode === "create" ? "Add District" : "Edit District"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                District Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Nashik"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-11 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1.5">
                State / UT
              </label>
              <select
                value={formState}
                onChange={(e) => setFormState(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 h-11 text-sm text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all appearance-none"
              >
                <option value="">Select state…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formName.trim() || !formState || formLoading}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all",
                  formName.trim() && formState && !formLoading
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-md"
                    : "bg-slate-200 cursor-not-allowed"
                )}
              >
                {formLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {modalMode === "create" ? "Creating…" : "Saving…"}
                  </span>
                ) : modalMode === "create" ? "Create District" : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete District"
        description={`Delete "${deleteTarget?.name}, ${deleteTarget?.state}"? This action cannot be undone. Districts with active hotels cannot be deleted.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}

function DistrictCard({
  district,
  onEdit,
  onDelete,
}: {
  district: DistrictRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50">
          <MapPin className="h-4 w-4 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-tight">{district.name}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
            {district.state}
          </p>
          <p className="text-[10px] text-slate-300 mt-1">
            Added {format(new Date(district.createdAt), "dd MMM yyyy")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
        >
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </div>
  );
}
