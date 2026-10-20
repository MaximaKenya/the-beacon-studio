import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { pricedTemplates } from "@/automations/templates/public";
import { emptyDoc, type AutomationDoc, type AutomationInstance, type AutomationLog } from "@/lib/automations/types";

const FILE = "automations.json";

export async function loadAutomations(): Promise<AutomationDoc> {
  const doc = await readJsonFile<AutomationDoc>(FILE, emptyDoc());
  if (!doc.seeded) {
    seedDemos(doc);
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

function seedDemos(doc: AutomationDoc) {
  const now = new Date().toISOString();
  for (const template of pricedTemplates()) {
    const id = `demo-${template.id}`;
    if (doc.instances.some((item) => item.id === id)) continue;
    const instance: AutomationInstance = {
      id,
      templateId: template.id,
      slug: id,
      ownerName: "Demo preview",
      ownerEmail: "demo@example.com",
      businessName: "Beacon demo",
      status: "active",
      config: template.demoConfig,
      monthlyKes: template.priceKes,
      monthlyUsd: template.priceUsd,
      setupFeeKes: 0,
      billing: "monthly",
      demo: true,
      createdAt: now,
      updatedAt: now,
      activatedAt: now,
      stats: { runs: 1, leads: 0, messages: 0, payments: 0, reminders: 0, lastRunAt: now },
      notes: [],
    };
    doc.instances.push(instance);
    addLog(doc, id, `Demo ${template.name} is ready for preview. Runs stay on this log and do not email anyone.`);
  }
}

export function instancesForEmail(doc: AutomationDoc, email: string): AutomationInstance[] {
  const normalized = email.trim().toLowerCase();
  return doc.instances.filter((item) => item.ownerEmail === normalized && !item.demo);
}
