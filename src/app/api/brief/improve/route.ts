import { NextResponse } from "next/server";

export const runtime = "nodejs";

function improveLocally(brief: string, projectType?: string): string {
  const trimmed = brief.trim();
  const typeHint = projectType ? ` (project type: ${projectType})` : "";

  const goals =
    /goal|want|need|should|hoping/i.test(trimmed)
      ? ""
      : "\n• Goal: Clarify the primary outcome for the first release.";
  const users =
    /user|customer|student|member|client|visitor|audience/i.test(trimmed)
      ? ""
      : "\n• Audience: Who will use this first (and on what devices)?";
  const must =
    /must|need|require|critical|important/i.test(trimmed)
      ? ""
      : "\n• Must-haves: List 3 features that cannot wait for v2.";
  const success =
    /success|metric|kpi|measure|done when/i.test(trimmed)
      ? ""
      : "\n• Success looks like: How will we know the first version worked?";

  return `Improved brief${typeHint}:

${trimmed}

Clarifications to confirm with Beacon:${goals}${users}${must}${success}

Constraints & notes:
• Prefer mobile-first if users are in Kenya / East Africa.
• Call out payments (e.g. M-Pesa), languages, or offline needs if relevant.
• Links to examples or competitors help scope faster.`;
}

async function improveWithOpenAI(brief: string, projectType?: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You improve software project briefs for The Beacon Studio. Expand and clarify in plain English for SMEs, schools, churches, NGOs, and founders. Keep under 180 words. Structure: summary, audience, must-haves, success criteria. Do not invent fake company names or fake budgets.",
          },
          {
            role: "user",
            content: `Project type: ${projectType || "unspecified"}\n\nDraft brief:\n${brief}`,
          },
        ],
        max_tokens: 350,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief = typeof body.brief === "string" ? body.brief.trim() : "";
    const projectType = typeof body.projectType === "string" ? body.projectType : undefined;

    if (brief.length < 8) {
      return NextResponse.json(
        { error: "Add a bit more detail first (a sentence or two)." },
        { status: 400 }
      );
    }

    const ai = await improveWithOpenAI(brief, projectType);
    if (ai) {
      return NextResponse.json({ improved: ai, mode: "openai" });
    }

    return NextResponse.json({
      improved: improveLocally(brief, projectType),
      mode: "local",
    });
  } catch {
    return NextResponse.json({ error: "Could not improve brief." }, { status: 500 });
  }
}
