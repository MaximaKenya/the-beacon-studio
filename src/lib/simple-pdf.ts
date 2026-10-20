function pdfEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLines(lines: string[], maxChars: number): string[] {
  const wrapped: string[] = [];
  for (const line of lines) {
    const ascii = line.replace(/[^\x20-\x7e]/g, "-");
    if (!ascii) {
      wrapped.push("");
      continue;
    }
    let rest = ascii;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(" ", maxChars);
      if (cut < 16) cut = maxChars;
      wrapped.push(rest.slice(0, cut).trimEnd());
      rest = rest.slice(cut).trimStart();
    }
    wrapped.push(rest);
  }
  return wrapped;
}

/** A small text-only PDF. No external fonts or keys. */
export function plainTextPdf(lines: string[]): Buffer {
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 14;
  const wrapped = wrapLines(lines, 86);
  const perPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];
  for (let index = 0; index < Math.max(wrapped.length, 1); index += perPage) {
    pages.push(wrapped.slice(index, index + perPage));
  }

  const objects: string[] = [];
  const pageIds: number[] = [];
  let nextId = 4;
  for (const pageLines of pages) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    const commands = ["BT", "/F1 11 Tf", `${margin} ${pageHeight - margin} Td`, `${lineHeight} TL`];
    pageLines.forEach((line, index) => {
      const shown = `(${pdfEscape(line)}) Tj`;
      commands.push(index === 0 ? shown : `T* ${shown}`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    objects.push(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R >> >> >> endobj\n`
    );
    objects.push(
      `${contentId} 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj\n`
    );
  }

  const header = "%PDF-1.4\n";
  const catalog = "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n";
  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  const pagesObj = `2 0 obj << /Type /Pages /Count ${pageIds.length} /Kids [${kids}] >> endobj\n`;
  const font = "3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n";
  const all = [catalog, pagesObj, font, ...objects];

  let offset = Buffer.byteLength(header);
  const offsets = [0];
  let body = header;
  for (const object of all) {
    offsets.push(offset);
    body += object;
    offset += Buffer.byteLength(object);
  }
  let xref = `xref\n0 ${all.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer << /Size ${all.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
  return Buffer.from(body + xref + trailer);
}
