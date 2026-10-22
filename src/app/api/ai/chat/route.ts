import {
  beaconAiRateLimitText,
  beaconAiUnavailableText,
  beaconModelMessages,
  buildBeaconAiSystemPrompt,
  sanitizeBeaconMessages,
  type BeaconChatMessage,
} from "@/lib/beacon-ai";
import { saveBeaconLeadFromMessages } from "@/lib/beacon-lead";
import { attributionFromRecord } from "@/lib/attribution";
import {
  qualificationBrief,
  scriptedAssistantReply,
  upcomingAuditSlots,
  type OfferedSlot,
} from "@/lib/assistant-guide";
import { readJsonFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 15;
const buckets = new Map<string, number[]>();

type SsePayload = {
  delta?: string;
  done?: boolean;
  fallback?: boolean;
  leadSaved?: boolean;
  error?: string;
  slots?: OfferedSlot[];
  contact?: { name: string; email: string; phone: string };
};

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const recent = (buckets.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    buckets.set(ip, recent);
    return false;
  }
  recent.push(now);
  buckets.set(ip, recent);
  if (buckets.size > 2000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return true;
}

function sseResponse(sendAll: (send: (payload: SsePayload) => void) => Promise<void>, status = 200) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: SsePayload) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };
      try {
        await sendAll(send);
      } catch (error) {
        console.error("Beacon AI stream failed", error);
        send({ delta: beaconAiUnavailableText(false), fallback: true });
        send({ done: true, fallback: true, leadSaved: false });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

async function loadSlots(): Promise<OfferedSlot[]> {
  const bookings = await readJsonFile<Array<{ date?: string; time?: string; durationMinutes?: number }>>("bookings.json", []);
  return upcomingAuditSlots(
    bookings
      .filter((row) => row.date && row.time)
      .map((row) => ({
        date: row.date || "",
        time: row.time || "",
        ...(row.durationMinutes ? { durationMinutes: row.durationMinutes } : {}),
      }))
  );
}

async function streamOpenAI(
  response: Response,
  send: (payload: SsePayload) => void
): Promise<boolean> {
  if (!response.body) return false;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sent = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          sent = true;
          send({ delta });
        }
      } catch {
        // Ignore keep-alives.
      }
    }
  }
  return sent;
}

function sendScript(send: (payload: SsePayload) => void, messages: BeaconChatMessage[], slots: OfferedSlot[], leadSaved: boolean) {
  const reply = scriptedAssistantReply(messages, slots);
  send({
    delta: reply.text,
    fallback: true,
    slots: reply.offerSlots ? slots : [],
    contact: reply.contact,
  });
  send({
    done: true,
    fallback: true,
    leadSaved,
    slots: reply.offerSlots ? slots : [],
    contact: reply.contact,
  });
}

export async function POST(request: Request) {
  let messages: BeaconChatMessage[] | null = null;
  let attribution = attributionFromRecord({});
  try {
    const body = (await request.json()) as { messages?: unknown; attribution?: unknown };
    messages = sanitizeBeaconMessages(body.messages);
    if (body.attribution && typeof body.attribution === "object" && !Array.isArray(body.attribution)) {
      attribution = attributionFromRecord(body.attribution as Record<string, unknown>);
    }
  } catch {
    messages = null;
  }

  if (!messages) {
    return Response.json({ error: "Send a short message to continue." }, { status: 400 });
  }

  const transcript = messages;

  return sseResponse(async (send) => {
    if (!allowRequest(clientIp(request))) {
      send({ delta: beaconAiRateLimitText(), fallback: true });
      send({ done: true, fallback: true, leadSaved: false });
      return;
    }

    let leadSaved = false;
    try {
      const result = await saveBeaconLeadFromMessages(transcript, attribution);
      leadSaved = result === "created";
    } catch (error) {
      console.error("Beacon AI lead save failed", error);
    }

    const slots = await loadSlots().catch(() => [] as OfferedSlot[]);
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      sendScript(send, transcript, slots, leadSaved);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
          messages: [
            { role: "system", content: `${buildBeaconAiSystemPrompt()}\n\n${qualificationBrief(transcript, slots)}` },
            ...beaconModelMessages(transcript),
          ],
          temperature: 0.4,
          max_tokens: 400,
          stream: true,
        }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        console.error("OpenAI chat failed", response.status);
        sendScript(send, transcript, slots, leadSaved);
        return;
      }
      const sent = await streamOpenAI(response, send);
      if (!sent) {
        sendScript(send, transcript, slots, leadSaved);
        return;
      }
      const guide = scriptedAssistantReply(transcript, slots);
      send({
        done: true,
        fallback: false,
        leadSaved,
        slots: guide.offerSlots ? slots : [],
        contact: guide.contact,
      });
    } catch (error) {
      console.error("OpenAI chat error", error);
      sendScript(send, transcript, slots, leadSaved);
    } finally {
      clearTimeout(timeout);
    }
  });
}
