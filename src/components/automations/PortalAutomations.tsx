"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AutomationDesk,
  ChannelStatus,
  type DeskCharge,
  type DeskInstance,
  type DeskLead,
  type DeskLog,
} from "@/components/automations/AutomationDesk";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { parseResponseJson } from "@/lib/safe-json";

type Snapshot = {
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  channels?: ChannelReadiness;
};

const empty: Snapshot = { instances: [], logs: [], charges: [], leads: [] };

export function PortalAutomations() {
  const [data, setData] = useState<Snapshot | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/automations/portal");
    if (!res.ok) {
      setData(empty);
      return;
    }
    setData(await parseResponseJson<Snapshot>(res, empty));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Automations</h2>
          <p className="mt-1 text-sm text-muted">Status, the next run, logs, and billing for this login.</p>
        </div>
        <Link href="/automations" className="text-sm text-accent hover:underline">
          Add from the buffet
        </Link>
      </div>
      {data?.channels && <ChannelStatus channels={data.channels} />}
      {data ? (
        <AutomationDesk
          instances={data.instances}
          logs={data.logs}
          charges={data.charges}
          leads={data.leads}
          endpoint="/api/automations/portal"
          onChanged={() => void load()}
        />
      ) : (
        <p className="text-sm text-muted">Loading automations…</p>
      )}
    </section>
  );
}
