import { randomBytes, randomUUID } from "crypto";
import { siteConfig } from "@/data/site";
import { brandedEmail } from "@/lib/email-html";
import { findClientByEmail, updateClient, upsertClient } from "@/lib/clients";
import { createPayment, listPayments } from "@/lib/payments";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { carePlanById, foundersLockActive, makeFoundersLock, type FoundersLock } from "@/lib/revenue-pricing";
import { REQUEST_LABEL, type ParsedRequest, type RevenueRequest } from "@/lib/revenue-requests-rules";
import { mutateJsonFile, readJsonFile } from "@/lib/storage";
import { kesFromUsd } from "@/lib/fx";
import { normalizeEmail } from "@/lib/validation";

const FILE = "revenue-requests.json";
const CARE_FILE = "care-subscriptions.json";

export type CareSubscription = {
  id: string;
  email: string;
  name: string;
  planId: string;
  planName: string;
  monthlyUsd: number;
  billing: "monthly" | "annual";
  status: "active" | "cancelled";
  startedAt: string;
  nextInvoiceAt: string;
  invoiceIds: string[];
};

export async function listRevenueRequests(): Promise<RevenueRequest[]> {
  const list = await readJsonFile<RevenueRequest[]>(FILE, []);
  return Array.isArray(list) ? list : [];
}

/** Saves a request, adds it to the lead inbox and mailbox, and emails admin when Resend is set. */
export async function saveRevenueRequest(input: ParsedRequest): Promise<RevenueRequest> {
  const entry: RevenueRequest = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: input.kind === "template" ? "done" : "new",
    ...input,
    ...(input.kind === "template" ? { downloadToken: randomBytes(24).toString("hex") } : {}),
  };
  await mutateJsonFile<RevenueRequest[]>(FILE, [], (list) => {
    const next = Array.isArray(list) ? list : [];
    next.unshift(entry);
    return next.slice(0, 5000);
  });

  const label = REQUEST_LABEL[entry.kind];
  const summary = [
    `${label}${entry.itemLabel ? `: ${entry.itemLabel}` : ""}`,
    entry.company && `Business: ${entry.company}`,
    entry.phone && `Phone: ${entry.phone}`,
    entry.message,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { captureLead } = await import("@/lib/leads");
    await captureLead(
      { kind: "revenue", sourceId: entry.id, source: entry.kind, name: entry.name, email: entry.email, phone: entry.phone, company: entry.company, message: summary },
      { ai: false },
    );
  } catch (error) {
    console.error("[revenue] lead", error instanceof Error ? error.message : "lead failed");
  }
  if (entry.kind !== "template") {
    try {
      const { recordSiteForm } = await import("@/lib/mailbox");
      await recordSiteForm({
        kind: "contact",
        sourceId: entry.id,
        name: entry.name,
        email: entry.email,
        phone: entry.phone,
        subject: `${label} — ${entry.company || entry.name}`,
        text: summary,
        confirmationSubject: `We got your request — ${siteConfig.brand.name}`,
      });
    } catch (error) {
      console.error("[revenue] mailbox", error instanceof Error ? error.message : "mailbox failed");
    }
    if (isResendConfigured()) {
      const mail = brandedEmail({ heading: `New ${label.toLowerCase()}`, greeting: "Hi,", bodyText: `${entry.name} <${entry.email}>\n${summary}\n\nOpen /admin › Revenue.` });
      await sendResendEmail({ to: process.env.ADMIN_EMAIL?.trim() || siteConfig.email, subject: `${label}: ${entry.company || entry.name}`, html: mail.html, text: mail.text }).catch(() => undefined);
    }
  }
  return entry;
}

export async function findTemplateDownload(token: string) {
  if (!/^[a-f0-9]{32,64}$/i.test(token)) return null;
  const list = await listRevenueRequests();
  return list.find((entry) => entry.kind === "template" && entry.downloadToken === token) ?? null;
}

export async function setRequestStatus(id: string, status: RevenueRequest["status"]) {
  let ok = false;
  await mutateJsonFile<RevenueRequest[]>(FILE, [], (list) => {
    const item = (list || []).find((entry) => entry.id === id);
    if (item) {
      item.status = status;
      ok = true;
    }
    return list || [];
  });
  return ok ? { ok: true, message: "Request updated." } : { ok: false, message: "Request not found." };
}

