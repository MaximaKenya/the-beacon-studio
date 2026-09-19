import { NextResponse } from "next/server";
import { buildAssistantSystemPrompt } from "@/lib/assistant-context";
import { buildFallbackReply } from "@/lib/assistant-fallback";
import { getKnowledgeResponse, shouldUseOpenAI } from "@/lib/knowledge-base";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const OPENAI_TIMEOUT_MS = 10_000;

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal
): Promise<string | null> {
  const systemPrompt = buildAssistantSystemPrompt();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 400,
      temperature: 0.5,
    }),
    signal,
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const forceAI = body.forceAI === true;

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Invalid messages." }, { status: 400 });
    }

    const lastUser = messages[messages.length - 1].content;
    const local = getKnowledgeResponse(lastUser);

    if (!forceAI && local.confidence >= 0.55) {
      return NextResponse.json({ reply: local.reply, mode: "knowledge-base", confidence: local.confidence });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || (!forceAI && !shouldUseOpenAI(lastUser))) {
      return NextResponse.json({
        reply: local.confidence >= 0.25 ? local.reply : buildFallbackReply(messages),
        mode: "knowledge-base",
        confidence: local.confidence,
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    try {
      const reply = await callOpenAI(apiKey, messages, controller.signal);
      if (reply) {
        return NextResponse.json({ reply, mode: "openai" });
      }
    } catch {
      // fall through to knowledge base
    } finally {
      clearTimeout(timeoutId);
    }

    return NextResponse.json({
      reply: local.confidence >= 0.25 ? local.reply : buildFallbackReply(messages),
      mode: "fallback",
      confidence: local.confidence,
    });
  } catch {
    return NextResponse.json({ error: "Chat request failed." }, { status: 500 });
  }
}
