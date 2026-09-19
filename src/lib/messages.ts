import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

const FILE = "messages.json";

export type MessageSender = "client" | "admin";

export type ChatMessage = {
  id: string;
  at: string;
  sender: MessageSender;
  body: string;
  readByClient?: boolean;
  readByAdmin?: boolean;
};

export type MessageThread = {
  projectId: string;
  clientId: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export async function listThreads(): Promise<MessageThread[]> {
  return readJsonFile<MessageThread[]>(FILE, []);
}

export async function getThread(projectId: string): Promise<MessageThread | null> {
  const all = await listThreads();
  return all.find((t) => t.projectId === projectId) ?? null;
}

export async function ensureThread(
  projectId: string,
  clientId: string
): Promise<MessageThread> {
  const all = await listThreads();
  const existing = all.find((t) => t.projectId === projectId);
  if (existing) return existing;
  const thread: MessageThread = {
    projectId,
    clientId,
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  all.unshift(thread);
  await writeJsonFile(FILE, all);
  return thread;
}

export async function postMessage(input: {
  projectId: string;
  clientId: string;
  sender: MessageSender;
  body: string;
}): Promise<ChatMessage> {
  const all = await listThreads();
  let thread = all.find((t) => t.projectId === input.projectId);
  if (!thread) {
    thread = {
      projectId: input.projectId,
      clientId: input.clientId,
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    all.unshift(thread);
  }

  const msg: ChatMessage = {
    id: randomUUID(),
    at: new Date().toISOString(),
    sender: input.sender,
    body: input.body.trim(),
    readByClient: input.sender === "client",
    readByAdmin: input.sender === "admin",
  };

  thread.messages.push(msg);
  thread.updatedAt = msg.at;
  thread.clientId = input.clientId;

  await writeJsonFile(FILE, all);
  return msg;
}

export async function markThreadRead(
  projectId: string,
  side: "client" | "admin"
): Promise<void> {
  const all = await listThreads();
  const thread = all.find((t) => t.projectId === projectId);
  if (!thread) return;
  for (const m of thread.messages) {
    if (side === "client") m.readByClient = true;
    else m.readByAdmin = true;
  }
  await writeJsonFile(FILE, all);
}

export function unreadCount(thread: MessageThread, side: "client" | "admin"): number {
  return thread.messages.filter((m) =>
    side === "client" ? !m.readByClient && m.sender === "admin" : !m.readByAdmin && m.sender === "client"
  ).length;
}
