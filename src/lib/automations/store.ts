import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { emptyDoc, type AutomationDoc, type AutomationInstance, type AutomationLog } from "@/lib/automations/types";

const FILE = "automations.json";

export async function loadAutomations(): Promise<AutomationDoc> {
  const doc = await readJsonFile<AutomationDoc>(FILE, emptyDoc());
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
  await writeJsonFile(FILE, doc);
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

export function instancesForEmail(doc: AutomationDoc, email: string): AutomationInstance[] {
  const normalized = email.trim().toLowerCase();
  return doc.instances.filter((item) => item.ownerEmail === normalized && !item.demo);
}
