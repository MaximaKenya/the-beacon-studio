"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { industryPacks } from "@/data/site";
import { computeRoi } from "@/lib/roi";
import { formatKes } from "@/lib/fx";
import { parseResponseJson } from "@/lib/safe-json";

const INDUSTRIES = industryPacks.map((pack) => ({ id: pack.id, label: pack.industry }));

export function AutomationRoi() {
  const [industry, setIndustry] = useState(INDUSTRIES[0]?.id || "services");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [unpaid, setUnpaid] = useState(0);
  const [hourly, setHourly] = useState(500);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const result = useMemo(
    () => computeRoi({ industry, weeklyHours, unpaidInvoicesKes: unpaid, hourlyCostKes: hourly }),
    [industry, weeklyHours, unpaid, hourly]
  );

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    const res = await fetch("/api/roi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, industry, weeklyHours, unpaidInvoicesKes: unpaid, hourlyCostKes: hourly }),
    });
    const body = await parseResponseJson<{ message?: string; error?: string }>(res, {});
    setStatus(body.message || body.error || (res.ok ? "Saved." : "Could not save."));
    setSending(false);
  }

  const field = "field h-11 w-full px-4 text-sm";
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="sleek-card space-y-4 self-start rounded-3xl p-6">
        <label className="block text-sm text-foreground">
          Industry
          <select className={`${field} mt-1`} value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {INDUSTRIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-foreground">
          Hours a week on follow-ups, reminders and admin
          <input className={`${field} mt-1`} type="number" min={0} max={168} value={weeklyHours} onChange={(e) => setWeeklyHours(Number(e.target.value))} />
        </label>
        <label className="block text-sm text-foreground">
          Unpaid invoices right now (KES)
          <input className={`${field} mt-1`} type="number" min={0} value={unpaid} onChange={(e) => setUnpaid(Number(e.target.value))} />
        </label>
        <label className="block text-sm text-foreground">
          Staff cost per hour (KES)
          <input className={`${field} mt-1`} type="number" min={0} value={hourly} onChange={(e) => setHourly(Number(e.target.value))} />
        </label>
      </div>

      <div className="space-y-4">
        <div className="sleek-card rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Estimate from your inputs</p>
          <dl className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-muted">Time cost a month</dt>
              <dd className="font-display text-2xl font-semibold text-foreground">{formatKes(result.monthlyTimeCostKes)}</dd>
              <dd className="text-xs text-muted">{result.monthlyHours} h</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Time cost a year</dt>
              <dd className="font-display text-2xl font-semibold text-foreground">{formatKes(result.annualTimeCostKes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Unpaid to chase</dt>
              <dd className="font-display text-2xl font-semibold text-foreground">{formatKes(result.unpaidInvoicesKes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Pack pays for itself at</dt>
              <dd className="font-display text-2xl font-semibold text-foreground">{result.breakEvenHours} h/mo</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Estimates only. We use your numbers and the published pack price, nothing else.</p>
        </div>

        <div className="sleek-card rounded-3xl p-6">
          <p className="text-xs text-muted">Recommended</p>
          <h2 className="font-display text-xl font-semibold text-foreground">{result.pack.name}</h2>
          <p className="mt-1 text-sm text-muted">{result.pack.summary}</p>
          <p className="mt-3 text-sm text-foreground">
            {formatKes(result.packMonthlyKes)}/mo · annual {formatKes(result.packAnnualMonthlyKes)}/mo
            {result.setupKes > 0 ? ` · setup ${formatKes(result.setupKes)}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted">
            {result.monthlyDifferenceKes >= 0
              ? `Your time cost is ${formatKes(result.monthlyDifferenceKes)} a month above the pack price.`
              : `The pack costs ${formatKes(-result.monthlyDifferenceKes)} a month more than the time you entered.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/automations?pack=${result.pack.id}`} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background">
              Start 30-day free trial
            </Link>
            <Link href={`/packs/${result.pack.id}`} className="rounded-full px-4 py-2 text-sm font-semibold text-accent">
              See the pack
            </Link>
          </div>
        </div>

        <form onSubmit={send} className="sleek-card space-y-3 rounded-3xl p-6">
          <p className="text-sm font-medium text-foreground">Email me this plan</p>
          <input className={field} placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={field} type="email" required placeholder="you@business.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={sending} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background disabled:opacity-60">
            {sending ? "Sending…" : "Send plan"}
          </button>
          {status && <p className="text-sm text-muted">{status}</p>}
        </form>
      </div>
    </div>
  );
}
