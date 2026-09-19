import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { addDaysIso, fileDateStamp, slugifyFilename } from "@/lib/time";
import { getDepositPercent, type PaymentRecord } from "@/lib/payments";
import { siteConfig } from "@/data/site";
import type { ProjectRecord } from "@/lib/projects";
import type { ClientRecord } from "@/lib/clients";

const QUOTES_FILE = "quotations.json";
const RECEIPTS_FILE = "receipts.json";

export type QuotationLineItem = {
  label: string;
  detail?: string;
  amountFrom?: number;
  amountTo?: number;
};

export type QuotationRecord = {
  id: string;
  projectId: string;
  clientId: string;
  intakeId?: string;
  createdAt: string;
  validUntil: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  scopeSummary: string;
  projectTypeLabel: string;
  budgetLabel: string;
  timelineLabel: string;
  lineItems: QuotationLineItem[];
  timelineEstimate: string;
  costFrom: number;
  costTo: number;
  depositPercent: number;
  depositAmount: number;
  currency: string;
  filename: string;
};

export type ReceiptRecord = {
  id: string;
  paymentId: string;
  projectId?: string;
  clientId?: string;
  createdAt: string;
  amountPaid: number;
  currency: string;
  method: string;
  reference: string;
  remainingBalance: number;
  totalQuoted?: number;
  clientName?: string;
  clientEmail?: string;
  tierName?: string;
  filename: string;
};

function budgetLabel(id: string) {
  return siteConfig.intake.budgets.find((b) => b.id === id)?.label ?? id;
}
function timelineLabel(id: string) {
  return siteConfig.intake.timelines.find((t) => t.id === id)?.label ?? id;
}
function typeLabel(id: string) {
  return siteConfig.intake.projectTypes.find((t) => t.id === id)?.label ?? id;
}

export async function listQuotations(): Promise<QuotationRecord[]> {
  return readJsonFile<QuotationRecord[]>(QUOTES_FILE, []);
}

export async function listReceipts(): Promise<ReceiptRecord[]> {
  return readJsonFile<ReceiptRecord[]>(RECEIPTS_FILE, []);
}

export async function findQuotationById(id: string): Promise<QuotationRecord | null> {
  const all = await listQuotations();
  return all.find((q) => q.id === id) ?? null;
}

export async function findQuotationByProject(
  projectId: string
): Promise<QuotationRecord | null> {
  const all = await listQuotations();
  return all.find((q) => q.projectId === projectId) ?? null;
}

export async function findReceiptById(id: string): Promise<ReceiptRecord | null> {
  const all = await listReceipts();
  return all.find((r) => r.id === id) ?? null;
}

export async function findReceiptsByProject(projectId: string): Promise<ReceiptRecord[]> {
  const all = await listReceipts();
  return all.filter((r) => r.projectId === projectId);
}

export async function createQuotation(input: {
  project: ProjectRecord;
  client: ClientRecord;
}): Promise<QuotationRecord> {
  const { project, client } = input;
  const depositPercent = project.depositPercent ?? getDepositPercent();
  const costFrom = project.costFrom ?? 800;
  const costTo = project.costTo ?? 3000;
  const depositAmount =
    project.depositAmount ?? Math.round(costFrom * (depositPercent / 100) * 100) / 100;
  const now = new Date();
  const id = randomUUID();
  const clientSlug = slugifyFilename(client.name);
  const dateStamp = fileDateStamp(now);

  const quote: QuotationRecord = {
    id,
    projectId: project.id,
    clientId: client.id,
    intakeId: project.intakeId,
    createdAt: now.toISOString(),
    validUntil: addDaysIso(14, now),
    clientName: client.name,
    clientEmail: client.email,
    clientCompany: client.company,
    scopeSummary: project.brief,
    projectTypeLabel: typeLabel(project.projectType),
    budgetLabel: budgetLabel(project.budget),
    timelineLabel: timelineLabel(project.timeline),
    lineItems: [
      {
        label: "Discovery & scope lock",
        detail: "Kickoff call, requirements, success criteria",
        amountFrom: Math.round(costFrom * 0.15),
        amountTo: Math.round(costTo * 0.15),
      },
      {
        label: "Design & architecture",
        detail: "UX flows, technical plan, milestone map",
        amountFrom: Math.round(costFrom * 0.25),
        amountTo: Math.round(costTo * 0.25),
      },
      {
        label: "Build & weekly demos",
        detail: "Implementation, QA, demos every week",
        amountFrom: Math.round(costFrom * 0.4),
        amountTo: Math.round(costTo * 0.4),
      },
      {
        label: "Launch & handoff",
        detail: "Deploy, docs, Loom walkthrough",
        amountFrom: Math.round(costFrom * 0.2),
        amountTo: Math.round(costTo * 0.2),
      },
    ],
    timelineEstimate: project.timeline
      ? timelineLabel(project.timeline)
      : "4–8 weeks typical",
    costFrom,
    costTo,
    depositPercent,
    depositAmount,
    currency: "USD",
    filename: `Beacon-Studio-Quotation-${clientSlug}-${dateStamp}.pdf`,
  };

  const all = await listQuotations();
  all.unshift(quote);
  await writeJsonFile(QUOTES_FILE, all);
  return quote;
}

export async function createReceiptFromPayment(input: {
  payment: PaymentRecord;
  project?: ProjectRecord | null;
  client?: ClientRecord | null;
}): Promise<ReceiptRecord> {
  const { payment, project, client } = input;
  const amountPaid =
    payment.provider === "stripe" ? payment.amount / 100 : payment.amount;
  const currency = payment.currency || "USD";
  const totalQuoted = project?.costFrom ?? amountPaid / 0.3;
  const remaining = Math.max(0, Math.round((totalQuoted - amountPaid) * 100) / 100);
  const ref =
    payment.receipt ||
    payment.checkoutRequestID ||
    payment.id.slice(0, 8).toUpperCase();
  const now = new Date();
  const dateStamp = fileDateStamp(now);

  const receipt: ReceiptRecord = {
    id: randomUUID(),
    paymentId: payment.id,
    projectId: project?.id,
    clientId: client?.id,
    createdAt: now.toISOString(),
    amountPaid,
    currency,
    method: payment.provider === "mpesa" ? "M-Pesa" : "Stripe",
    reference: ref,
    remainingBalance: remaining,
    totalQuoted,
    clientName: client?.name,
    clientEmail: client?.email,
    tierName: payment.tierName,
    filename: `Beacon-Studio-Receipt-${slugifyFilename(ref)}-${dateStamp}.pdf`,
  };

  const all = await listReceipts();
  // Avoid duplicate receipts for same payment
  if (all.some((r) => r.paymentId === payment.id)) {
    return all.find((r) => r.paymentId === payment.id)!;
  }
  all.unshift(receipt);
  await writeJsonFile(RECEIPTS_FILE, all);
  return receipt;
}
