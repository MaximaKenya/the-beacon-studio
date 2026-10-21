"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminToast, useAdminToast } from "@/components/admin/AdminToast";
import { LeadEmailButton, LeadPhoneLinks } from "@/components/admin/LeadContactLinks";
import { parseResponseJson } from "@/lib/safe-json";
import { formatNairobi } from "@/lib/time";
import {
  LEAD_STATUSES,
  categoryOptions,
  channelLabel,
  emptyLeadFilters,
  filterLeads,
  filtersFromSearchParams,
  leadCategoryLabel,
  sourceOptions,
  writeFiltersToParams,
  type LeadFilters,
  type LeadStatus,
  type StudioLead,
} from "@/lib/leads";

const SCORE_OPTIONS = [
  { id: "", label: "Any score" },
  { id: "80", label: "80+" },
  { id: "50", label: "50–79" },
  { id: "25", label: "25–49" },
  { id: "low", label: "Under 25" },
];

function sameFilters(a: LeadFilters, b: LeadFilters): boolean {
  return (Object.keys(a) as (keyof LeadFilters)[]).every((key) => a[key] === b[key]);
}

export function AdminLeads() {
  const [leads, setLeads] = useState<StudioLead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>(() =>
    typeof window === "undefined"
      ? emptyLeadFilters()
      : filtersFromSearchParams(new URLSearchParams(window.location.search))
  );
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast, flash } = useAdminToast();

  useEffect(() => {
    const onPop = () => setFilters(filtersFromSearchParams(new URLSearchParams(window.location.search)));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (sameFilters(filters, filtersFromSearchParams(params))) return;
    writeFiltersToParams(params, filters);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}#leads`;
    window.history.replaceState(null, "", url);
  }, [filters]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const res = await fetch("/api/admin/leads");
      const data = await parseResponseJson<{ leads?: StudioLead[]; error?: string }>(res, {});
      if (cancel) return;
      if (!res.ok) {
        setError(data.error || "Could not load leads.");
        setLoading(false);
        return;
      }
      setLeads(data.leads ?? []);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const visible = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const selected = leads.find((lead) => lead.id === selectedId) ?? null;
  const sources = useMemo(() => sourceOptions(leads), [leads]);
  const categories = useMemo(() => categoryOptions(), []);
  const serviceCategories = categories.filter((item) => item.group === "Services");
  const buffetCategories = categories.filter((item) => item.group === "Buffet");

  function update(patch: Partial<LeadFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  async function saveStatus(id: string, status: LeadStatus) {
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id, status }),
    });
    const data = await parseResponseJson<{ error?: string; lead?: StudioLead }>(res, {});
    if (!res.ok || !data.lead) {
      flash(data.error || "Could not update the lead.");
      return;
    }
    setLeads((current) => current.map((lead) => (lead.id === id ? data.lead! : lead)));
    flash(`Status saved: ${status}`);
  }

  return (
    <section id="leads" className="admin-panel admin-section p-5 sm:p-6">
      <AdminToast message={toast} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-kicker">Pipeline</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-heading">Leads</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Contacts, bookings, emails, and Start a Project briefs. Filters stay in the page address.
          </p>
        </div>
        <p className="text-sm text-muted">
          {loading ? "Loading…" : `${visible.length} of ${leads.length}`}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-muted sm:col-span-2">
          Search
          <input
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Name, email, phone, company, message"
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted">
          Source
          <select
            value={filters.source}
            onChange={(event) => update({ source: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Any source</option>
            {sources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Status
          <select
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Any status</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Category
          <select
            value={filters.category}
            onChange={(event) => update({ category: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Any category</option>
            <optgroup label="Services">
              {serviceCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Buffet">
              {buffetCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="text-xs text-muted">
          Lead score
          <select
            value={filters.score}
            onChange={(event) => update({ score: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          >
            {SCORE_OPTIONS.map((item) => (
              <option key={item.id || "any"} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          From
          <input
            type="date"
            value={filters.from}
            onChange={(event) => update({ from: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-muted">
          To
          <input
            type="date"
            value={filters.to}
            onChange={(event) => update({ to: event.target.value })}
            className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button type="button" className="admin-btn mt-3 h-9" onClick={() => setFilters(emptyLeadFilters())}>
        Clear filters
      </button>

      {error && (
        <p className="mt-3 text-sm text-accent-warm" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl bg-background/35">
        {loading ? (
          <p className="px-4 py-8 text-sm text-muted">Loading leads…</p>
        ) : visible.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No leads match these filters.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-elevated/80 text-[11px] uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Contact</th>
                <th className="px-3 py-3 font-medium">Company</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Source</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={`cursor-pointer align-top ${selectedId === lead.id ? "bg-accent/10" : "hover:bg-surface/80"}`}
                >
                  <td className="px-3 py-2 text-foreground">{lead.name || "—"}</td>
                  <td className="px-3 py-2" onClick={(event) => event.stopPropagation()}>
                    <div className="space-y-1">
                      <LeadEmailButton email={lead.email} subject="Hello from The Beacon Studio" />
                      <LeadPhoneLinks phone={lead.phone} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted">{lead.company || "—"}</td>
                  <td className="px-3 py-2 text-foreground">{leadCategoryLabel(lead)}</td>
                  <td className="px-3 py-2 text-muted">{lead.sources.map(channelLabel).join(", ")}</td>
                  <td className="px-3 py-2 capitalize text-foreground">{lead.status}</td>
                  <td className="px-3 py-2 font-mono text-foreground">{lead.score}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted">
                    {formatNairobi(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl bg-background/40 p-4 text-sm">
          <p className="admin-kicker">Lead</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{selected.name}</h3>
          <div className="mt-2 space-y-1">
            <p>
              <LeadEmailButton email={selected.email} subject="Hello from The Beacon Studio" />
            </p>
            <p>
              <LeadPhoneLinks phone={selected.phone} />
            </p>
            <p className="text-muted">
              {selected.company || "No company"} · {selected.budget || "No budget"} · {leadCategoryLabel(selected)}
            </p>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-foreground">{selected.message || "No message."}</p>
          <label className="mt-3 block text-xs text-muted">
            Status
            <select
              value={selected.status}
              onChange={(event) => void saveStatus(selected.id, event.target.value as LeadStatus)}
              className="mt-1 rounded-xl px-3 py-2 text-sm capitalize"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </section>
  );
}
