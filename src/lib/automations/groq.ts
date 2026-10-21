import { DEFAULT_GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/beacon-ai";
import { traceStep } from "@/lib/automations/trace";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

async function complete(model: string, system: string, user: string): Promise<string | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user.slice(0, 8000) },
      ],
    }),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function groqText(system: string, user: string): Promise<string | null> {
  if (!groqConfigured()) {
    traceStep({
      kind: "ai",
      title: "AI output",
      detail: "GROQ_API_KEY is not set, so this step used the saved text instead of a model.",
    });
    return null;
  }
  const preferred = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const first = await complete(preferred, system, user);
  const text = first || (preferred === GROQ_FALLBACK_MODEL ? null : await complete(GROQ_FALLBACK_MODEL, system, user));
  traceStep({
    kind: "ai",
    title: "AI output",
    detail: text || "The model returned nothing, so this step used the saved text.",
  });
  return text;
}
