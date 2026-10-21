"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AutomationDesk,
  type DeskCharge,
  type DeskInstance,
  type DeskLead,
  type DeskLog,
} from "@/components/automations/AutomationDesk";
import { DemoSandbox } from "@/components/automations/DemoSandbox";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { formatKes } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";

type ClientView = {
  email: string;
  name: string;
  businessName: string;
  mrrKes: number;
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  channels?: ChannelReadiness;
};

type AdminView = {
  mrrKes: number;
  active: number;
  pending: number;
  paused: number;
  demos: number;
  clients: ClientView[];
  sandbox?: { instances: DeskInstance[] };
  channels?: ChannelReadiness;
};

const empty: AdminView = {
  mrrKes: 0,
  active: 0,
  pending: 0,
  paused: 0,
  demos: 0,
  clients: [],
  sandbox: { instances: [] },
};

export function AdminAutomations() {
  const [data, setData] = useState<AdminView | null>(null);
  const [email, setEmail] = useState<string>("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/automations");
    if (!res.ok) return;
    const next = await parseResponseJson<AdminView>(res, empty);
    setData(next);
    setEmail((current) => current || next.clients[0]?.email || "");
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  const selected = data?.clients.find((client) => client.email === email) || null;

  return (
    <section id="automations" className="admin-section">
      <h2 className="mb-4 font-display text-xl font-semibold text-heading">Automations</h2>
      {!data ? (
        <p className="text-sm text-muted">Loading automations…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Summary label="MRR" value={formatKes(data.mrrKes)} />
            <Summary label="Active" value={String(data.active)} />
            <Summary label="Awaiting payment" value={String(data.pending)} />
            <Summary label="Paused" value={String(data.paused)} />
            <Summary label="Demos" value={String(data.demos)} />
          </div>
          {data.sandbox && data.sandbox.instances.length > 0 && (
            <DemoSandbox instances={data.sandbox.instances} onChanged={() => void load()} />
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.clients.length === 0 && <p className="text-sm text-muted">No client automations yet.</p>}
            {data.clients.map((client) => (
              <button
                key={client.email}
                type="button"
                aria-pressed={client.email === email}
                onClick={() => setEmail(client.email)}
                className={`sleek-card rounded-2xl p-4 text-left ${client.email === email ? "choice-selected" : ""}`}
              >
                <p className="font-medium text-foreground">{client.businessName || client.name}</p>
                <p className="mt-1 text-xs text-muted">{client.email}</p>
                <p className="mt-2 text-sm text-foreground">
                  {formatKes(client.mrrKes)} MRR · {client.instances.length} automations
                </p>
              </button>
            ))}
          </div>
          {selected && (
            <AutomationDesk
              instances={selected.instances}
              logs={selected.logs}
              charges={selected.charges}
              leads={selected.leads}
              endpoint="/api/admin/automations"
              canActivate
              channels={selected.channels}
              onChanged={() => void load()}
            />
          )}
        </div>
      )}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-lg text-foreground">{value}</p>
    </div>
  );
}
