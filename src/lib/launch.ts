/** Values that must not ship as if they were real contact details. */
export function isPlaceholderContact(value: string | undefined | null): boolean {
  if (!value) return true;
  const text = value.trim().toLowerCase();
  return (
    text.includes("example.com") ||
    text.includes("example.org") ||
    text.includes("yourusername") ||
    text.includes("dqw4w9wgxcq") ||
    text === "@yourusername"
  );
}
