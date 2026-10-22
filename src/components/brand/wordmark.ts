/** Split “The Beacon Studio” into the stacked lockup lines. */
export function wordmarkLines(name: string): { title: string; studio: string } {
  const studio = "Studio";
  const suffix = ` ${studio}`;
  if (name.endsWith(suffix) && name.length > suffix.length) {
    return { title: name.slice(0, -suffix.length), studio };
  }
  return { title: name, studio: "" };
}
