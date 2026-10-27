import { mutateJsonFile, readJsonFile } from "@/lib/storage";
import { emptyState, withDefaults, type HubState } from "./state";

const FILE = "messaging-hub.json";

export async function loadHub(): Promise<HubState> {
  return withDefaults(await readJsonFile<HubState>(FILE, emptyState()));
}

export async function mutateHub<T>(fn: (s: HubState) => T | Promise<T>): Promise<T> {
  let out!: T;
  await mutateJsonFile<HubState>(FILE, emptyState(), async (raw) => {
    const s = withDefaults(raw);
    out = await fn(s);
    // Keep the document bounded.
    if (s.messages.length > 20_000) s.messages = s.messages.slice(-20_000);
    s.callbacks = s.callbacks.filter((c) => !c.done || Date.now() - new Date(c.nextAt).getTime() < 7 * 86_400_000).slice(-5_000);
    return s;
  });
  return out;
}
