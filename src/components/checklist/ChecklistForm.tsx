"use client";

import { FormEvent, useState } from "react";
import { CHECKLIST_TITLE } from "@/lib/checklist";
import { readStoredAttribution } from "@/lib/attribution-client";

type DownloadLinks = { html: string; pdf: string };

export function ChecklistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState<DownloadLinks | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          website,
          ...readStoredAttribution(),
        }),
      });
      const data = (await res.json()) as { error?: string; html?: string; pdf?: string };
      if (!res.ok || !data.html || !data.pdf) {
        setError(data.error || "Could not save that email. Try again.");
        return;
      }
      setLinks({ html: data.html, pdf: data.pdf });
    } catch {
      setError("Could not save that email. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (links) {
    return (
      <div className="sleek-card rounded-3xl p-6 sm:p-8" role="status">
        <h2 className="font-display text-2xl font-semibold text-heading">Your checklist is ready</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We saved your email. Download the HTML or the PDF. If email sending is configured, a copy of these links is on its way.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={links.html}
            className="inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            Download HTML
          </a>
          <a
            href={links.pdf}
            className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated/80 px-5 text-sm font-semibold text-foreground"
          >
            Download PDF
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="sleek-card rounded-3xl p-6 sm:p-8" noValidate>
      <h2 className="font-display text-2xl font-semibold text-heading">{CHECKLIST_TITLE}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Enter your email to download it. We store that as a lead and follow up about the free audit. No account.
      </p>
      <div className="mt-6 grid gap-4">
        <label className="text-sm font-medium text-foreground" htmlFor="checklist-name">
          Name
          <input
            id="checklist-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor="checklist-email">
          Email
          <input
            id="checklist-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor="checklist-company">
          Business <span className="font-normal text-muted">(optional)</span>
          <input
            id="checklist-company"
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
          <label htmlFor="checklist-website">
            Website
            <input
              id="checklist-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm text-accent-warm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background disabled:opacity-60"
      >
        {busy ? "Saving…" : "Email me the checklist"}
      </button>
    </form>
  );
}
