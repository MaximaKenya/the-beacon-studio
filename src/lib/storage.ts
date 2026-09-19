import { mkdir, readFile, writeFile, access, rename, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

const DEFAULT_FILES: Record<string, unknown> = {
  "subscribers.json": [],
  "bookings.json": [],
  "intakes.json": [],
  "payments.json": [],
  "contacts.json": [],
  "clients.json": [],
  "projects.json": [],
  "messages.json": [],
  "quotations.json": [],
  "receipts.json": [],
  "portal-codes.json": [],
  "analytics.json": {
    events: [],
    reactions: [],
    updatedAt: new Date(0).toISOString(),
  },
};

/** Serialize writes per filename to avoid corrupt/partial JSON under concurrent POSTs. */
const writeQueues = new Map<string, Promise<void>>();

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function defaultContent(filename: string): string {
  const value = DEFAULT_FILES[filename] ?? {};
  return JSON.stringify(value, null, 2);
}

/** Ensures data/ exists and default JSON files are present with valid content. */
export async function ensureDataFiles(): Promise<void> {
  await ensureDataDir();
  for (const filename of Object.keys(DEFAULT_FILES)) {
    const filePath = path.join(DATA_DIR, filename);
    if (!(await fileExists(filePath))) {
      await writeFile(filePath, defaultContent(filename), "utf-8");
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Read a JSON data file. Empty, whitespace, or invalid JSON → return fallback
 * and rewrite a valid file so the next read is clean.
 */
export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureDataFiles();
  const filePath = path.join(DATA_DIR, filename);

  try {
    const raw = await readFile(filePath, "utf-8");
    const trimmed = raw.trim();
    if (!trimmed) {
      await atomicWrite(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const parsed = JSON.parse(trimmed) as T;
    // Guard against wrong root type (e.g. {} when [] expected)
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      await atomicWrite(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    if (
      isPlainObject(fallback) &&
      (Array.isArray(parsed) || typeof parsed !== "object" || parsed === null)
    ) {
      await atomicWrite(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    return parsed;
  } catch {
    try {
      await atomicWrite(filePath, JSON.stringify(fallback, null, 2));
    } catch {
      /* best effort repair */
    }
    return fallback;
  }
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const tmp = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`
  );
  try {
    await writeFile(tmp, content, "utf-8");
    await rename(tmp, filePath);
  } catch (err) {
    try {
      await unlink(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataFiles();
  const filePath = path.join(DATA_DIR, filename);
  const content = JSON.stringify(data, null, 2);

  const prev = writeQueues.get(filename) ?? Promise.resolve();
  const next = prev
    .catch(() => undefined)
    .then(async () => {
      await atomicWrite(filePath, content);
    });
  writeQueues.set(
    filename,
    next.finally(() => {
      if (writeQueues.get(filename) === next) writeQueues.delete(filename);
    })
  );
  await next;
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
