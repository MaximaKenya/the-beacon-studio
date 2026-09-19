import { getKnowledgeResponse } from "@/lib/knowledge-base";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function buildFallbackReply(messages: ChatMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return getKnowledgeResponse("").reply;
  return getKnowledgeResponse(lastUser.content).reply;
}

/** @deprecated Use getKnowledgeResponse from knowledge-base.ts */
export function getFallbackResponse(userMessage: string): string {
  return getKnowledgeResponse(userMessage).reply;
}
