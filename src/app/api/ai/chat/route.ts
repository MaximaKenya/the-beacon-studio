import {
  beaconAiRateLimitText,
  beaconAiUnavailableText,
  beaconModelMessages,
  buildBeaconAiSystemPrompt,
  DEFAULT_GROQ_MODEL,
  GROQ_FALLBACK_MODEL,
  sanitizeBeaconMessages,
  type BeaconChatMessage,
} from "@/lib/beacon-ai";
import { saveBeaconLeadFromMessages } from "@/lib/beacon-lead";
import { attributionFromRecord } from "@/lib/attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 15;
const buckets = new Map<string, number[]>();

type SsePayload = {
  delta?: string;
  done?: boolean;
  fallback?: boolean;
  leadSaved?: boolean;
  error?: string;
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

function groqModel(): { model: string; explicit: boolean } {
  const configured = process.env.GROQ_MODEL?.trim();
  if (configured) return { model: configured, explicit: true };
  return { model: DEFAULT_GROQ_MODEL, explicit: false };
}

async function openGroq(
  model: string,
  messages: BeaconChatMessage[],
  signal: AbortSignal
): Promise<Response> {
  const maxTokens = model === GROQ_FALLBACK_MODEL ? 2048 : 700;
  return fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: buildBeaconAiSystemPrompt() }, ...messages],
      temperature: 0.4,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  });
}

function modelRejected(status: number, body: string): boolean {
  if (status !== 400 && status !== 404) return false;
  return /model|decommission|not found|does not exist|access/i.test(body);
}

async function streamGroq(
  response: Response,
  send: (payload: SsePayload) => void
): Promise<boolean> {
  if (!response.body) return false;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sent = false;

  const take = async (): Promise<boolean> => {
    const { done, value } = await reader.read();
    if (done) return false;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) {
          sent = true;
          send({ delta });
        }
      } catch {
        // Ignore keep-alives and partial JSON.
      }
    }
    return true;
  };

  while (await take()) {
    // Drain the Groq event stream.
  }
  return sent;
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

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      send({ delta: beaconAiUnavailableText(leadSaved), fallback: true });
      send({ done: true, fallback: true, leadSaved });
      return;
    }

    const { model, explicit } = groqModel();
    const history = beaconModelMessages(transcript);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    const fail = () => {
      send({ delta: beaconAiUnavailableText(leadSaved), fallback: true });
      send({ done: true, fallback: true, leadSaved });
    };

    try {
      let groq = await openGroq(model, history, controller.signal);
      if (!groq.ok) {
        const errText = await groq.text();
        console.error("Groq chat failed", groq.status, errText.slice(0, 400));
        if (!explicit && model !== GROQ_FALLBACK_MODEL && modelRejected(groq.status, errText)) {
          groq = await openGroq(GROQ_FALLBACK_MODEL, history, controller.signal);
          if (!groq.ok) {
            const retryText = await groq.text();
            console.error("Groq fallback model failed", groq.status, retryText.slice(0, 400));
            fail();
            return;
          }
        } else {
          fail();
          return;
        }
      }

      if (!groq.body) {
        fail();
        return;
      }

      const sent = await streamGroq(groq, send);
      if (!sent) {
        fail();
        return;
      }
      send({ done: true, fallback: false, leadSaved });
    } catch (error) {
      console.error("Groq chat error", error);
      send({ delta: beaconAiUnavailableText(leadSaved), fallback: true });
      send({ done: true, fallback: true, leadSaved });
    } finally {
      clearTimeout(timeout);
    }
  });
}
