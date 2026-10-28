"use client";

import { useEffect, useState } from "react";
import { Building2, CreditCard, Loader2 } from "lucide-react";
import { carePlans, siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics";
import { readStoredAttribution } from "@/lib/attribution-client";
import { formatKes, formatUsd, kesForCharge } from "@/lib/fx";
import { useFeatures } from "@/providers/FeatureProvider";
import { parseResponseJson } from "@/lib/safe-json";

type PayButtonProps = {
  tierId: string;
  mode?: "deposit" | "invoice";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  label?: string;
  projectId?: string;
};

type PayOptions = {
  paystack: boolean;
  usdKesRate: number;
  depositPercent: number;
};

type PayCurrency = "KES" | "USD";

/**
 * Deposit checkout. Paystack is the primary path (KES M-Pesa/card, or USD card).
 * Bank transfer always creates an invoice request in admin.
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
  const [options, setOptions] = useState<PayOptions | null>(null);
  const [currency, setCurrency] = useState<PayCurrency>("KES");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [carePlan, setCarePlan] = useState("");
  const [annual, setAnnual] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [loading, setLoading] = useState<"paystack" | "bank" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/payments/options")
      .then((res) => parseResponseJson<PayOptions>(res, { paystack: false, usdKesRate: 130, depositPercent: 30 }))
      .then((data) => setOptions(data))
      .catch(() => setOptions(null));
  }, []);

  if (!siteConfig.payments.enabled) return null;

  const tier = siteConfig.pricingTiers.find((item) => item.id === tierId);
  if (!tier || tier.fromAmount <= 0 || tier.quoteOnly) return null;

  const depositPct = options?.depositPercent ?? siteConfig.payments.depositPercent ?? siteConfig.payments.defaultDepositPercent ?? 30;
  const usd =
    mode === "deposit"
      ? Math.round(tier.fromAmount * (depositPct / 100) * 100) / 100
      : tier.fromAmount;
  const rate = options?.usdKesRate || 130;
  const kes = kesForCharge({
    usdFloor: tier.fromAmount,
    usdCharge: usd,
    kesFloor: tier.kesAmount,
    rate,
  });
  const kesPriced = Boolean(tier.kesAmount);
  // Card checkout only shows once Paystack is switched on for the account.
  const paystackOn = options?.paystack === true;
  const text = label ?? (mode === "deposit" ? `${siteConfig.payments.depositLabel} (${depositPct}%)` : siteConfig.payments.invoiceLabel);
  const usdLabel = formatUsd(usd);
  const kesLabel = formatKes(kes);

  const primary =
    variant === "primary"
      ? "bg-accent text-background"
      : "bg-accent text-background";

  function renderFallbackLinks() {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={`mailto:${siteConfig.email}`} className="font-medium text-accent">
          Email us
        </a>
        <span aria-hidden>·</span>
        <button
          type="button"
          onClick={() => {
            openBooking();
            trackEvent("cta_click", { type: "book", source: "pay_fallback" });
          }}
          className="font-medium text-accent"
        >
          Book a call
        </button>
      </div>
    );
  }

  async function checkoutPaystack() {
    setLoading("paystack");
    setMessage(null);
    trackEvent("cta_click", { type: "pay_paystack", tier: tierId, mode, currency });
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId,
          mode,
          currency,
          email,
          ...(name ? { name } : {}),
          ...(projectId ? { projectId } : {}),
        }),
      });
      const data = await parseResponseJson<{ ok?: boolean; url?: string; message?: string }>(res, {});
      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.message || "Paystack is not configured yet. Request an invoice instead.");
    } catch {
      setMessage("Paystack is not configured yet. Request an invoice instead.");
    } finally {
      setLoading(null);
    }
  }

  async function requestInvoice() {
    setLoading("bank");
    setMessage(null);
    trackEvent("cta_click", { type: "pay_bank", tier: tierId, mode });
    try {
      const res = await fetch("/api/payments/invoice-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId,
          mode,
          name,
          email,
          ...(note ? { note } : {}),
          ...(carePlan ? { carePlan } : {}),
          ...(annual ? { billing: "annual" } : {}),
          ...(projectId ? { projectId } : {}),
          ...readStoredAttribution(),
        }),
      });
      const data = await parseResponseJson<{ ok?: boolean; message?: string }>(res, {});
      setMessage(data.message || (data.ok ? "Invoice request received." : "Could not send the request."));
      if (data.ok) setShowBank(false);
    } catch {
      setMessage("Could not send the invoice request.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={`w-full rounded-2xl bg-background/40 p-4 ${className}`}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        {mode === "deposit" ? `${depositPct}% deposit` : "Full amount"} · {kesPriced ? "KES" : "USD"} and {kesPriced ? "USD" : "KES"}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{kesPriced ? kesLabel : usdLabel}</p>
      <p className="text-xs text-muted">About {kesPriced ? usdLabel : kesLabel} at checkout</p>

      {paystackOn && (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-surface/70 p-1">
          <button
            type="button"
            onClick={() => setCurrency("KES")}
            className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${currency === "KES" ? "bg-accent text-background" : "text-muted"}`}
          >
            KES · M-Pesa & card
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${currency === "USD" ? "bg-accent text-background" : "text-muted"}`}
          >
            USD · card
          </button>
        </div>
      )}

      <label className="mt-3 block text-xs text-muted" htmlFor={`pay-email-${tierId}`}>
        Email for the receipt
      </label>
      <input
        id={`pay-email-${tierId}`}
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
      />

      {paystackOn && (
        <>
      <button
            type="button"
            onClick={() => void checkoutPaystack()}
            disabled={!!loading || !email.trim()}
            className={`mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-60 ${primary}`}
          >
            {loading === "paystack" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {text} · Paystack
          </button>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {currency === "KES"
              ? `${kesLabel} via M-Pesa or card.`
              : `${usdLabel} on an international card, when the Paystack account allows USD.`}
          </p>
        </>
      )}

      {!showBank ? (
        <button
          type="button"
          onClick={() => setShowBank(true)}
          className="price-btn price-btn-secondary mt-3"
        >
          <Building2 className="h-4 w-4" />
          Pay by bank transfer / invoice
        </button>
      ) : (
        <div className="mt-2 space-y-2 rounded-xl bg-surface/70 p-3">
          <label className="block text-xs text-muted" htmlFor={`pay-name-${tierId}`}>
            Name
          </label>
          <input
            id={`pay-name-${tierId}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm"
          />
          <label className="block text-xs text-muted" htmlFor={`pay-note-${tierId}`}>
            Note (optional)
          </label>
          <textarea
            id={`pay-note-${tierId}`}
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm"
          />
          <label className="block text-xs text-muted" htmlFor={`pay-care-${tierId}`}>
            Add a care plan (optional)
          </label>
          <select
            id={`pay-care-${tierId}`}
            value={carePlan}
            onChange={(event) => setCarePlan(event.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm"
          >
            <option value="">No care plan</option>
            {carePlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · {formatUsd(plan.monthlyUsd)}/month
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={annual} onChange={(event) => setAnnual(event.target.checked)} />
            Bill yearly and save {siteConfig.automationCatalog.annualDiscountPercent}%
          </label>
          <button
            type="button"
            onClick={() => void requestInvoice()}
            disabled={!!loading || !name.trim() || !email.trim()}
            className="price-btn price-btn-primary"
          >
            {loading === "bank" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Request invoice · {usdLabel}
          </button>
        </div>
      )}

      {message && (
        <div className="mt-2 rounded-xl bg-surface/80 px-3 py-2 text-xs leading-relaxed text-muted">
          <p>{message}</p>
          {renderFallbackLinks()}
        </div>
      )}
    </div>
  );
}
