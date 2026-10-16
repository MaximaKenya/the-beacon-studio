/**
 * Import data/*.json into Postgres.
 *
 * Usage (DATABASE_URL required; .env.local is loaded when the var is unset):
 *   npm run db:migrate-files
 *
 * Re-running upserts each file. Existing rows with the same filename are replaced
 * with the JSON on disk.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  closePool,
  databaseHost,
  databaseUrl,
  ensureSchema,
  writeDocument,
} from "../src/lib/pg";

async function loadEnvFiles() {
  for (const name of [".env", ".env.local"]) {
    let text: string;
    try {
      text = await readFile(path.join(process.cwd(), name), "utf8");
    } catch {
      continue;
    }
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

async function main() {
  await loadEnvFiles();

  const url = databaseUrl();
  if (!url) {
    console.error("DATABASE_URL is not set. Export it or add it to .env.local.");
    process.exit(1);
  }

  const dataDir = path.join(process.cwd(), "data");
  let names: string[];
  try {
    names = await readdir(dataDir);
  } catch {
    console.error(`No data directory at ${dataDir}`);
    process.exit(1);
  }

  const files = names.filter((name) => name.endsWith(".json") && !name.startsWith(".")).sort();
  if (files.length === 0) {
    console.log(`No JSON files in ${dataDir}`);
    process.exit(0);
  }

  console.log(
    `Importing ${files.length} file(s) into Postgres host ${databaseHost(url) || "(socket)"}`
  );

  try {
    await ensureSchema();
  } catch (err) {
    console.error("Could not prepare the app_documents table.");
    console.error(err instanceof Error ? err.message : err);
    await closePool();
    process.exit(1);
  }

  let imported = 0;
  let failed = 0;

  for (const filename of files) {
    try {
      const raw = await readFile(path.join(dataDir, filename), "utf8");
      const data: unknown = JSON.parse(raw);
      await writeDocument(filename, data);
      const detail = Array.isArray(data) ? `${data.length} rows` : "object";
      console.log(`  imported ${filename} (${detail})`);
      imported += 1;
    } catch (err) {
      failed += 1;
      console.error(`  failed ${filename}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  await closePool();
  console.log(`Done. ${imported} imported, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
