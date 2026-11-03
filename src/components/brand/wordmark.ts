/** Wordmark lines. “Beacon Creek” reads as one line; no sub-line. */
export function wordmarkLines(name: string): { title: string; studio: string } {
  return { title: name, studio: "" };
}