export async function listCareSubscriptions(): Promise<CareSubscription[]> {
  const list = await readJsonFile<CareSubscription[]>(CARE_FILE, []);
  return Array.isArray(list) ? list : [];
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

/** Issues the next care invoice as a pending bank payment. Paystack stays off. */
async function issueCareInvoice(sub: CareSubscription) {
  const months = sub.billing === "annual" ? 12 : 1;
  const { annualPrice } = await import("@/lib/revenue-pricing");
  const usd = sub.billing === "annual" ? annualPrice(sub.monthlyUsd).perYear : sub.monthlyUsd;
  const client = await findClientByEmail(sub.email);
  const lock = foundersLockActive(client?.foundersLock) ? client?.foundersLock : undefined;
  return createPayment({
    provider: "bank",
    status: "pending",
    mode: "invoice",
    tierId: sub.planId,
    tierName: `${sub.planName} · ${months === 12 ? "annual" : "monthly"} care plan`,
    amount: kesFromUsd(usd),
    currency: "KES",
    depositPercent: 100,
    payerEmail: sub.email,
    payerName: sub.name,
    note: [`Recurring care plan invoice. USD ${usd}.`, lock ? `Founders price lock until ${lock.until.slice(0, 10)}.` : ""].filter(Boolean).join(" "),
  });
}

export async function createCareSubscription(input: { email: string; name?: string; planId: string; billing?: string }) {
  const plan = carePlanById(input.planId);
  const email = normalizeEmail(input.email || "");
  if (!plan || !email.includes("@")) return { ok: false, message: "Pick a plan and a client email." };
  const now = new Date();
  const billing = input.billing === "annual" ? "annual" : "monthly";
  const sub: CareSubscription = {
    id: randomUUID(),
    email,
    name: input.name?.trim() || email,
    planId: plan.id,
    planName: plan.name,
    monthlyUsd: plan.monthlyUsd,
    billing,
    status: "active",
    startedAt: now.toISOString(),
    nextInvoiceAt: addMonths(now, billing === "annual" ? 12 : 1).toISOString(),
    invoiceIds: [],
  };
  await upsertClient({ email, name: sub.name });
  const payment = await issueCareInvoice(sub);
  sub.invoiceIds.push(payment.id);
  await mutateJsonFile<CareSubscription[]>(CARE_FILE, [], (list) => [sub, ...(Array.isArray(list) ? list : [])]);
  return { ok: true, message: `${plan.name} started. First invoice is in Invoices.`, invoiceId: payment.id };
}

/** Admin: issue the next invoice for a subscription and move its date on. */
export async function invoiceCareSubscription(id: string) {
  const list = await listCareSubscriptions();
  const sub = list.find((entry) => entry.id === id && entry.status === "active");
  if (!sub) return { ok: false, message: "Active care plan not found." };
  const payment = await issueCareInvoice(sub);
  await mutateJsonFile<CareSubscription[]>(CARE_FILE, [], (raw) =>
    (raw || []).map((entry) =>
      entry.id === id ? { ...entry, invoiceIds: [...entry.invoiceIds, payment.id], nextInvoiceAt: addMonths(new Date(entry.nextInvoiceAt), entry.billing === "annual" ? 12 : 1).toISOString() } : entry,
    ),
  );
  return { ok: true, message: "Invoice issued.", invoiceId: payment.id };
}

export async function cancelCareSubscription(id: string) {
  let ok = false;
  await mutateJsonFile<CareSubscription[]>(CARE_FILE, [], (raw) =>
    (raw || []).map((entry) => {
      if (entry.id !== id) return entry;
      ok = true;
      return { ...entry, status: "cancelled" as const };
    }),
  );
  return ok ? { ok: true, message: "Care plan cancelled. No new invoices." } : { ok: false, message: "Care plan not found." };
}

export async function setFoundersLock(email: string, on: boolean, note?: string) {
  const target = normalizeEmail(email || "");
  if (!target.includes("@")) return { ok: false, message: "Enter a client email." };
  const client = (await findClientByEmail(target)) || (await upsertClient({ email: target, name: target }));
  const lock: FoundersLock | undefined = on ? makeFoundersLock(new Date(), undefined, note) : undefined;
  await updateClient(client.id, { foundersLock: lock });
  return { ok: true, message: on ? `Price locked until ${lock!.until.slice(0, 10)}.` : "Founders lock removed." };
}

export async function foundersLockFor(email: string): Promise<FoundersLock | null> {
  const client = await findClientByEmail(email);
  return foundersLockActive(client?.foundersLock) ? client!.foundersLock! : null;
}

export async function openInvoiceCount() {
  const payments = await listPayments();
  return payments.filter((payment) => payment.status === "pending" && payment.mode === "invoice").length;
}
