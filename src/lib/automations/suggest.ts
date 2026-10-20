import { groqText } from "@/lib/automations/groq";

export type SuggestedField = { key: string; label: string; type: string; required?: boolean };

const FALLBACK: SuggestedField[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "date", label: "Date", type: "date", required: true },
  { key: "note", label: "Note", type: "text" },
];

export async function suggestAutomationFields(description: string): Promise<{
  fields: SuggestedField[];
  message: string;
  recurrence: string;
  channel: string;
  metrics: string[];
}> {
  const fallback = {
    fields: /report|kpi|digest|summary/i.test(description)
      ? [
          { key: "leads", label: "Leads", type: "number" },
          { key: "payments", label: "Payments", type: "number" },
        ]
      : FALLBACK,
    message: /report|kpi|digest/i.test(description)
      ? "Report for {{name}}: {{note}}"
      : "Hi {{name}}, reminder about {{note}} on {{date}}.",
    recurrence: /daily/i.test(description) ? "daily" : /month/i.test(description) ? "monthly" : "weekly",
    channel: /whatsapp|sms/i.test(description) ? "whatsapp" : "email",
    metrics: ["leads", "payments", "messages", "runs"],
  };
  const raw = await groqText(
    `You design one automation for a small business. Reply with JSON only: {"fields":[{"key":"name","label":"Name","type":"text|number|date|select|recipients|message","required":true}],"message":"uses {{variables}}","recurrence":"daily|weekly|monthly","channel":"email|sms|whatsapp|both","metrics":["leads","payments","messages","runs"]}. Use only the description. Do not invent prices.`,
    description.slice(0, 1500)
  );
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as {
      fields?: SuggestedField[];
      message?: string;
      recurrence?: string;
      channel?: string;
      metrics?: string[];
    };
    return {
      fields: Array.isArray(parsed.fields) && parsed.fields.length ? parsed.fields.slice(0, 8) : fallback.fields,
      message: parsed.message || fallback.message,
      recurrence: parsed.recurrence || fallback.recurrence,
      channel: parsed.channel || fallback.channel,
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics : fallback.metrics,
    };
  } catch {
    return fallback;
  }
}
