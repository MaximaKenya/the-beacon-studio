"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { isValidEmail } from "@/lib/validation";
import { trackEvent } from "@/lib/analytics";
import { PayButton } from "@/components/features/PayButton";
import { DocumentActions } from "@/components/documents/DocumentActions";
import type { QuotationRecord } from "@/lib/documents";
import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { rememberQuote } from "@/components/features/SavedQuoteReminder";

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = ["Type", "Budget", "Timeline", "Brief", "Contact"] as const;

type PortalBootstrap = {
  accessToken: string;
  portalPath: string;
  quotation: QuotationRecord;
  projectId: string;
};

export function ProjectIntakeWizard() {
  const { intakeOpen, closeIntake } = useFeatures();
  const trapRef = useFocusTrap(intakeOpen);

  const [step, setStep] = useState<Step>(0);
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [improveMode, setImproveMode] = useState<string | null>(null);
  const [portal, setPortal] = useState<PortalBootstrap | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!intakeOpen) return;
    trackEvent("intake_start");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeIntake();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [intakeOpen, closeIntake]);

  useEffect(() => {
    if (!intakeOpen) {
      setStep(0);
      setProjectType("");
      setBudget("");
      setTimeline("");
      setBrief("");
      setName("");
      setEmail("");
      setCompany("");
      setError(null);
      setDone(false);
      setSubmitting(false);
      setImproveMode(null);
      setPortal(null);
      setCopied(false);
    }
  }, [intakeOpen]);

  if (!intakeOpen || !siteConfig.intake.enabled) return null;

  const help = siteConfig.intake.stepHelp;
  const examples = siteConfig.intake.briefExamples ?? [];

  const canNext =
    (step === 0 && projectType) ||
    (step === 1 && budget) ||
    (step === 2 && timeline) ||
    (step === 3 && brief.trim().length >= 20) ||
    (step === 4 && name.trim() && isValidEmail(email));

  async function improveBrief() {
    if (improving || brief.trim().length < 8) return;
    setImproving(true);
    setError(null);
    try {
      const res = await fetch("/api/brief/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, projectType }),
      });
      const data = (await res.json()) as { improved?: string; error?: string; mode?: string };
      if (!res.ok || !data.improved) {
        throw new Error(data.error || "Could not improve brief.");
      }
      setBrief(data.improved);
      setImproveMode(data.mode ?? "local");
      trackEvent("brief_improve", { mode: data.mode ?? "local" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Improve failed.");
    } finally {
      setImproving(false);
    }
  }

  async function submit() {
    if (!canNext || submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      projectType,
      budget,
      timeline,
      brief: brief.trim(),
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
    };

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        portal?: PortalBootstrap;
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      trackEvent("intake_submit", { projectType, budget, timeline });
      if (data.portal) {
        setPortal(data.portal);
        rememberQuote({
          portalPath: data.portal.portalPath,
          quotationId: data.portal.quotation?.id,
          name: payload.name,
          quotation: data.portal.quotation,
        });
      }
      setDone(true);

      const typeLabel =
        siteConfig.intake.projectTypes.find((t) => t.id === projectType)?.label ??
        projectType;
      const budgetLabel =
        siteConfig.intake.budgets.find((b) => b.id === budget)?.label ?? budget;
      const timelineLabel =
        siteConfig.intake.timelines.find((t) => t.id === timeline)?.label ??
        timeline;

      const portalHint = data.portal
        ? `\n\nClient portal: ${typeof window !== "undefined" ? window.location.origin : ""}${data.portal.portalPath}`
        : "";

      const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
        `Project intake — ${typeLabel}`
      )}&body=${encodeURIComponent(
        `Name: ${payload.name}\nEmail: ${payload.email}\nCompany: ${payload.company ?? "—"}\nType: ${typeLabel}\nBudget: ${budgetLabel}\nTimeline: ${timelineLabel}\n\nBrief:\n${payload.brief}${portalHint}`
      )}`;

      window.setTimeout(() => {
        window.location.href = mailto;
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[190] flex items-end justify-center bg-background/60 px-4 py-6 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-title"
      onClick={closeIntake}
    >
      <div
        ref={trapRef}
        className="glass-panel w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl shadow-black/25"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {siteConfig.brand.name}
            </p>
            <h2
              id="intake-title"
              className="font-display text-lg font-semibold text-foreground"
            >
              Start a Project
            </h2>
          </div>
          <button
            type="button"
            onClick={closeIntake}
            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Close intake"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!done && (
          <div className="flex gap-1 px-5 pt-4" aria-hidden>
            {STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    i <= step ? "bg-accent" : "bg-border"
                  }`}
                />
                <p className="mt-1.5 hidden text-center font-mono text-[9px] uppercase tracking-wider text-muted sm:block">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-display text-xl font-semibold text-foreground">
                Got it — thanks!
              </p>
              <p className="mt-2 text-sm text-muted">
                Your intake is saved and a quotation is ready. A mail draft may open
                with a copy. We&apos;ll follow up within 1–2 business days (EAT).
              </p>

              {portal?.quotation && (
                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-border/70 bg-background/50 p-4 text-left">
                  <p className="mb-2 text-xs font-medium text-foreground">Your quotation</p>
                  <DocumentActions kind="quotation" record={portal.quotation} />
                </div>
              )}

              {portal && (
                <div className="mx-auto mt-4 max-w-sm rounded-xl border border-accent/25 bg-accent/5 p-4 text-left">
                  <p className="text-xs font-medium text-foreground">
                    Save your portal link
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    Track milestones, messages, and documents anytime.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={portal.portalPath}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-background"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open portal
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const url = `${window.location.origin}${portal.portalPath}`;
                        await navigator.clipboard.writeText(url);
                        setCopied(true);
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mx-auto mt-6 max-w-xs space-y-2">
                <PayButton tierId="sprint" mode="deposit" variant="primary" />
                <PayButton tierId="product-build" mode="invoice" variant="ghost" label="Pay invoice" />
              </div>
              <button
                type="button"
                onClick={closeIntake}
                className="mt-4 inline-flex h-11 items-center rounded-xl border border-border px-6 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <fieldset>
                  <legend className="mb-1 font-display text-base font-semibold text-foreground">
                    What do you need?
                  </legend>
                  <p className="mb-4 text-xs leading-relaxed text-muted">{help.type}</p>
                  <ul className="space-y-2">
                    {siteConfig.intake.projectTypes.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setProjectType(t.id)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                            projectType === t.id
                              ? "border-accent/50 bg-accent/10"
                              : "border-border/70 bg-surface/40 hover:border-accent/30"
                          }`}
                        >
                          <span className="block text-sm font-medium text-foreground">
                            {t.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {t.description}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}

              {step === 1 && (
                <fieldset>
                  <legend className="mb-1 font-display text-base font-semibold text-foreground">
                    Rough budget
                  </legend>
                  <p className="mb-4 text-xs leading-relaxed text-muted">{help.budget}</p>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {siteConfig.intake.budgets.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => setBudget(b.id)}
                          className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                            budget === b.id
                              ? "border-accent/50 bg-accent/10 text-accent"
                              : "border-border/70 bg-surface/40 text-foreground hover:border-accent/30"
                          }`}
                        >
                          {b.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="mb-1 font-display text-base font-semibold text-foreground">
                    When do you hope to go live?
                  </legend>
                  <p className="mb-4 text-xs leading-relaxed text-muted">{help.timeline}</p>
                  <ul className="space-y-2">
                    {siteConfig.intake.timelines.map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setTimeline(t.id)}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            timeline === t.id
                              ? "border-accent/50 bg-accent/10 text-accent"
                              : "border-border/70 bg-surface/40 text-foreground hover:border-accent/30"
                          }`}
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              )}

              {step === 3 && (
                <div>
                  <label
                    htmlFor="intake-brief"
                    className="mb-1 block font-display text-base font-semibold text-foreground"
                  >
                    Tell us in plain English
                  </label>
                  <p className="mb-3 text-xs leading-relaxed text-muted">{help.brief}</p>
                  <textarea
                    id="intake-brief"
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={5}
                    placeholder="Who is it for? What should it do? What does success look like?"
                    className="w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void improveBrief()}
                      disabled={improving || brief.trim().length < 8}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-foreground hover:border-accent/40 disabled:opacity-40"
                    >
                      {improving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                      )}
                      Improve my brief
                    </button>
                    {improveMode && (
                      <span className="font-mono text-[10px] text-muted">
                        via {improveMode === "openai" ? "AI" : "local helper"}
                      </span>
                    )}
                  </div>
                  {examples.length > 0 && (
                    <div className="mt-4">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        Examples
                      </p>
                      <ul className="mt-2 space-y-2">
                        {examples.map((ex) => (
                          <li key={ex}>
                            <button
                              type="button"
                              onClick={() => setBrief(ex)}
                              className="w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-left text-xs text-muted transition-colors hover:border-accent/30 hover:text-foreground"
                            >
                              {ex}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">
                      How should we reach you?
                    </p>
                    <p className="mt-1 text-xs text-muted">{help.contact}</p>
                  </div>
                  <div>
                    <label htmlFor="intake-name" className="mb-1.5 block text-xs text-muted">
                      Name
                    </label>
                    <input
                      id="intake-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="intake-email" className="mb-1.5 block text-xs text-muted">
                      Email
                    </label>
                    <input
                      id="intake-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="intake-company" className="mb-1.5 block text-xs text-muted">
                      Organization (optional)
                    </label>
                    <input
                      id="intake-company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Business, school, church, NGO…"
                      className="w-full rounded-xl border border-border bg-surface/50 px-4 py-2.5 text-sm text-foreground focus:border-accent/50 focus:outline-none"
                      autoComplete="organization"
                    />
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-accent-warm" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0 || submitting}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => canNext && setStep((s) => Math.min(4, s + 1) as Step)}
                disabled={!canNext}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canNext || submitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
