"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AutomationDesk,
  ChannelStatus,
  type DeskCharge,
  type DeskInstance,
  type DeskLead,
  type DeskLog,
} from "@/components/automations/AutomationDesk";
import { AreaChart, Bars, Donut, NpsGauge } from "@/components/automations/Charts";
import { filterDays, type AutomationAnalytics, type DayBucket } from "@/lib/automations/analytics";
import type { ChannelReadiness } from "@/lib/automations/channels";
import { formatNairobi, nairobiDateKey } from "@/lib/time";
import { formatKes } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";
import type { QueueCounts } from "@/lib/notify-usage";
import { foundersLock as foundersTerms, proAddons, whatsappAddon } from "@/data/site";
import { WorksWithApps } from "@/components/revenue/WorksWithApps";

type Snapshot = {
  instances: DeskInstance[];
  logs: DeskLog[];
  charges: DeskCharge[];
  leads: DeskLead[];
  channels?: ChannelReadiness;
  analytics?: AutomationAnalytics;
  trial?: { endsAt: string; days: number; ended: boolean; stage?: string; stageLabel?: string; bonusDays?: number } | null;
  referral?: { code: string; link: string; pending: number; earned: number; redeemed: number; expired: number } | null;
  paystack?: boolean;
  foundersLock?: { lockedAt: string; until: string; note?: string } | null;
  usage?: { whatsapp: QueueCounts; sms: QueueCounts };
  invoices?: { id: string; status: string; amount: number; currency: string; tierName: string }[];
};

const empty: Snapshot = { instances: [], logs: [], charges: [], leads: [] };

