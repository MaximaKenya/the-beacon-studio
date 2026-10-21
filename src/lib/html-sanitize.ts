const ALLOWED = new Set([
  "p",
  "br",
  "div",
  "span",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "hr",
  "img",
]);

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function safeUrl(value: string): string | null {
  const trimmed = value.trim().replace(/[\u0000-\u001f\s]+/g, "");
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) return null;
  if (lower.startsWith("https://") || lower.startsWith("http://") || lower.startsWith("mailto:")) return trimmed;
  return null;
}

function sanitizeAttrs(tag: string, raw: string): string {
  const attrs: string[] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw))) {
    const key = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (key.startsWith("on") || key === "style" || key === "srcset") continue;
    if (tag === "a" && key === "href") {
      const href = safeUrl(value);
      if (href) attrs.push(`href="${escapeAttr(href)}" rel="nofollow noopener noreferrer" target="_blank"`);
    }
    if (tag === "img" && key === "src") {
      const src = safeUrl(value);
      if (src) attrs.push(`src="${escapeAttr(src)}"`);
    }
    if (tag === "img" && key === "alt") attrs.push(`alt="${escapeAttr(value.slice(0, 180))}"`);
  }
  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

/** Keep a small set of formatting tags. Drop scripts, handlers, and unsafe URLs. */
export function sanitizeEmailHtml(input: string): string {
  let html = input.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|meta|link|base|svg|math|noscript)\b[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|meta|link|base|svg|math|noscript)\b[^>]*\/?>/gi, "");
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (whole, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED.has(name)) return "";
    if (whole.startsWith("</")) return `</${name}>`;
    const safe = sanitizeAttrs(name, attrs);
    if (name === "br" || name === "hr" || name === "img") return `<${name}${safe}>`;
    return `<${name}${safe}>`;
  });
  return html.trim();
}
