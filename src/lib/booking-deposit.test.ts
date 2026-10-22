import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingDepositEnabled,
  bookingDepositMetadata,
  bookingDepositOffer,
  bookingDepositReference,
} from "@/lib/booking-deposit";
import { routePaystackEvent } from "@/lib/paystack-router";

test("deposit stays off without PAYSTACK_SECRET_KEY", () => {
  const previous = process.env.PAYSTACK_SECRET_KEY;
  delete process.env.PAYSTACK_SECRET_KEY;
  assert.equal(bookingDepositEnabled(), false);
  assert.equal(bookingDepositOffer(), null);
  if (previous === undefined) delete process.env.PAYSTACK_SECRET_KEY;
  else process.env.PAYSTACK_SECRET_KEY = previous;
});

test("deposit uses the BS reference and metadata.app beacon", () => {
  const previous = process.env.PAYSTACK_SECRET_KEY;
  process.env.PAYSTACK_SECRET_KEY = "sk_test_beacon";
  const offer = bookingDepositOffer();
  assert.ok(offer);
  assert.equal(offer?.app, "beacon");
  assert.match(offer?.summary || "", /30%/);
  assert.match(offer?.summary || "", /\$/);
  const metadata = bookingDepositMetadata("booking-1", "pay-1");
  assert.equal(metadata.app, "beacon");
  assert.equal(metadata.bookingId, "booking-1");
  assert.equal(bookingDepositReference("pay-1"), "BS-pay-1");
  const routed = routePaystackEvent({
    data: { reference: "BS-pay-1", metadata: { app: "beacon" } },
  });
  assert.equal(routed?.route.local, true);
  assert.equal(routed?.route.prefix, "BS");
  if (previous === undefined) delete process.env.PAYSTACK_SECRET_KEY;
  else process.env.PAYSTACK_SECRET_KEY = previous;
});
