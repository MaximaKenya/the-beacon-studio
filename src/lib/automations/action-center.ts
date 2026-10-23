import { isPaystackConfigured } from "@/lib/paystack";
import { groqConfigured } from "@/lib/automations/groq";
import { trialDaysRemaining, type TrialState } from "@/lib/automations/trial";
import { tickHealth } from "@/lib/automations/tick-health";
import type { ChannelReadiness } from "@/lib/automations/channels";

export type ActionMenu = "now" | "trials" | "invoices" | "channels" | "scheduler" | "health" | "leads" | "later";

export type ActionItem = {
  id: string;
  menu: ActionMenu;
  priority: number;
  title: string;
  what: string;
  why: string;
  todo: string;
  count: number;
  blocking: boolean;
  actionLabel?: string;
  action?: string;
  steps?: string[];
};

type InstanceLike = {
  id: string;
  status: string;
  demo?: boolean;
  ownerEmail: string;
  businessName: string;
  trial?: TrialState;
  createdAt: string;
};

type ChargeLike = { id: string; status: string; instanceId: string };
type LeadLike = { id: string; at: string; readAt?: string; confidence?: string; instanceId: string };
type JobLike = { id: string; status: string; failed?: boolean; runAt: string; instanceId: string };
type PaymentLike = { id: string; status: string; tierId?: string; payerEmail?: string; automationInstanceIds?: string[] };

