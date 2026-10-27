"use client";

import { useState, type FormEvent } from "react";
import { parseResponseJson } from "@/lib/safe-json";
import { trackEvent } from "@/lib/analytics";

type Option = { id: string; label: string };

/** Lead form for add-ons, partners and partnerships. Posts to /api/revenue/request. No payment. */
export function RequestForm({
  kind,
  title,
  options = [],
  defaultItem,
  companyRequired = false,
  submitLabel = "Send request",
  messagePlaceholder = "Anything we should know?",
}: {
  kind: string;
  title: string;
  options?: Option[];
  defaultItem?: string;
  companyRequired?: boolean;
  submitLabel?: string;
  messagePlaceholder?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const id = `req-${kind}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    setMessage(null);
    const res = await fetch("/api/revenue/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, ...Object.fromEntries(form.entries()) }),
    }).catch(() => null);
    const body = res ? await parseResponseJson<{ ok?: boolean; message?: string; error?: string }>(res, {}) : {};
    if (body.ok) {
      trackEvent("form_submit", { type: kind });
      setState("done");
      setMessage(body.message || "Thanks. We will be in touch.");
    } else {
      setState("idle");
      setMessage(body.error || "Could not send that. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="sleek-card rounded-3xl p-6" role="status">
        <h3 className="font-display text-lg font-semibold text-heading">Request sent</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="sleek-card space-y-3 rounded-3xl p-6" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="font-display text-lg font-semibold text-heading">
        {title}
      </h3>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {options.length > 0 && (
        <label className="block text-xs text-muted">
          Option
          <select name="item" defaultValue={defaultItem || options[0]?.id} className="mt-1 w-full rounded-xl px-3 py-2 text-sm">
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          Name
          <input name="name" required autoComplete="name" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          Email
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          Phone (optional)
          <input name="phone" autoComplete="tel" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" />
        </label>
        <label className="block text-xs text-muted">
          Business{companyRequired ? "" : " (optional)"}
          <input name="company" required={companyRequired} autoComplete="organization" className="mt-1 w-full rounded-xl px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-xs text-muted">
        Message
        <textarea name="message" rows={3} placeholder={messagePlaceholder} className="mt-1 w-full rounded-xl px-3 py-2 text-sm" />
      </label>
      {message && <p className="text-sm text-muted">{message}</p>}
      <button type="submit" disabled={state === "sending"} className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background disabled:opacity-60">
        {state === "sending" ? "Sending…" : submitLabel}
      </button>
      <p className="text-xs text-muted">No payment now. We reply with an invoice or a call.</p>
    </form>
  );
}
