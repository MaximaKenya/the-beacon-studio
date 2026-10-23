import { normalizeKenyanPhone } from "@/lib/automations/phone";

export type InputRow = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  amountKes?: number;
  date?: string;
  note?: string;
  qty?: number;
  reorderAt?: number;
  kind?: string;
};

export type InputColumn = keyof Omit<InputRow, "id">;

const HEADERS: InputColumn[] = ["name", "email", "phone", "amountKes", "date", "note", "qty", "reorderAt", "kind"];

export function csvTemplate(columns: string[]): string {
  const header = columns.length ? columns : ["name", "email", "phone"];
  return `${header.join(",")}\n`;
}

function cell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function entriesToCsv(rows: InputRow[], columns: string[]): string {
  const cols = (columns.length ? columns : HEADERS) as InputColumn[];
  const lines = [cols.join(",")];
  for (const row of rows) {
    lines.push(cols.map((column) => cell(row[column])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted && char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function csvToEntries(csv: string, columns?: string[]): { rows: InputRow[]; errors: string[] } {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], errors: ["The file is empty."] };
  const header = splitCsvLine(lines[0]).map((part) => part.trim());
  const known = new Set<string>(HEADERS);
  const headerLooksReal = header.some((part) => known.has(part) || part.toLowerCase() === "amount");
  const cols = headerLooksReal
    ? header.map((part) => (part.toLowerCase() === "amount" ? "amountKes" : part))
    : columns && columns.length
      ? columns
      : ["name", "email", "phone", "amountKes", "date", "note"];
  const body = headerLooksReal ? lines.slice(1) : lines;
  const rows: InputRow[] = [];
  const errors: string[] = [];
  body.forEach((line, index) => {
    const parts = splitCsvLine(line);
    const row: InputRow = {};
    cols.forEach((column, cellIndex) => {
      const value = parts[cellIndex]?.trim() || "";
      if (!value) return;
      if (column === "amountKes" || column === "qty" || column === "reorderAt") {
        const number = Number(value.replace(/,/g, ""));
        if (!Number.isFinite(number)) {
          errors.push(`Row ${index + 1}: ${column} is not a number.`);
          return;
        }
        row[column] = number;
        return;
      }
      if (column === "name" || column === "email" || column === "phone" || column === "date" || column === "note" || column === "kind") {
        row[column] = value;
      }
    });
    const checked = validateInputRow(row, index + 1);
    errors.push(...checked.errors);
    if (checked.row.name || checked.row.email || checked.row.phone) rows.push(checked.row);
  });
  return { rows, errors };
}

export function validateInputRow(row: InputRow, line = 1): { row: InputRow; errors: string[] } {
  const errors: string[] = [];
  const next: InputRow = { ...row };
  if (next.email && !next.email.includes("@")) errors.push(`Row ${line}: email needs an @.`);
  if (next.phone) {
    const phone = normalizeKenyanPhone(next.phone);
    if (!phone) errors.push(`Row ${line}: phone should be a Kenyan number, like 07… or +254…`);
    else next.phone = phone;
  }
  if (next.amountKes !== undefined && next.amountKes < 0) errors.push(`Row ${line}: amount cannot be negative.`);
  if (next.date && Number.isNaN(Date.parse(next.date.length === 10 ? `${next.date}T00:00:00+03:00` : next.date))) {
    errors.push(`Row ${line}: date should be YYYY-MM-DD.`);
  }
  return { row: next, errors };
}

export function entryKey(row: InputRow): string {
  if (row.id) return row.id;
  return [row.name, row.email, row.phone, row.amountKes, row.date].map((part) => String(part ?? "").trim().toLowerCase()).join("|");
}
