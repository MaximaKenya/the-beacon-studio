import { NextResponse } from "next/server";
import { bookingDepositEnabled, bookingDepositOffer, BOOKING_DEPOSIT_TIER } from "@/lib/booking-deposit";
import { readJsonFile } from "@/lib/storage";
import { initializePaystackCheckout } from "@/lib/paystack";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

type BookingRow = { id?: string; email?: string; name?: string };

/** Optional Paystack deposit for an existing booking. Off unless PAYSTACK_SECRET_KEY is set. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const offer = bookingDepositOffer();
  if (!bookingDepositEnabled() || !offer) {
    return NextResponse.json({
      enabled: false,
      message: "Card and M-Pesa deposits are off until Paystack is configured. The booking itself is free.",
    });
  }

  const { id } = await context.params;
  const bookings = await readJsonFile<BookingRow[]>("bookings.json", []);
  const booking = bookings.find((row) => row.id === id);
  if (!booking?.email) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  let tierId = offer.tierId;
  let currency: "KES" | "USD" = "KES";
  try {
    const body = (await request.json()) as { tierId?: unknown; currency?: unknown; email?: unknown };
    if (typeof body.tierId === "string" && body.tierId.trim()) tierId = body.tierId.trim();
    if (body.currency === "USD") currency = "USD";
    if (typeof body.email === "string" && isValidEmail(body.email) && normalizeEmail(body.email) !== normalizeEmail(booking.email)) {
      return NextResponse.json({ error: "That email does not match the booking." }, { status: 403 });
    }
  } catch {
    tierId = BOOKING_DEPOSIT_TIER;
  }

  const origin = new URL(request.url).origin;
  const result = await initializePaystackCheckout({
    tierId,
    mode: "deposit",
    currency,
    email: booking.email,
    ...(booking.name ? { name: booking.name } : {}),
    bookingId: id,
    app: "beacon",
    callbackUrl: `${origin}/api/paystack/callback`,
  });

  if (!result.ok) {
    return NextResponse.json({ enabled: true, message: result.message }, { status: result.status === 200 ? 200 : result.status });
  }

  return NextResponse.json({
    enabled: true,
    authorizationUrl: result.authorizationUrl,
    reference: result.reference,
  });
}
