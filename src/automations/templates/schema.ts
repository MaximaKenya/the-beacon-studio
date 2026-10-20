import { z } from "zod";
import { templateById, type SetupField } from "@/automations/templates/public";

const entrySchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    amountKes: z.coerce.number().optional(),
    date: z.string().optional(),
    note: z.string().optional(),
    qty: z.coerce.number().optional(),
    reorderAt: z.coerce.number().optional(),
    kind: z.string().optional(),
  })
  .passthrough();

function fieldSchema(field: SetupField): z.ZodTypeAny {
  switch (field.type) {
    case "number":
      return z.coerce.number();
    case "date":
      return z.string();
    case "entries":
      return z.array(entrySchema);
    case "metrics":
      return z.array(z.string());
    case "file":
    case "textarea":
    case "message":
    case "text":
    case "email":
    case "tel":
    case "url":
    case "select":
    case "recipients":
    case "recurrence":
    case "channel":
    default:
      return z.string();
  }
}

export function configSchema(templateId: string) {
  const template = templateById(templateId);
  const shape: Record<string, z.ZodTypeAny> = {
    customFields: z
      .array(
        z.object({
          key: z.string().min(1),
          label: z.string().min(1),
          type: z.string().min(1),
          required: z.boolean().optional(),
          options: z.array(z.string()).optional(),
        })
      )
      .optional(),
  };
  for (const field of template?.fields ?? []) {
    const base = fieldSchema(field);
    shape[field.key] = field.required ? base : base.optional();
  }
  return z.object(shape).passthrough();
}

export function parseTemplateConfig(
  templateId: string,
  input: unknown
): { ok: true; config: Record<string, unknown> } | { ok: false; message: string } {
  const template = templateById(templateId);
  if (!template) return { ok: false, message: "Unknown automation." };
  const parsed = configSchema(templateId).safeParse(input ?? {});
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue ? `${issue.path.join(".") || "config"}: ${issue.message}` : "Check the setup fields." };
  }
  const config = parsed.data as Record<string, unknown>;
  for (const field of template.fields) {
    if (!field.required) continue;
    const value = config[field.key];
    if (field.type === "entries") {
      const rows = Array.isArray(value) ? value.length : 0;
      const csv = typeof config.csv === "string" ? config.csv.trim() : "";
      if (rows === 0 && !csv) return { ok: false, message: `${field.label} is required.` };
      continue;
    }
    if (field.type === "metrics") {
      if (!Array.isArray(value) || value.length === 0) return { ok: false, message: `${field.label} is required.` };
      continue;
    }
    if (typeof value === "number") continue;
    if (typeof value !== "string" || !value.trim()) return { ok: false, message: `${field.label} is required.` };
  }
  return { ok: true, config };
}
