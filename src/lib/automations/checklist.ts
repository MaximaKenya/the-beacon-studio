import { templateById } from "@/automations/templates/public";

export type CheckItem = {
  id: string;
  label: string;
  done: boolean;
};

type ChecklistInstance = {
  templateId: string;
  status: string;
  slug: string;
  config: Record<string, unknown>;
};

function rows(config: Record<string, unknown>): unknown[] {
  return Array.isArray(config.entries) ? config.entries : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function shared(config: Record<string, unknown>, key: string): boolean {
  const bag = config.shared;
  if (!bag || typeof bag !== "object") return false;
  return Boolean((bag as Record<string, unknown>)[key]);
}

export function automationChecklist(instance: ChecklistInstance): CheckItem[] {
  const template = templateById(instance.templateId);
  const behavior = template?.behavior;
  const items: CheckItem[] = [];
  const entryCount = rows(instance.config).length;
  const hasCsv = Boolean(text(instance.config.csv));

  if (behavior === "payment-cycle") {
    items.push({ id: "ledger", label: "Add amounts, due dates, and contacts", done: entryCount > 0 || hasCsv });
  }
  if (behavior === "threshold-alert") {
    items.push({ id: "stock", label: "Add your stock levels", done: entryCount > 0 });
  }
  if (instance.templateId === "greetings") {
    items.push({ id: "dates", label: "Add birthday and greeting dates", done: entryCount > 0 });
  }
  if (instance.templateId === "staff-shifts") {
    items.push({ id: "shifts", label: "Add staff shifts", done: entryCount > 0 });
  }
  if (instance.templateId === "doc-expiry") {
    items.push({ id: "docs", label: "Add document expiry dates", done: entryCount > 0 });
  }
  if (instance.templateId === "clinic-recall") {
    items.push({ id: "recall", label: "Add patients and last-visit dates", done: entryCount > 0 });
  }
  if (behavior === "custom-reminder") {
    items.push({
      id: "list",
      label: "Add your reminder list",
      done: entryCount > 0 || Boolean(text(instance.config.recipients)),
    });
  }
  if (behavior === "booking") {
    items.push({
      id: "services",
      label: "Set your days and hours",
      done: Boolean(text(instance.config.start) && text(instance.config.days)),
    });
    items.push({ id: "share-book", label: "Share your booking link", done: shared(instance.config, "book") });
  }
  if (template?.hook === "lead") {
    items.push({ id: "share-lead", label: "Share your lead form", done: shared(instance.config, "lead") });
  }
  if (behavior === "review") {
    items.push({ id: "share-review", label: "Share your review link", done: shared(instance.config, "review") });
  }
  if (behavior === "faq") {
    items.push({ id: "faq", label: "Add your FAQ content", done: text(instance.config.knowledge).length > 20 });
  }
  if (behavior === "inbox-triage") {
    items.push({ id: "inbox", label: "Paste an email or turn on forwarding", done: shared(instance.config, "inbox") });
  }
  if (behavior === "meeting-notes") {
    items.push({ id: "notes", label: "Paste meeting notes once", done: shared(instance.config, "notes") });
  }
  if (behavior === "digest" || behavior === "custom-report") {
    items.push({
      id: "report",
      label: "Confirm who receives the report",
      done: Boolean(text(instance.config.recipients) || text(instance.config.note) || text(instance.config.metrics as string)),
    });
  }
  if (items.length === 0) {
    items.push({ id: "live", label: "Automation is switched on", done: instance.status === "active" });
  }
  return items;
}

export function checklistProgress(items: CheckItem[]): number {
  if (items.length === 0) return 1;
  return items.filter((item) => item.done).length / items.length;
}
