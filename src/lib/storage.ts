import {
  ensureSchema,
  pingDatabase,
  mutateDocument,
  readDocument,
  storageBackend,
  usesPostgres,
  writeDocument,
} from "@/lib/pg";
import * as files from "@/lib/storage-file";

/**
 * Active store for contacts, intakes, bookings, projects (including reviews),
 * portal threads, the mailbox, and the other data/*.json documents.
 * DATABASE_URL set → Postgres. Unset → JSON files, which Heroku wipes on restart.
 * When Resend is configured, submissions and admin replies are also emailed.
 */
export type StorageBackend = "postgres" | "file";

export function getStorageBackend(): StorageBackend {
  return storageBackend();
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameRootShape(parsed: unknown, fallback: unknown): boolean {
  if (Array.isArray(fallback)) return Array.isArray(parsed);
  if (isPlainObject(fallback)) {
    return isPlainObject(parsed);
  }
  return true;
}

/**
 * Create the Postgres table when DATABASE_URL is set, or the local JSON
 * files when it is not. Called at server startup and before the first use.
 */
export async function initStorage(): Promise<void> {
  if (usesPostgres()) {
    await ensureSchema();
    return;
  }
  await files.ensureDataFiles();
}

/** Ensures the active backend is ready. File mode also creates default JSON files. */
export async function ensureDataFiles(): Promise<void> {
  await initStorage();
}

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  if (!usesPostgres()) {
    return files.readJsonFile(filename, fallback);
  }

  await ensureSchema();
  let parsed: unknown;
  try {
    parsed = await readDocument(filename);
  } catch (err) {
    console.error(`[storage] postgres read failed for ${filename}`, err);
    throw err;
  }

  if (parsed === undefined) return fallback;
  if (!sameRootShape(parsed, fallback)) {
    await writeDocument(filename, fallback);
    return fallback;
  }
  return parsed as T;
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  if (!usesPostgres()) {
    await files.writeJsonFile(filename, data);
    return;
  }
  await ensureSchema();
  await writeDocument(filename, data);
}

/** Locked read-modify-write. Use this when two ticks must not send the same email. */
export async function mutateJsonFile<T>(
  filename: string,
  fallback: T,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  if (!usesPostgres()) {
    return files.mutateJsonFile(filename, fallback, mutate);
  }
  await ensureSchema();
  return mutateDocument(filename, fallback, mutate);
}

export type StorageHealth = {
  ok: boolean;
  storage: StorageBackend;
  database: "up" | "down" | "unconfigured";
};

/** Which backend is active, and whether Postgres answers. */
export async function getStorageHealth(): Promise<StorageHealth> {
  if (!usesPostgres()) {
    return { ok: true, storage: "file", database: "unconfigured" };
  }
  try {
    await ensureSchema();
    const up = await pingDatabase();
    return {
      ok: up,
      storage: "postgres",
      database: up ? "up" : "down",
    };
  } catch (err) {
    console.error("[storage] postgres health check failed", err);
    return { ok: false, storage: "postgres", database: "down" };
  }
}

/**
 * Safely parse a Request JSON body. Empty / invalid body → fallback (default {}).
 */
export async function parseRequestJson<T extends Record<string, unknown> = Record<string, unknown>>(
  request: Request,
  fallback: T = {} as T
): Promise<T> {
  try {
    const text = await request.text();
    const trimmed = text.trim();
    if (!trimmed) return fallback;
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}
