"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { readStoredAttribution } from "@/lib/attribution-client";
import { isValidEmail } from "@/lib/validation";

const NEEDS = [
  {
    id: "automation",
    label: "Automation",
    topic: "ai-automation",
    source: "quick-lead:automation",
    detail: "Replies, reminders, or follow-ups on the tools you already use.",
  },
  {
    id: "custom-software",
    label: "Custom software",
    topic: "other",
    source: "quick-lead:custom-software",
    detail: "Software designed and built for your business.",
  },
  {
    id: "managed-it",
    label: "Managed IT",
    topic: "other",
    source: "quick-lead:managed-it",
    detail: "Backup, endpoint, firewall, or Microsoft 365.",
  },
  {
    id: "product",
    label: "A product",
    topic: "other",
    source: "quick-lead:product",
    detail: "ConfiRent, CadenceApp, LookFinesse, or ConfiLearn.",
  },
] as const;

type NeedId = (typeof NEEDS)[number]["id"];

function phoneOk(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

export function LeadCapture() {
  const { openBooking } = useFeatures();
  const [need, setNeed] = useState<NeedId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const selected = NEEDS.find((item) => item.id === need) ?? null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      setError("Add your name.");
      return;
    }
    if (!trimmedEmail && !trimmedPhone) {
      setError("Add an email or a phone number.");
      return;
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("That email does not look right.");
      return;
    }
    if (trimmedPhone && !phoneOk(trimmedPhone)) {
      setError("Add a phone number we can reach.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone,
          topic: selected.topic,
          source: selected.source,
          message: `Quick lead: ${selected.label}. ${selected.detail}`,
          ...readStoredAttribution(),
        }),
      });
      if (!res.ok) {
        setError("Could not save that. Please try again, or book the audit.");
        return;
      }
      trackEvent("lead_submit", { source: selected.source, need: selected.id });
      setDone(true);
    } catch {
      setError("Could not save that. Please try again, or book the audit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="lead" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Start"
          title="What do you need?"
          description="Two steps. We reply within one business day, Nairobi time."
        />

        <div className="sleek-card rounded-3xl p-6 sm:p-8">
          {done ? (
            <div className="mx-auto max-w-lg py-6 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden />
              <h3 className="mt-4 font-display text-2xl font-semibold text-heading">You are in.</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                We saved this in the studio inbox and will follow up
                {email.trim() ? ` at ${email.trim()}` : phone.trim() ? ` on ${phone.trim()}` : ""}.
              </p>
              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { type: "book", source: "lead_confirm" });
                  openBooking("automation-audit");
                }}
                className="mt-6 inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
              >
                {siteConfig.cta.primary}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {NEEDS.map((item) => {
                  const active = need === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNeed(item.id);
                        trackEvent("cta_click", { type: "lead_pick", source: item.source });
                      }}
                      aria-pressed={active}
                      className={`rounded-2xl px-4 py-4 text-left transition ${
                        active
                          ? "bg-accent text-background shadow-[0_12px_28px_color-mix(in_srgb,var(--accent)_32%,transparent)]"
                          : "bg-surface-elevated/75 text-foreground"
                      }`}
                    >
                      <span className="block font-display text-base font-semibold">{item.label}</span>
                      <span
                        className={`mt-1 block text-xs leading-relaxed ${
                          active ? "text-background/80" : "text-muted"
                        }`}
                      >
                        {item.detail}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm font-medium text-foreground">
                    Name
                    <input
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="name"
                      className="field mt-2 px-4 py-3"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="field mt-2 px-4 py-3"
                    />
                  </label>
                  <label className="block text-sm font-medium text-foreground">
                    Phone
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      placeholder={siteConfig.phoneDisplay}
                      className="field mt-2 px-4 py-3"
                    />
                  </label>
                </div>
              )}

              {error && (
                <p className="text-sm text-accent-warm" role="alert">
                  {error}
                </p>
              )}

              {selected && (
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background disabled:opacity-60"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Send
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
