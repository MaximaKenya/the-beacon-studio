export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initNodeStorage } = await import("./instrumentation-node");
    await initNodeStorage();
  }
}
