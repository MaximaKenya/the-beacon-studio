import type { TrialStage } from "@/lib/automations/trial-sequence";

export type InstanceStatus = "pending_payment" | "active" | "paused";
export type BillingInterval = "monthly" | "annual";

export type AutomationStats = {
  runs: number;
  leads: number;
  messages: number;
  payments: number;
  reminders: number;
  lastRunAt?: string;
};

export type InstanceTrial = {
  start: string;
  endsAt: string;
  remindersSent: number[];
  endedAt?: string;
  paidUntil?: string;
  welcomed?: boolean;
  /** Trial-to-paid nurture stages already sent (see trial-sequence.ts). */
  stagesSent?: TrialStage[];
  /** Extra free days granted by a referral code. */
  referralBonusDays?: number;
};

export type AutomationNote = {
  id: string;
  at: string;
  author: "client" | "studio";
  text: string;
};

export type SandboxStepKind = "trigger" | "data" | "ai" | "preview" | "note";

export type SandboxStep = {
  id: string;
  kind: SandboxStepKind;
  title: string;
  detail: string;
};

export type SandboxRunView = {
  at: string;
  sentToMe: boolean;
  steps: SandboxStep[];
};

export type AutomationInstance = {
  id: string;
  templateId: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  businessName: string;
  clientId?: string;
  status: InstanceStatus;
  config: Record<string, unknown>;
  monthlyKes: number;
  monthlyUsd: number;
  setupFeeKes: number;
  billing: BillingInterval;
  periodEnd?: string;
  bundleId?: string;
  demo?: boolean;
  trial?: InstanceTrial;
  /** When the client last saved the inputs table. */
  inputsUpdatedAt?: string;
  lastRunView?: SandboxRunView;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  stats: AutomationStats;
  notes: AutomationNote[];
};

export type AutomationLog = {
  id: string;
  instanceId: string;
  at: string;
  level: "info" | "error";
  message: string;
};

export type AutomationJob = {
  id: string;
  instanceId: string;
  runAt: string;
  status: "due" | "running" | "done" | "cancelled";
  claimedAt?: string;
  kind: string;
  chargeId?: string;
  bookingId?: string;
  label?: string;
  step?: number;
  attempts?: number;
  failed?: boolean;
};

export type AutomationLead = {
  id: string;
  instanceId: string;
  at: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  qualified?: boolean;
  summary?: string;
  confidence?: "low" | "ok";
  readAt?: string;
};

export type AutomationCharge = {
  id: string;
  instanceId: string;
  name: string;
  email?: string;
  phone?: string;
  amountKes: number;
  dueDate?: string;
  note?: string;
  status: "unpaid" | "paid";
  payUrl?: string;
  reference?: string;
  remindersSent: number;
  paidAt?: string;
  entryKey?: string;
};

export type AutomationBooking = {
  id: string;
  instanceId: string;
  start: string;
  name: string;
  email?: string;
  phone?: string;
  note?: string;
  status: "confirmed" | "cancelled";
};

export type AutomationReview = {
  id: string;
  instanceId: string;
  at: string;
  name: string;
  email?: string;
  score: number;
  comment?: string;
};

export type AutomationDelivery = {
  id: string;
  instanceId: string;
  at: string;
  channel: "email" | "sms" | "whatsapp";
  status: "sent" | "failed" | "waiting";
  to: string;
  subject: string;
  text: string;
  note: string;
};

export type AdminLogEntry = {
  id: string;
  at: string;
  kind: "done" | "automated";
  title: string;
  detail: string;
};

export type AutomationOps = {
  tickLockedAt?: string;
  lastTickAt?: string;
  lastTickOk?: boolean;
  lastTickError?: string;
  lastDigestAt?: string;
};

export type AutomationDoc = {
  seeded: boolean;
  instances: AutomationInstance[];
  logs: AutomationLog[];
  jobs: AutomationJob[];
  leads: AutomationLead[];
  charges: AutomationCharge[];
  bookings: AutomationBooking[];
  reviews: AutomationReview[];
  deliveries: AutomationDelivery[];
  adminLog: AdminLogEntry[];
  ops: AutomationOps;
  /** Owner emails that opted out of trial nurture emails. Reminders and receipts still send. */
  trialOptOuts?: string[];
};

export function emptyDoc(): AutomationDoc {
  return {
    seeded: false,
    instances: [],
    logs: [],
    jobs: [],
    leads: [],
    charges: [],
    bookings: [],
    reviews: [],
    deliveries: [],
    adminLog: [],
    ops: {},
  };
}

/** Older documents omit the arrays added with the buffet product. */
export function normalizeDoc(doc: AutomationDoc): AutomationDoc {
  doc.instances ||= [];
  doc.logs ||= [];
  doc.jobs ||= [];
  doc.leads ||= [];
  doc.charges ||= [];
  doc.bookings ||= [];
  doc.reviews ||= [];
  doc.deliveries ||= [];
  doc.adminLog ||= [];
  doc.ops ||= {};
  return doc;
}
