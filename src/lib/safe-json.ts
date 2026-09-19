/**
 * Client-safe JSON helpers (no Node fs). Use in browser / shared code.
 */

export async function parseResponseJson<T>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    const trimmed = text.trim();
    if (!trimmed) return fallback;
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}
