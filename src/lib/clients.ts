import { randomUUID } from "crypto";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { normalizeEmail } from "@/lib/validation";

const FILE = "clients.json";

export type ClientRecord = {
  id: string;
  email: string;
  name: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
};

export async function listClients(): Promise<ClientRecord[]> {
  return readJsonFile<ClientRecord[]>(FILE, []);
}

export async function findClientByEmail(email: string): Promise<ClientRecord | null> {
  const all = await listClients();
  const e = normalizeEmail(email);
  return all.find((c) => c.email === e) ?? null;
}

export async function findClientById(id: string): Promise<ClientRecord | null> {
  const all = await listClients();
  return all.find((c) => c.id === id) ?? null;
}

export async function upsertClient(input: {
  email: string;
  name: string;
  company?: string;
  accessToken?: string;
}): Promise<ClientRecord> {
  const all = await listClients();
  const email = normalizeEmail(input.email);
  const existing = all.find((c) => c.email === email);
  const now = new Date().toISOString();

  if (existing) {
    const next: ClientRecord = {
      ...existing,
      name: input.name || existing.name,
      company: input.company ?? existing.company,
      accessToken: input.accessToken ?? existing.accessToken,
      updatedAt: now,
    };
    const idx = all.findIndex((c) => c.id === existing.id);
    all[idx] = next;
    await writeJsonFile(FILE, all);
    return next;
  }

  const created: ClientRecord = {
    id: randomUUID(),
    email,
    name: input.name,
    company: input.company,
    createdAt: now,
    updatedAt: now,
    accessToken: input.accessToken,
  };
  all.unshift(created);
  await writeJsonFile(FILE, all);
  return created;
}

export async function updateClient(
  id: string,
  patch: Partial<ClientRecord>
): Promise<ClientRecord | null> {
  const all = await listClients();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  await writeJsonFile(FILE, all);
  return all[idx];
}
