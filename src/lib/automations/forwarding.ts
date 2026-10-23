export type ForwardKind = "inbox" | "notes";

export function forwardingAddress(slug: string, kind: ForwardKind): string {
  return `${kind}+${slug}@thebeaconstudio.co.ke`;
}

export function forwardingTargets(to: unknown): { kind: ForwardKind; slug: string }[] {
  const list = Array.isArray(to) ? to : to ? [to] : [];
  const found: { kind: ForwardKind; slug: string }[] = [];
  for (const item of list) {
    const text = typeof item === "string" ? item : "";
    const match = /(inbox|notes)\+([a-z0-9-]+)@/i.exec(text);
    if (!match) continue;
    const kind = match[1].toLowerCase() === "notes" ? "notes" : "inbox";
    found.push({ kind, slug: match[2].toLowerCase() });
  }
  return found;
}
