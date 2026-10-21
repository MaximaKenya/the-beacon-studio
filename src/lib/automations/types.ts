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

export type AutomationDoc = {
  seeded: boolean;
  instances: AutomationInstance[];
  logs: AutomationLog[];
  jobs: AutomationJob[];
  leads: AutomationLead[];
  charges: AutomationCharge[];
  bookings: AutomationBooking[];
  reviews: AutomationReview[];
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
  };
}