export function PortalAutomations({ demo: demoProp }: { demo?: { email: string; token: string } } = {}) {
  const demoEmail = demoProp?.email;
  const demoToken = demoProp?.token;
  const [data, setData] = useState<Snapshot | null>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [focus, setFocus] = useState<string>("");

  const load = useCallback(async () => {
    const res = await fetch(
      demoEmail && demoToken
        ? `/api/automations/portal?demo=${encodeURIComponent(demoEmail)}&t=${encodeURIComponent(demoToken)}`
        : "/api/automations/portal"
    );
    if (!res.ok) {
      setData(empty);
      return;
    }
    setData(await parseResponseJson<Snapshot>(res, empty));
  }, [demoEmail, demoToken]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [load]);

  const days = useMemo(() => {
    const series = data?.analytics?.days || [];
    const end = nairobiDateKey();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (range - 1));
    return filterDays(series, nairobiDateKey(fromDate), end, focus || undefined);
  }, [data, range, focus]);

  async function requestInvoice() {
    await fetch("/api/automations/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "request-invoice" }),
    });
    await load();
  }

  if (!data) {
    return (
      <section className="space-y-4 pb-8">
        <div className="sleek-card h-28 animate-pulse rounded-3xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="sleek-card h-24 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const active = data.instances.filter((item) => item.status === "active").length;
  const collected = data.charges.filter((charge) => charge.status === "paid").reduce((sum, charge) => sum + charge.amountKes, 0);
  const month = data.analytics?.month;

  return (
    <section className="space-y-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">Automations</h2>
          <p className="mt-1 text-sm text-muted">
            {data.trial
              ? data.trial.ended
                ? "Trial ended. Request an invoice to continue."
                : `${data.trial.days} days remaining on the free month.`
              : "Status, runs, and what to do next."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-btn" onClick={() => void requestInvoice()}>
            Request invoice
          </button>
          <Link href="/automations" className="admin-btn">
            Add from the buffet
          </Link>
        </div>
      </div>

      {!data.paystack && (
        <p className="text-sm text-muted">Free for 30 days, no card needed. Pay with Paystack stays hidden until that account is ready.</p>
      )}

      {data.trial && data.trial.stage && data.trial.stage !== "paid" && (
        <TrialBanner trial={data.trial} onInvoice={() => void requestInvoice()} />
      )}

      {data.instances.length === 0 ? (
        <div className="sleek-card rounded-3xl p-6">
          <p className="text-sm text-muted">No automations yet.</p>
          <Link href="/automations" className="mt-3 inline-block text-sm text-accent">
            Browse the buffet
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card label="Active" value={String(active)} />
            <Card label="Runs this month" value={String(month?.runs || 0)} />
            <Card label="Messages sent" value={String(month?.messages || data.instances.reduce((sum, item) => sum + item.stats.messages, 0))} />
            <Card label="Leads captured" value={String(month?.leads || data.leads.length)} />
            <Card label="Bookings" value={String(month?.bookings || 0)} />
            <Card label="Payments collected" value={formatKes(collected)} />
            <Card label="Trial" value={data.trial ? (data.trial.ended ? "Ended" : `${data.trial.days} days`) : "—"} />
            <Card label="Outstanding" value={formatKes(data.analytics?.outstandingKes || 0)} />
          </div>

          {data.channels && <ChannelStatus channels={data.channels} />}

          {data.referral && <ReferralCard referral={data.referral} />}

          <UpgradesCard lock={data.foundersLock || null} usage={data.usage} />

          <WorksWithApps />

          <div className="flex flex-wrap items-center gap-2">
            {([7, 30, 90] as const).map((item) => (
              <button key={item} type="button" className={`rounded-full px-3 py-1 text-xs font-semibold ${range === item ? "bg-accent text-background" : "bg-surface-elevated/80 text-muted"}`} onClick={() => setRange(item)}>
                {item} days
              </button>
            ))}
            <label className="text-xs text-muted">
              Automation
              <select value={focus} onChange={(event) => setFocus(event.target.value)} className="field ml-2 h-8 px-2 text-xs">
                <option value="">All</option>
                {data.instances.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.templateId}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Runs">
              <AreaChart days={days} series="runs" />
            </Panel>
            <Panel title="Messages">
              <AreaChart days={days} series="messages" />
            </Panel>
            <Panel title="Messages by channel">
              <Donut slices={data.analytics?.channels || []} label="Messages by channel" />
            </Panel>
            <Panel title="Messages by automation">
              <Donut slices={data.analytics?.types || []} label="Messages by automation" />
            </Panel>
            <Panel title="Leads, bookings, reviews">
              <Bars slices={barSlices(days)} />
            </Panel>
            <Panel title="NPS">
              <NpsGauge score={data.analytics?.nps ?? null} />
            </Panel>
            <Panel title="Collected and outstanding">
              <Bars
                slices={[
                  { label: "Collected", value: data.analytics?.collectedKes || 0 },
                  { label: "Outstanding", value: data.analytics?.outstandingKes || 0 },
                ]}
              />
            </Panel>
            <Panel title="Activity">
              {data.logs.length === 0 ? (
                <p className="py-8 text-sm text-muted">No activity yet.</p>
              ) : (
                <ul className="max-h-56 space-y-2 overflow-auto">
                  {data.logs.slice(0, 12).map((log) => (
                    <li key={log.id} className="text-sm text-foreground">
                      {log.message}
                      <span className="mt-0.5 block text-xs text-muted">{formatNairobi(log.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {(data.invoices || []).length > 0 && (
            <div className="sleek-card rounded-2xl p-4">
              <h3 className="text-sm font-medium text-foreground">Invoices</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {data.invoices?.map((invoice) => (
                  <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {invoice.tierName} · {formatKes(invoice.amount)} · {invoice.status}
                    </span>
                    <a className="text-accent" href={`/api/automations/invoice/${invoice.id}`}>
                      Open
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <AutomationDesk
        instances={data.instances}
        logs={data.logs}
        charges={data.charges}
        leads={data.leads}
        endpoint="/api/automations/portal"
        onChanged={() => void load()}
      />
    </section>
  );
}

function barSlices(days: DayBucket[]) {
  return [
    { label: "Leads", value: days.reduce((sum, day) => sum + day.leads, 0) },
    { label: "Bookings", value: days.reduce((sum, day) => sum + day.bookings, 0) },
    { label: "Reviews", value: days.reduce((sum, day) => sum + day.reviews, 0) },
  ];
}

const STAGE_NOTE: Record<string, string> = {
  setup: "Finish setup: fill in each automation, add your contacts, run a test.",
  running: "Your automations are running. Check the numbers below.",
  ending: "Request an invoice to keep everything running after the trial.",
  ended: "Paused, not deleted. Request an invoice to switch back on.",
};

function TrialBanner({
  trial,
  onInvoice,
}: {
  trial: NonNullable<Snapshot["trial"]>;
  onInvoice: () => void;
}) {
  const stage = trial.stage || "running";
  return (
    <div className="sleek-card flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Trial · {trial.stageLabel}</p>
        <p className="mt-1 text-sm text-foreground">
          {trial.ended ? "Trial ended." : `${trial.days} days left.`}
          {trial.bonusDays ? ` Includes +${trial.bonusDays} referral days.` : ""}
        </p>
        <p className="mt-1 text-sm text-muted">{STAGE_NOTE[stage]}</p>
      </div>
      {(stage === "ending" || stage === "ended") && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="admin-btn" onClick={onInvoice}>
            Request invoice
          </button>
          <Link href="/book" className="admin-btn">
            Book a call
          </Link>
        </div>
      )}
    </div>
  );
}

function ReferralCard({ referral }: { referral: NonNullable<Snapshot["referral"]> }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(referral.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <div className="sleek-card rounded-2xl p-5">
      <h3 className="text-sm font-medium text-foreground">Refer a business</h3>
      <p className="mt-1 text-sm text-muted">They get an extra free month. You get one free month after their first paid month.</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-xl bg-surface-elevated/80 px-3 py-2 text-xs text-foreground break-all">{referral.link}</code>
        <button type="button" className="admin-btn" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">Code {referral.code}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div><p className="font-display text-xl font-semibold text-foreground">{referral.earned}</p><p className="text-xs text-muted">Credits earned</p></div>
        <div><p className="font-display text-xl font-semibold text-foreground">{referral.pending}</p><p className="text-xs text-muted">Pending</p></div>
        <div><p className="font-display text-xl font-semibold text-foreground">{referral.redeemed}</p><p className="text-xs text-muted">Used</p></div>
      </div>
      <p className="mt-3 text-xs text-muted">
        <Link href="/referrals" className="text-accent">Terms</Link>: new clients only, no self-referrals, credits expire after 12 months, no cash payouts.
      </p>
    </div>
  );
}

function UpgradesCard({ lock, usage }: { lock: Snapshot["foundersLock"]; usage?: Snapshot["usage"] }) {
  return (
    <div className="sleek-card rounded-2xl p-5">
      <h3 className="font-display text-base font-semibold text-heading">Upgrades</h3>
      {lock && (
        <p className="mt-2 rounded-xl bg-accent/10 px-3 py-2 text-sm text-foreground">
          {foundersTerms.title}: your price is kept until {formatNairobi(lock.until)}.
        </p>
      )}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {proAddons.slice(0, 4).map((addon) => (
          <li key={addon.id} className="text-sm text-muted">
            <span className="font-semibold text-foreground">{addon.name}</span> · {formatKes(addon.priceKes)} {addon.unit}
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted">
        <div>
          <p className="font-semibold text-foreground">WhatsApp</p>
          <p>{whatsappAddon.status}.</p>
          <p>Queued {usage?.whatsapp.waiting ?? 0} · sent {usage?.whatsapp.sent ?? 0}</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">SMS</p>
          <p>Queued {usage?.sms.waiting ?? 0} · sent {usage?.sms.sent ?? 0}</p>
        </div>
      </div>
      <Link href="/add-ons" className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background">
        Request invoice for an add-on
      </Link>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="sleek-card rounded-2xl p-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
