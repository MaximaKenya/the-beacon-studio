import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { emptyDoc, normalizeDoc, type AutomationDoc, type AutomationInstance, type AutomationLog } from "@/lib/automations/types";

const FILE = "automations.json";

export async function loadAutomations(): Promise<AutomationDoc> {
  const doc = normalizeDoc(await readJsonFile<AutomationDoc>(FILE, emptyDoc()));
  const { syncSandbox } = await import("@/lib/automations/sandbox");
  const changed = await syncSandbox(doc);
  if (!doc.seeded || changed) {
    doc.seeded = true;
    await writeJsonFile(FILE, doc);
  }
  return doc;
}

export async function saveAutomations(doc: AutomationDoc): Promise<void> {
  doc.logs = doc.logs.slice(-800);
  doc.leads = doc.leads.slice(-2000);
  doc.deliveries = (doc.deliveries || []).slice(-2000);
  doc.adminLog = (doc.adminLog || []).slice(-400);
  await writeJsonFile(FILE, normalizeDoc(doc));
}

export function addAdminLog(doc: AutomationDoc, kind: "done" | "automated", title: string, detail: string) {
  doc.adminLog = doc.adminLog || [];
  doc.adminLog.push({
    id: randomUUID(),
    at: new Date().toISOString(),
    kind,
    title: title.slice(0, 140),
    detail: detail.slice(0, 500),
  });
}

export function addLog(doc: AutomationDoc, instanceId: string, message: string, level: AutomationLog["level"] = "info") {
  doc.logs.push({
    id: randomUUID(),
    instanceId,
    at: new Date().toISOString(),
    level,
    message: message.slice(0, 500),
  });
}

export function instancesForEmail(doc: AutomationDoc, email: string, includeDemo = false): AutomationInstance[] {
  const normalized = email.trim().toLowerCase();
  return doc.instances.filter((item) => item.ownerEmail === normalized && (includeDemo || !item.demo));
}