export function buildActionItems(input: {
  instances: InstanceLike[];
  charges: ChargeLike[];
  leads: LeadLike[];
  jobs: JobLike[];
  payments: PaymentLike[];
  channels: ChannelReadiness;
  waiting: number;
  lastTickAt?: string;
  now?: Date;
}): ActionItem[] {
  const now = input.now ?? new Date();
  const live = input.instances.filter((item) => !item.demo);
  const items: ActionItem[] = [];

  const fresh = live.filter((item) => {
    const age = now.getTime() - Date.parse(item.createdAt);
    return item.trial && age >= 0 && age < 48 * 60 * 60 * 1000;
  });
  if (fresh.length) {
    items.push({
      id: "signups",
      menu: "now",
      priority: 20,
      title: "New trials to review",
      what: `${fresh.length} signup${fresh.length === 1 ? "" : "s"} started a free month in the last two days.`,
      why: "A quick look catches a wrong business name or a setup that is still empty.",
      todo: "Open the client, read the setup, and extend the trial if they need more time.",
      count: fresh.length,
      blocking: true,
      actionLabel: "Review clients",
      action: "open-clients",
    });
  }

  const ending = live.filter((item) => {
    if (!item.trial || item.trial.endedAt || item.trial.paidUntil) return false;
    const days = trialDaysRemaining(item.trial.endsAt, now);
    return days > 0 && days <= 7;
  });
  if (ending.length) {
    items.push({
      id: "trials-ending",
      menu: "trials",
      priority: 10,
      title: "Trials ending soon",
      what: `${ending.length} automation${ending.length === 1 ? "" : "s"} leave the free month within 7 days.`,
      why: "They pause at the end unless you extend the trial or they have a paid period waiting.",
      todo: "Extend, send an invoice, or leave the reminder emails to go out on their own.",
      count: ending.length,
      blocking: true,
      actionLabel: "Open trials",
      action: "open-trials",
    });
  }

  const invoices = input.payments.filter(
    (payment) => payment.status === "pending" && (payment.tierId === "automation-bundle" || payment.automationInstanceIds?.length)
  );
  if (invoices.length) {
    items.push({
      id: "invoices",
      menu: "invoices",
      priority: 15,
      title: "Invoices awaiting payment",
      what: `${invoices.length} invoice${invoices.length === 1 ? "" : "s"} ${invoices.length === 1 ? "is" : "are"} still unpaid.`,
      why: "Marking one paid records the paid period from the end of the trial and keeps the automations on.",
      todo: "When the money arrives, mark the invoice paid. Paystack will do this itself once the key is set.",
      count: invoices.length,
      blocking: true,
      actionLabel: "Review invoices",
      action: "open-invoices",
    });
  }

  const failed = input.jobs.filter((job) => job.failed);
  if (failed.length) {
    items.push({
      id: "failed-runs",
      menu: "now",
      priority: 5,
      title: "Failed runs",
      what: `${failed.length} run${failed.length === 1 ? "" : "s"} failed three times and stopped.`,
      why: "Those customers did not get the message. A retry sends it once more.",
      todo: "Retry the failed runs. The tick already retries twice before they land here.",
      count: failed.length,
      blocking: true,
      actionLabel: "Retry failed runs",
      action: "retry-failed",
    });
  }

  if (input.channels.sms !== "ready") {
    items.push({
      id: "sms",
      menu: "channels",
      priority: 30,
      title: "SMS is not connected",
      what: "Africa's Talking credentials are missing, so SMS is queued.",
      why: "Phone-only customers stay waiting until AT_USERNAME and AT_API_KEY are set.",
      todo: "Add AT_USERNAME and AT_API_KEY on Heroku. The next tick sends the queue.",
      count: 1,
      blocking: true,
      steps: ["Set AT_USERNAME", "Set AT_API_KEY", "Optional: AT_SENDER_ID", "Wait for the next hourly tick"],
    });
  }
  if (input.channels.whatsapp !== "ready") {
    items.push({
      id: "whatsapp",
      menu: "channels",
      priority: 31,
      title: "WhatsApp is not connected",
      what: "WhatsApp Cloud API credentials are missing, so those messages are queued.",
      why: "Nothing is dropped. It waits until WHATSAPP_TOKEN and WHATSAPP_PHONE_ID exist.",
      todo: "Add the two WhatsApp variables. Queued messages leave on the next tick.",
      count: 1,
      blocking: true,
      steps: ["Set WHATSAPP_TOKEN", "Set WHATSAPP_PHONE_ID", "Set WHATSAPP_VERIFY_TOKEN for inbound"],
    });
  }
  if (input.waiting > 0 && (input.channels.sms !== "ready" || input.channels.whatsapp !== "ready")) {
    items.push({
      id: "waiting",
      menu: "channels",
      priority: 12,
      title: "Messages waiting on a channel",
      what: `${input.waiting} message${input.waiting === 1 ? "" : "s"} are marked waiting for SMS or WhatsApp.`,
      why: "The customer has a phone and the preferred channel is not connected yet.",
      todo: "Connect the channel. You do not need to resend these by hand.",
      count: input.waiting,
      blocking: true,
    });
  }

  const tick = tickHealth(input.lastTickAt, now);
  if (tick.warning) {
    items.push({
      id: "tick",
      menu: "scheduler",
      priority: 8,
      title: "Scheduler needs a look",
      what: tick.label,
      why: "Reminders, reports, and trial emails run from the hourly tick.",
      todo: "Confirm Heroku Scheduler still calls POST /api/automations/tick with CRON_SECRET.",
      count: 1,
      blocking: true,
      steps: ["Heroku Scheduler, hourly", "Command: curl -X POST -H \"Authorization: Bearer $CRON_SECRET\" https://thebeaconstudio.co.ke/api/automations/tick"],
    });
  }

  if (input.channels.groq !== "ready" || !groqConfigured()) {
    items.push({
      id: "groq",
      menu: "health",
      priority: 40,
      title: "Groq is off",
      what: "Drafts and lead replies use the saved text until GROQ_API_KEY is set.",
      why: "The automations still run. The writing is plainer.",
      todo: "Set GROQ_API_KEY when you want model drafts again.",
      count: 1,
      blocking: true,
    });
  }
  if (input.channels.email !== "ready") {
    items.push({
      id: "resend",
      menu: "health",
      priority: 6,
      title: "Email is off",
      what: "RESEND_API_KEY is not set, so client email is not leaving.",
      why: "Trials, reminders, and reports all depend on it.",
      todo: "Set RESEND_API_KEY and EMAIL_FROM.",
      count: 1,
      blocking: true,
    });
  }

  const unread = input.leads.filter((lead) => !lead.readAt);
  if (unread.length) {
    items.push({
      id: "unread-leads",
      menu: "leads",
      priority: 18,
      title: "Unread leads",
      what: `${unread.length} lead${unread.length === 1 ? "" : "s"} have not been marked read.`,
      why: "Someone wrote in through a hosted form, webhook, or inbox.",
      todo: "Read them in the client desk and mark them read when you have replied.",
      count: unread.length,
      blocking: true,
      actionLabel: "Open clients",
      action: "open-clients",
    });
  }
  const low = input.leads.filter((lead) => lead.confidence === "low" && !lead.readAt);
  if (low.length) {
    items.push({
      id: "low-confidence",
      menu: "leads",
      priority: 16,
      title: "Low-confidence AI replies",
      what: `${low.length} repl${low.length === 1 ? "y" : "ies"} fell back because the model was unsure or unconfigured.`,
      why: "The customer still got a safe reply. You may want to correct it.",
      todo: "Open the lead and send your own note if the draft is thin.",
      count: low.length,
      blocking: true,
    });
  }

  const paystackOn = isPaystackConfigured();
  items.push({
    id: "paystack",
    menu: "later",
    priority: 80,
    title: paystackOn ? "Paystack is connected" : "Paystack key is not set yet",
    what: paystackOn
      ? "Card checkout can run. Trials still start free, and a paid period begins at the end of the trial."
      : "Card checkout stays hidden. New clients get 30 days free and can request an invoice.",
    why: "The live Paystack account is waiting on business registration. Nothing here should block signups.",
    todo: "When the account is ready, set PAYSTACK_SECRET_KEY. Reference prefix stays BS and metadata.app stays beacon.",
    count: paystackOn ? 0 : 1,
    blocking: false,
    steps: [
      "Finish business registration",
      "Set PAYSTACK_SECRET_KEY",
      "Leave the reference prefix as BS",
      "A Heroku variable named PAYSTACK_FORWARD_CONFIRENT was flagged as a possible misspelling. The router reads PAYSTACK_FORWARD_CONFIRENT for ConfiRent. Confirm the live name before renaming anything. This screen does not change Heroku.",
    ],
  });

  void input.charges;
  return items.sort((a, b) => a.priority - b.priority);
}

export function actionBadge(items: ActionItem[], menu?: ActionMenu): number {
  return items.filter((item) => item.blocking && item.count > 0 && (!menu || item.menu === menu)).reduce((sum, item) => sum + item.count, 0);
}
