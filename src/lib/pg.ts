import pg from "pg";
import type { PoolConfig } from "pg";

/**
 * Postgres access for durable JSON documents.
 *
 * Heroku web dynos run one Node 22 process (`next start`). The pool stays
 * small (default 5) so a single dyno fits Neon free-tier connection limits.
 * Point DATABASE_URL at Neon's pooled host (the hostname contains `-pooler`)
 * and keep `sslmode=require` — TLS is required for every non-local host.
 */

type PgPool = InstanceType<typeof pg.Pool>;

const GLOBAL_KEY = "__beaconPgPool";
const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS app_documents (
    filename text PRIMARY KEY,
    data json NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  -- Client project progress lives in the projects.json document:
  -- status, milestones, percent complete, updates, notes, and dates.

  CREATE TABLE IF NOT EXISTS mail_threads (
    id text PRIMARY KEY,
    subject text NOT NULL,
    folder text NOT NULL,
    unread boolean NOT NULL DEFAULT true,
    participants jsonb NOT NULL DEFAULT '[]'::jsonb,
    preview text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    client_id text,
    client_name text,
    lead_id text,
    lead_kind text,
    summary text,
    suggested_reply text,
    tags jsonb NOT NULL DEFAULT '[]'::jsonb
  );
  CREATE TABLE IF NOT EXISTS mail_messages (
    id text PRIMARY KEY,
    thread_id text NOT NULL REFERENCES mail_threads(id) ON DELETE CASCADE,
    direction text NOT NULL,
    from_address text NOT NULL,
    to_addresses jsonb NOT NULL DEFAULT '[]'::jsonb,
    cc_addresses jsonb NOT NULL DEFAULT '[]'::jsonb,
    subject text NOT NULL,
    body_text text NOT NULL DEFAULT '',
    body_html text,
    created_at timestamptz NOT NULL,
    resend_id text,
    message_id text,
    in_reply_to text,
    references_header text,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb
  );
  CREATE UNIQUE INDEX IF NOT EXISTS mail_messages_resend_id_idx
    ON mail_messages (resend_id)
    WHERE resend_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS mail_messages_thread_idx
    ON mail_messages (thread_id, created_at);
  CREATE INDEX IF NOT EXISTS mail_threads_updated_idx
    ON mail_threads (updated_at DESC);
  ALTER TABLE mail_threads ADD COLUMN IF NOT EXISTS mailbox text;
  ALTER TABLE mail_threads ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT false;
  ALTER TABLE mail_threads ADD COLUMN IF NOT EXISTS previous_folder text;
`;

type GlobalWithPool = typeof globalThis & {
  [GLOBAL_KEY]?: PgPool;
};

const writeQueues = new Map<string, Promise<void>>();
let schemaReady: Promise<void> | null = null;

export function databaseUrl(): string | null {
  const url = process.env.DATABASE_URL?.trim();
  return url ? url : null;
}

export function usesPostgres(): boolean {
  return databaseUrl() !== null;
}

export type StorageBackendName = "postgres" | "file";

export function storageBackend(): StorageBackendName {
  return usesPostgres() ? "postgres" : "file";
}

function queryParam(connectionString: string, key: string): string | null {
  const match = connectionString.match(new RegExp(`[?&]${key}=([^&]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function stripParam(connectionString: string, key: string): string {
  return connectionString
    .replace(new RegExp(`([?&])${key}=[^&]*`, "g"), "$1")
    .replace(/\?&/g, "?")
    .replace(/&&/g, "&")
    .replace(/[?&]$/, "");
}

/** Host only — never user, password, or path. */
export function databaseHost(connectionString: string): string {
  const withoutProtocol = connectionString.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
  const at = withoutProtocol.lastIndexOf("@");
  const hostport = (at >= 0 ? withoutProtocol.slice(at + 1) : withoutProtocol).split("/")[0] ?? "";
  if (hostport.startsWith("[")) {
    const end = hostport.indexOf("]");
    return end >= 0 ? hostport.slice(1, end) : hostport;
  }
  return hostport.split(":")[0] ?? "";
}

function isLocalHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized === "" ||
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

function rejectUnauthorized(): boolean {
  const override = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED?.trim().toLowerCase();
  if (override === "false" || override === "0") return false;
  if (override === "true" || override === "1") return true;
  // Neon free tier certificates are publicly trusted. Verify them.
  // Set DATABASE_SSL_REJECT_UNAUTHORIZED=false only for a private CA.
  return true;
}

/**
 * TLS policy. Remote hosts (Neon, Heroku Postgres) always use SSL.
 * Local Postgres stays plaintext unless sslmode explicitly requires TLS,
 * so a VM or laptop database without certificates still works.
 */
export function resolveSsl(connectionString: string): PoolConfig["ssl"] {
  const sslmode = queryParam(connectionString, "sslmode");
  const local = isLocalHost(databaseHost(connectionString));

  if (sslmode === "disable") return false;
  if (
    local &&
    sslmode !== "require" &&
    sslmode !== "verify-ca" &&
    sslmode !== "verify-full"
  ) {
    return false;
  }

  return { rejectUnauthorized: rejectUnauthorized() };
}

/**
 * node-postgres applies `sslmode` itself, which can override the ssl option.
 * Neon URLs may also include `channel_binding`, which the driver rejects.
 * TLS is configured via the ssl option instead.
 */
export function connectionStringForPool(connectionString: string): string {
  return stripParam(stripParam(connectionString.trim(), "sslmode"), "channel_binding");
}

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return fallback;
  return value;
}

export function getPool(): PgPool {
  const g = globalThis as GlobalWithPool;
  if (g[GLOBAL_KEY]) return g[GLOBAL_KEY];

  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({
    connectionString: connectionStringForPool(url),
    ssl: resolveSsl(url),
    max: positiveInt("PG_POOL_MAX", 5),
    idleTimeoutMillis: positiveInt("PG_IDLE_TIMEOUT_MS", 20_000),
    connectionTimeoutMillis: positiveInt("PG_CONNECTION_TIMEOUT_MS", 10_000),
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
  });

  pool.on("error", (err: Error) => {
    console.error("[storage] idle postgres client error", err);
  });

  g[GLOBAL_KEY] = pool;
  return pool;
}

export async function closePool(): Promise<void> {
  const g = globalThis as GlobalWithPool;
  const pool = g[GLOBAL_KEY];
  if (!pool) return;
  delete g[GLOBAL_KEY];
  schemaReady = null;
  await pool.end();
}

/** Idempotent. Safe to call on every boot and on the first read or write. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((err: unknown) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

export async function pingDatabase(): Promise<boolean> {
  const result = await getPool().query<{ ok: number }>("SELECT 1 AS ok");
  return Number(result.rows[0]?.ok) === 1;
}

export async function readDocument(filename: string): Promise<unknown | undefined> {
  const result = await getPool().query<{ data: unknown }>(
    "SELECT data FROM app_documents WHERE filename = $1",
    [filename]
  );
  if (result.rowCount === 0) return undefined;
  return result.rows[0]?.data;
}

function enqueue<T>(filename: string, task: () => Promise<T>): Promise<T> {
  const prev = writeQueues.get(filename) ?? Promise.resolve();
  let result!: T;
  const next = prev.catch(() => undefined).then(async () => {
    result = await task();
  });
  writeQueues.set(
    filename,
    next.finally(() => {
      if (writeQueues.get(filename) === next) writeQueues.delete(filename);
    })
  );
  return next.then(() => result);
}

export async function writeDocument(filename: string, data: unknown): Promise<void> {
  const payload = JSON.stringify(data);
  if (typeof payload !== "string") {
    throw new Error(`Refusing to store non-JSON value for ${filename}`);
  }

  await enqueue(filename, async () => {
    await getPool().query(
      `INSERT INTO app_documents (filename, data, updated_at)
       VALUES ($1, $2::json, now())
       ON CONFLICT (filename) DO UPDATE
       SET data = EXCLUDED.data,
           updated_at = now()`,
      [filename, payload]
    );
  });
}

/**
 * Read-modify-write under a row lock. Overlapping ticks (hourly GitHub Actions
 * and the daily Vercel cron) cannot both claim the same reminder.
 */
export async function mutateDocument<T>(
  filename: string,
  fallback: T,
  mutate: (current: T) => T | Promise<T>
): Promise<T> {
  const seed = JSON.stringify(fallback);
  return enqueue(filename, async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO app_documents (filename, data, updated_at)
         VALUES ($1, $2::json, now())
         ON CONFLICT (filename) DO NOTHING`,
        [filename, seed]
      );
      const locked = await client.query<{ data: T }>(
        "SELECT data FROM app_documents WHERE filename = $1 FOR UPDATE",
        [filename]
      );
      const current = locked.rows[0]?.data ?? fallback;
      const result = await mutate(current);
      const payload = JSON.stringify(result);
      await client.query(
        "UPDATE app_documents SET data = $2::json, updated_at = now() WHERE filename = $1",
        [filename, payload]
      );
      await client.query("COMMIT");
      return result;
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {
        /* ignore */
      }
      throw err;
    } finally {
      client.release();
    }
  });
}
