"use client";

import { useState, type FormEvent } from "react";
import { parseResponseJson } from "@/lib/safe-json";
import { trackEvent } from "@/lib/analytics";

/** Email capture for one free template. Returns a tokenised download link. */
export function TemplateDownload({ id }: { id: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: id, email: form.get("email"), website: form.get("website") }),
    }).catch(() => null);
    const body = res ? await parseResponseJson<{ ok?: boolean; url?: string; error?: string }>(res, {}) : {};
    setBusy(false);
    if (body.ok && body.url) {
      trackEvent("form_submit", { type: "template", template: id });
      setUrl(body.url);
    } else setError(body.error || "Could not save that email.");
  }

  if (url) {
    return (
      <a href={url} className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background">
        Download
      </a>
    );
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="sr-only" htmlFor={`tpl-${id}`}>
        Email
      </label>
      <input id={`tpl-${id}`} name="email" type="email" required placeholder="you@business.co.ke" className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm" />
      <button type="submit" disabled={busy} className="h-10 rounded-2xl bg-accent px-4 text-sm font-semibold text-background disabled:opacity-60">
        {busy ? "…" : "Get it free"}
      </button>
      {error && <p className="text-xs text-muted">{error}</p>}
    </form>
  );
}
