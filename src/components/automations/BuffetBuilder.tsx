"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatKes, formatUsd } from "@/lib/fx";
import { quoteBundle, type BillingInterval } from "@/automations/pricing";
import { AUTOMATION_CATEGORIES, type PricedTemplate, type SetupField } from "@/automations/templates/public";
import { parseResponseJson } from "@/lib/safe-json";
import { industryPacks } from "@/data/site";
import { packById } from "@/automations/packs";

type Entry = Record<string, string>;

export function BuffetBuilder({ templates, initialPack }: { templates: PricedTemplate[]; initialPack?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<string[]>(() => {
    const pack = packById(initialPack);
    return pack ? pack.templateIds.filter((id) => templates.some((item) => item.id === id)) : [];
  });
  const [activePack, setActivePack] = useState<string | null>(() => packById(initialPack)?.id || null);
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [step, setStep] = useState<"pick" | "setup">("pick");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [configs, setConfigs] = useState<Record<string, Record<string, unknown>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<"paystack" | "invoice" | "trial" | null>(null);
  const [paystackOn, setPaystackOn] = useState(false);
  const [trialDays, setTrialDays] = useState(30);

  const visible = templates.filter((template) => {
    const haystack = `${template.name} ${template.outcome} ${template.category}`.toLowerCase();
    if (category !== "All" && template.category !== category) return false;
    return haystack.includes(query.trim().toLowerCase());
  });
  const quote = useMemo(() => quoteBundle(selected, { billing }), [selected, billing]);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function setConfig(id: string, key: string, value: unknown) {
    setConfigs((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  }

  useEffect(() => {
    void fetch("/api/automations/checkout")
      .then((res) => res.json())
      .then((data: { paystack?: boolean; trialDays?: number }) => {
        setPaystackOn(Boolean(data.paystack));
        if (data.trialDays) setTrialDays(data.trialDays);
      })
      .catch(() => setPaystackOn(false));
  }, []);

  async function checkout(pay: "paystack" | "invoice" | "trial") {
    if (!quote) return;
    setLoading(pay);
    setMessage(null);
    try {
      const res = await fetch("/api/automations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateIds: selected,
          configs,
          billing,
          ownerName,
          ownerEmail,
          businessName,
          pay,
        }),
      });
      const data = await parseResponseJson<{ ok?: boolean; url?: string; message?: string }>(res, {});
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.message || "Checkout did not start.");
      if (data.ok) {
        const params = new URLSearchParams({ email: ownerEmail, trial: "1" });
        if (pay === "invoice") params.set("invoice", "1");
        window.location.href = `/automations/started?${params.toString()}`;
      }
    } catch {
      setMessage("Checkout did not start.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        {step === "pick" ? (
          <>
            <div className="mb-8">
              <h2 className="font-display text-lg font-semibold text-foreground">Packs</h2>
              <p className="mt-1 text-sm text-muted">Pre-picked by industry. Same bundle discount as picking them yourself.</p>
              <div className="-mx-1 mt-5 flex snap-x gap-5 overflow-x-auto px-1 pt-1 pb-6">
                {industryPacks.map((pack) => {
                  const quote = quoteBundle(pack.templateIds, { billing });
                  const on = activePack === pack.id;
                  return (
                    <div key={pack.id} className={`sleek-card price-tone flex w-[22rem] max-w-[85vw] shrink-0 snap-start flex-col rounded-3xl p-7 ${on ? "price-card-popular" : ""}`}>
                      <p className="price-accent text-xs font-semibold uppercase tracking-wide">{pack.industry}</p>
                      <Link href={`/packs/${pack.id}`} className="mt-2 font-display text-lg font-semibold text-heading hover:underline">
                        {pack.name}
                      </Link>
                      <p className="mt-1 text-sm text-muted">{pack.templateIds.length} automations{quote?.bundlePercent ? ` · ${quote.bundlePercent}% off` : ""}</p>
                      <p className="mt-4 flex-1 font-display text-3xl font-semibold tracking-tight text-heading">
                        {quote ? formatKes(quote.recurringMonthlyKes) : ""}
                        {quote && <span className="ml-1 text-sm font-normal tracking-normal text-muted">/mo</span>}
                      </p>
                      <button
                        type="button"
                        className="price-btn price-btn-secondary mt-5 self-start"
                        onClick={() => {
                          setSelected(pack.templateIds.filter((id) => templates.some((item) => item.id === id)));
                          setActivePack(pack.id);
                          setStep("setup");
                        }}
                      >
                        Start {trialDays}-day free trial
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="automation-search">
                Search automations
              </label>
              <input
                id="automation-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search automations"
                className="field h-11 flex-1 px-4 text-sm"
              />
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {["All", ...AUTOMATION_CATEGORIES].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === item ? "bg-accent text-background" : "bg-surface-elevated/80 text-muted"}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {visible.map((template) => {
                const on = selected.includes(template.id);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => toggle(template.id)}
                    aria-pressed={on}
                    className={`sleek-card price-lift relative flex flex-col rounded-3xl p-6 text-left ${on ? "choice-selected" : ""}`}
                  >
                    {on && (
                      <span className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-background shadow-[0_8px_18px_color-mix(in_srgb,var(--accent)_45%,transparent)]">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                    )}
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">{template.category}</p>
                    <h2 className="mt-2 pr-8 font-display text-lg font-semibold text-foreground">{template.name}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{template.outcome}</p>
                    <p className="mt-5 font-display text-xl font-semibold text-foreground">{formatKes(template.priceKes)}<span className="text-sm font-normal text-muted">/mo</span></p>
                    <p className="text-xs text-muted">about {formatUsd(template.priceUsd)}/mo{template.setupFeeKes > 0 ? ` · setup ${formatKes(template.setupFeeKes)} included` : ""}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <button type="button" onClick={() => setStep("pick")} className="text-sm font-semibold text-accent">
              Back to the buffet
            </button>
            <div className="sleek-card grid gap-3 rounded-3xl p-5 sm:grid-cols-3">
              <Field label="Your name" value={ownerName} onChange={setOwnerName} />
              <Field label="Email" value={ownerEmail} onChange={setOwnerEmail} type="email" />
              <Field label="Business" value={businessName} onChange={setBusinessName} />
            </div>
            {selected.map((id) => {
              const template = templates.find((item) => item.id === id);
              if (!template) return null;
              return (
                <SetupCard
                  key={id}
                  template={template}
                  config={configs[id] || {}}
                  onChange={(key, value) => setConfig(id, key, value)}
                />
              );
            })}
          </div>
        )}
      </div>
      <aside data-clear-cluster="" className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 self-start lg:top-24 lg:bottom-auto">
        <div className="sleek-card price-tone max-h-[min(58vh,28rem)] overflow-y-auto overscroll-contain rounded-3xl p-6 lg:max-h-[min(calc(100dvh-12.5rem),40rem)]">
          <h2 className="font-display text-lg font-semibold text-foreground">Your bundle</h2>
          {!quote || quote.count === 0 ? (
            <p className="mt-2 text-sm text-muted">Tick the automations you need. The total updates as you go.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                {quote.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>{item.name}</span>
                    <span className="shrink-0 text-muted">{formatKes(item.monthlyKes)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                {(["monthly", "annual"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setBilling(item)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${billing === item ? "[background:var(--pastel-btn)] text-[color:var(--pastel-ink)]" : "bg-surface-elevated/80 text-muted"}`}
                  >
                    {item === "monthly" ? "Monthly" : "Annual"}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">Setup fees are included in the total.</p>
              <dl className="mt-4 space-y-1 text-sm">
                <Row label="Monthly list" value={formatKes(quote.listMonthlyKes)} hint={formatUsd(quote.listMonthlyUsd)} />
                {quote.bundleLabel && <Row label={quote.bundleLabel} value={`−${quote.bundlePercent}%`} />}
                {quote.annualPercent > 0 && <Row label="Annual discount" value={`−${quote.annualPercent}%`} />}
                {quote.setupKes > 0 && <Row label="Setup" value={formatKes(quote.setupKes)} hint={formatUsd(quote.setupUsd)} />}
                <Row label="After the free month" value={formatKes(quote.dueKes)} hint={`about ${formatUsd(quote.dueUsd)}`} strong />
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Free for {trialDays} days, no card needed. Includes {quote.included.length} automation{quote.included.length === 1 ? "" : "s"}.
              </p>
            </>
          )}
          {step === "pick" ? (
            <button
              type="button"
              disabled={!quote || quote.count === 0}
              onClick={() => setStep("setup")}
              className="price-btn price-btn-primary mt-5 w-full"
            >
              Continue
            </button>
          ) : (
            <div className="mt-4 space-y-2">
              <button type="button" disabled={!!loading} onClick={() => void checkout("trial")} className="price-btn price-btn-primary w-full">
                {loading === "trial" ? "Starting…" : `Start ${trialDays} days free`}
              </button>
              <p className="text-center text-xs text-muted">Free for {trialDays} days, no card needed. See our <Link href="/privacy" className="text-accent">privacy policy</Link>.</p>
              {paystackOn && (
                <button type="button" disabled={!!loading} onClick={() => void checkout("paystack")} className="price-btn price-btn-secondary w-full">
                  {loading === "paystack" ? "Starting Paystack…" : "Pay with Paystack"}
                </button>
              )}
              <button type="button" disabled={!!loading} onClick={() => void checkout("invoice")} className="price-btn price-btn-secondary w-full">
                {loading === "invoice" ? "Sending…" : "Request invoice"}
              </button>
            </div>
          )}
          {message && <p className="mt-3 text-xs leading-relaxed text-muted">{message}</p>}
          <Link href="/#pricing" className="mt-3 block text-xs text-muted">
            Custom Pilot and retainer prices
          </Link>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className={strong ? "font-display text-lg font-semibold text-foreground" : "text-foreground"}>
        {value}
        {hint && <span className="ml-1 text-xs text-muted">{hint}</span>}
      </dd>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input value={value} type={type} onChange={(event) => onChange(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
    </label>
  );
}

function SetupCard({
  template,
  config,
  onChange,
}: {
  template: PricedTemplate;
  config: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const [description, setDescription] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const custom = template.id === "custom-reminder" || template.id === "custom-report";

  async function suggest() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/automations/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await parseResponseJson<{
        ok?: boolean;
        fields?: { key: string; label: string; type: string; required?: boolean }[];
        message?: string;
        recurrence?: string;
        channel?: string;
        metrics?: string[];
      }>(res, {});
      if (data.fields) onChange("customFields", data.fields);
      if (data.message) onChange("message", data.message);
      if (data.recurrence) onChange("recurrence", data.recurrence);
      if (data.channel) onChange("channel", data.channel);
      if (data.metrics) onChange("metrics", data.metrics);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <article className="sleek-card rounded-3xl p-5">
      <h3 className="font-display text-lg font-semibold text-foreground">{template.name}</h3>
      <p className="mt-1 text-sm text-muted">{template.summary}</p>
      {custom && (
        <div className="mt-4 rounded-2xl bg-background/40 p-3">
          <label className="block text-xs text-muted" htmlFor={`suggest-${template.id}`}>
            Describe it in a sentence. Groq suggests the fields when a key is set.
          </label>
          <textarea id={`suggest-${template.id}`} value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="field mt-1 px-3 py-2 text-sm" />
          <button type="button" onClick={() => void suggest()} disabled={suggesting} className="mt-2 text-sm font-semibold text-accent">
            {suggesting ? "Suggesting…" : "Suggest fields"}
          </button>
          {Array.isArray(config.customFields) && (
            <ul className="mt-2 text-xs text-muted">
              {(config.customFields as { label: string; type: string }[]).map((field) => (
                <li key={field.label}>{field.label} · {field.type}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {template.fields.map((field) => (
          <SetupFieldInput key={field.key} field={field} value={config[field.key]} onChange={(value) => onChange(field.key, value)} />
        ))}
      </div>
    </article>
  );
}

function SetupFieldInput({ field, value, onChange }: { field: SetupField; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "entries") {
    const rows = Array.isArray(value) ? (value as Entry[]) : [];
    const columns = field.columns || ["name", "email", "phone"];
    return (
      <div>
        <p className="text-xs text-muted">{field.label}</p>
        {field.help && <p className="text-xs text-muted">{field.help}</p>}
        <div className="mt-2 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-2">
              {columns.map((column) => (
                <input
                  key={column}
                  value={row[column] || ""}
                  placeholder={column}
                  onChange={(event) => {
                    const next = rows.slice();
                    next[index] = { ...row, [column]: event.target.value };
                    onChange(next);
                  }}
                  className="field h-10 px-3 text-sm"
                />
              ))}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, {}])}
          className="mt-2 text-sm font-semibold text-accent"
        >
          Add a row
        </button>
      </div>
    );
  }
  if (field.type === "metrics") {
    const options = ["leads", "payments", "messages", "runs"];
    const current = Array.isArray(value) ? value.map(String) : [];
    return (
      <fieldset>
        <legend className="text-xs text-muted">{field.label}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={current.includes(option)}
                onChange={(event) => onChange(event.target.checked ? [...current, option] : current.filter((item) => item !== option))}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  if (field.type === "select" || field.type === "recurrence" || field.type === "channel") {
    const options = field.options || (field.type === "recurrence"
      ? [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ]
      : field.type === "channel"
        ? [
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS" },
            { value: "whatsapp", label: "WhatsApp link" },
            { value: "both", label: "Email and phone" },
          ]
        : []);
    return (
      <label className="block text-xs text-muted">
        {field.label}
        <select value={typeof value === "string" ? value : ""} onChange={(event) => onChange(event.target.value)} className="field mt-1 h-10 px-3 text-sm">
          <option value="">Choose</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }
  const long = field.type === "textarea" || field.type === "message" || field.type === "file";
  return (
    <label className="block text-xs text-muted">
      {field.label}
      {field.help && <span className="mt-0.5 block">{field.help}</span>}
      {long ? (
        <textarea value={typeof value === "string" ? value : ""} placeholder={field.placeholder} rows={4} onChange={(event) => onChange(event.target.value)} className="field mt-1 px-3 py-2 text-sm" />
      ) : (
        <input value={typeof value === "string" || typeof value === "number" ? String(value) : ""} type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className="field mt-1 h-10 px-3 text-sm" />
      )}
    </label>
  );
}
