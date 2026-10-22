"use client";

import { useEffect, useState } from "react";

type Offer = {
  tierId: string;
  summary: string;
};

export function BookingDepositOffer({ bookingId, email }: { bookingId: string; email: string }) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetch("/api/payments/options")
        .then((response) => response.json())
        .then((data: { bookingDeposit?: Offer | null }) => {
          if (data.bookingDeposit?.summary) setOffer(data.bookingDeposit);
        })
        .catch(() => setOffer(null));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  if (!offer) return null;

  async function pay() {
    if (!offer) return;
    setBusy(true);
    setNote("");
    try {
      const response = await fetch(`/api/bookings/${bookingId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tierId: offer.tierId, currency: "KES" }),
      });
      const data = (await response.json()) as { authorizationUrl?: string; message?: string; error?: string };
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      setNote(data.message || data.error || "Deposit checkout is not available.");
    } catch {
      setNote("Could not open Paystack. The booking is still saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sleek-card mt-6 rounded-3xl p-5 text-left">
      <p className="text-sm font-semibold text-heading">Optional deposit</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{offer.summary}</p>
      <button
        type="button"
        onClick={() => void pay()}
        disabled={busy}
        className="mt-4 inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background disabled:opacity-60"
      >
        {busy ? "Opening Paystack…" : "Pay deposit"}
      </button>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}
