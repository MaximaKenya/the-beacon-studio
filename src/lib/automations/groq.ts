import { DEFAULT_GROQ_MODEL, GROQ_FALLBACK_MODEL } from "@/lib/beacon-ai";

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
  if (!groqConfigured()) return null;
  const preferred = process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const first = await complete(preferred, system, user);
  if (first) return first;
  if (preferred === GROQ_FALLBACK_MODEL) return null;
  return complete(GROQ_FALLBACK_MODEL, system, user);
}
