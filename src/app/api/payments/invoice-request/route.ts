import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";
import { carePlanById } from "@/lib/revenue-pricing";
import { upsertClient } from "@/lib/clients";
import { recordSiteForm } from "@/lib/mailbox";
import { computeCheckoutAmount, createPayment } from "@/lib/payments";
import { parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { attributionFromRecord, attributionNote, type LeadAttribution } from "@/lib/attribution";

export const runtime = "nodejs";

type ContactSubmission = LeadAttribution & {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  message: string;
  topic?: string;
  source?: string;
  read?: boolean;
  status?: string;
};

/** Bank transfer / invoice fallback. Lands in admin payments, the lead inbox, and the mailbox. */
export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const tierId = typeof body.tierId === "string" ? body.tierId : "";
    const mode = body.mode === "invoice" ? "invoice" : "deposit";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const care = carePlanById(body.carePlan);
    const yearly = body.billing === "annual";
    const extras = [
      care ? `Care plan: ${care.name} ($${care.monthlyUsd}/month, recurring invoice).` : "",
      yearly ? `Billing: yearly (${siteConfig.automationCatalog.annualDiscountPercent}% off).` : "",
    ].filter(Boolean);
    const userNote = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : "";
    const note = [userNote, ...extras].filter(Boolean).join(" ");
    const projectId = typeof body.projectId === "string" ? body.projectId : undefined;

    if (!name || !isValidEmail(email)) {
      return NextResponse.json({ ok: false, message: "Name and a valid email are required." }, { status: 400 });
    }
    const computed = computeCheckoutAmount(tierId, mode);
    if (!computed) {
      return NextResponse.json({ ok: false, message: "This tier does not have an online price." }, { status: 400 });
    }

    const label = mode === "deposit" ? `${computed.depositPercent}% deposit` : "invoice";
    const summary = [
      `${name} requested a bank transfer / invoice for ${computed.tier.name} (${label}).`,
      `Amount: $${computed.amountMajor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD.`,
      note ? `Note: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const payment = await createPayment({
      provider: "bank",
      status: "pending",
      mode,
      tierId: computed.tier.id,
      tierName: computed.tier.name,
      amount: computed.amountMajor,
      currency: "USD",
      depositPercent: mode === "deposit" ? computed.depositPercent : 100,
      payerName: name,
      payerEmail: email,
      ...(note ? { note } : {}),
      ...(projectId ? { projectId } : {}),
      resultDesc: "Invoice request — bank transfer",
    });

    await upsertClient({ email, name });
    const contact: ContactSubmission = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      topic: "invoice",
      source: "invoice-request",
      ...attributionFromRecord(body),
      message: [summary, attributionNote(attributionFromRecord(body))].filter(Boolean).join("\n"),
      read: false,
      status: "new",
    };
    const contacts = await readJsonFile<ContactSubmission[]>("contacts.json", []);
    contacts.unshift(contact);
    await writeJsonFile("contacts.json", contacts);

    try {
      await recordSiteForm({
        kind: "contact",
        sourceId: contact.id,
        name,
        email,
        subject: `Invoice request — ${computed.tier.name}`,
        text: summary,
        confirmationSubject: `Invoice request received — ${siteConfig.brand.name}`,
      });
    } catch (error) {
      console.error("[invoice-request] mailbox", error instanceof Error ? error.message : "mailbox failed");
    }

    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      message: `Request received. We will email bank details and an invoice to ${email}.`,
      amount: computed.amountMajor,
      currency: "USD",
    });
  } catch (error) {
    console.error("[invoice-request]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, message: "Could not save the invoice request." }, { status: 500 });
  }
}
