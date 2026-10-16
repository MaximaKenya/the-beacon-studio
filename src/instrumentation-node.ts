/** Node-only startup. Imported from instrumentation.ts behind a runtime check. */
export async function initNodeStorage(): Promise<void> {
  const phase = process.env.NEXT_PHASE;
  if (phase === "phase-production-build" || phase === "phase-export") return;
  if (!process.env.DATABASE_URL?.trim()) return;

  const { initStorage } = await import("@/lib/storage");
  try {
    await initStorage();
    console.log("[storage] Postgres schema ready (app_documents)");
  } catch (error) {
    console.error("[storage] Postgres schema init failed", error);
  }
}
