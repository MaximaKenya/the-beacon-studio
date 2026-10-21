/**
 * Activate every buffet template once, run one due job, and fire its webhook
 * with a sample payload. Demo mode stores the run and does not email anyone.
 *
 *   npm run automations:run
 */
import { pricedTemplates } from "../src/automations/templates/public";
import { runEngine } from "../src/lib/automations/engine";
import { emptyDoc, type AutomationInstance } from "../src/lib/automations/types";

const samples: Record<string, Record<string, unknown>> = {
  lead: { name: "Amina", email: "demo@example.com", phone: "254700000001", message: "We need invoice reminders next month." },
  faq: { name: "Amina", email: "demo@example.com", message: "When do you reply?" },
  review: { name: "Amina", email: "demo@example.com", phone: "254700000001" },
  notes: { notes: "Agreed to start Monday. Max owns the checklist. Review on Friday." },
  inbox: { from: "amina@example.com", subject: "Refund", body: "I want a refund for last month." },
  rsvp: { name: "Amina", email: "demo@example.com", note: "yes" },
  intake: { name: "Amina", email: "demo@example.com", phone: "254700000001", message: "The kitchen tap is leaking." },
};

function instanceFor(templateId: string, config: Record<string, unknown>): AutomationInstance {
  const now = new Date().toISOString();
  return {
    id: `run-${templateId}`,
    templateId,
    slug: `run-${templateId}`,
    ownerName: "Launch check",
    ownerEmail: "demo@example.com",
    businessName: "Beacon demo",
    status: "active",
    config,
    monthlyKes: 0,
    monthlyUsd: 0,
    setupFeeKes: 0,
    billing: "monthly",
    demo: true,
    createdAt: now,
    updatedAt: now,
    stats: { runs: 0, leads: 0, messages: 0, payments: 0, reminders: 0 },
    notes: [],
  };
}

async function main() {
  const failures: string[] = [];
  const now = new Date("2026-10-21T06:00:00.000Z");
  const templates = pricedTemplates();
  for (const template of templates) {
    const doc = emptyDoc();
    const instance = instanceFor(template.id, structuredClone(template.demoConfig));
    doc.instances.push(instance);
    const activated = await runEngine({ doc, instance, mode: "activate", origin: "http://127.0.0.1:3000", now });
    if (!activated.ok) failures.push(`${template.id} activate: ${activated.message}`);
    const job = doc.jobs.find((item) => item.instanceId === instance.id && item.status === "due");
    if (job) {
      job.runAt = now.toISOString();
      const ran = await runEngine({ doc, instance, mode: "job", job, origin: "http://127.0.0.1:3000", now });
      if (!ran.ok) failures.push(`${template.id} ${job.kind}: ${ran.message}`);
    }
    if (template.hook !== "none") {
      const hooked = await runEngine({
        doc,
        instance,
        mode: "hook",
        body: samples[template.hook] || { name: "Amina", email: "demo@example.com", message: "Hello" },
        origin: "http://127.0.0.1:3000",
        now,
      });
      if (!hooked.ok) failures.push(`${template.id} hook: ${hooked.message}`);
    }
    const errors = doc.logs.filter((log) => log.level === "error");
    if (errors.length) failures.push(`${template.id} log: ${errors.map((log) => log.message).join("; ")}`);
    console.log(`${activated.ok ? "ok" : "fail"}  ${template.id}  jobs=${doc.jobs.length}  logs=${doc.logs.length}`);
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`Ran ${templates.length} templates.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
