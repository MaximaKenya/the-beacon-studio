"use client";

import { useState } from "react";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import { useFeatures } from "@/providers/FeatureProvider";
import { parseResponseJson } from "@/lib/safe-json";

type PayButtonProps = {
  tierId: string;
  mode?: "deposit" | "invoice";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  label?: string;
  /** Optional project id (portal / intake) stored on the payment record */
  projectId?: string;
};

/**
 * Pay deposit with Stripe Checkout OR M-Pesa STK Push (30% of tier floor).
 */
export function PayButton({
  tierId,
  mode = "deposit",
  variant = "secondary",
  className = "",
  label,
  projectId,
}: PayButtonProps) {
  const { openBooking } = useFeatures();
  const [loading, setLoading] = useState<"stripe" | "mpesa" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [showMpesa, setShowMpesa] = useState(false);

  if (!siteConfig.payments.enabled) return null;

  const depositPct =
    siteConfig.payments.depositPercent ?? siteConfig.payments.defaultDepositPercent ?? 30;
  const text =
    label ??
    (mode === "deposit"
      ? `${siteConfig.payments.depositLabel} (${depositPct}%)`
      : siteConfig.payments.invoiceLabel);

  const styles =
    variant === "primary"
      ? "bg-accent text-background hover:bg-accent-hover"
      : variant === "ghost"
        ? "border border-border/80 text-muted hover:border-accent/40 hover:text-accent"
        : "border border-border bg-background text-foreground hover:border-accent/40";

  function FallbackLinks() {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={`mailto:${siteConfig.email}`}
          onClick={() => trackEvent("cta_click", { type: "mailto", source: "pay_fallback" })}
          className="font-medium text-accent hover:text-accent-hover"
        >
          Email us
        </a>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => {
            openBooking();
            trackEvent("cta_click", { type: "book", source: "pay_fallback" });
          }}
          className="font-medium text-accent hover:text-accent-hover"
        >
          Book a call
        </button>
      </div>
    );
  }

  async function checkoutStripe() {
    setLoading("stripe");
    setMessage(null);
    trackEvent("cta_click", { type: "pay_stripe", tier: tierId, mode });

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, mode, ...(projectId ? { projectId } : {}) }),
      });
      const data = await parseResponseJson<{
        ok?: boolean;
        url?: string;
        message?: string;
      }>(res, {});

      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setMessage(data.message || siteConfig.payments.comingSoonMessage);
    } catch {
      setMessage(siteConfig.payments.comingSoonMessage);
    } finally {
      setLoading(null);
    }
  }

  async function checkoutMpesa() {
    setLoading("mpesa");
    setMessage(null);
    trackEvent("cta_click", { type: "pay_mpesa", tier: tierId, mode });

    try {
      const res = await fetch("/api/payments/mpesa/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, mode, phone, ...(projectId ? { projectId } : {}) }),
      });
      const data = await parseResponseJson<{
        ok?: boolean;
        message?: string;
        status?: string;
      }>(res, {});

      if (data.ok && data.status === "pending") {
        setMessage(
          data.message ||
            "Check your phone and enter your M-Pesa PIN to complete payment."
        );
        return;
      }

      setMessage(
        data.message ||
          siteConfig.payments.mpesaComingSoonMessage ||
          siteConfig.payments.comingSoonMessage
      );
    } catch {
      setMessage(siteConfig.payments.mpesaComingSoonMessage);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">
        {mode === "deposit"
          ? `${depositPct}% deposit of tier floor · Stripe or M-Pesa`
          : "Full tier floor · Stripe or M-Pesa"}
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void checkoutStripe()}
          disabled={!!loading}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${styles}`}
        >
          {loading === "stripe" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <CreditCard className="h-4 w-4" aria-hidden />
          )}
          {text} · Stripe
        </button>

        {!showMpesa ? (
          <button
            type="button"
            onClick={() => setShowMpesa(true)}
            disabled={!!loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold text-foreground transition-colors hover:border-accent/40 disabled:opacity-60"
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            Pay with M-Pesa
          </button>
        ) : (
          <div className="rounded-xl border border-border bg-surface/60 p-3">
            <label htmlFor={`mpesa-${tierId}`} className="mb-1.5 block text-xs text-muted">
              M-Pesa phone (07… or 2547…)
            </label>
            <input
              id={`mpesa-${tierId}`}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2547XXXXXXXX"
              className="mb-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void checkoutMpesa()}
              disabled={!!loading || !phone.trim()}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
            >
              {loading === "mpesa" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Smartphone className="h-4 w-4" aria-hidden />
              )}
              Send STK Push
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-2 rounded-lg border border-border bg-surface/80 px-3 py-2 text-xs leading-relaxed text-muted">
          <p>{message}</p>
          <FallbackLinks />
        </div>
      )}
    </div>
  );
}
