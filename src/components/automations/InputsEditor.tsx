"use client";

import { useMemo, useState } from "react";
import type { EntryColumn } from "@/automations/templates/public";
import { csvTemplate, csvToEntries, entriesToCsv, validateInputRow, type InputRow } from "@/lib/automations/inputs";

const LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  amountKes: "Amount KES",
  date: "Date",
  note: "Note",
  qty: "Qty",
  reorderAt: "Reorder at",
  kind: "Kind",
};

export function InputsEditor({
  columns,
  rows,
  updatedAt,
  busy,
  onSave,
}: {
  columns: EntryColumn[];
  rows: InputRow[];
  updatedAt?: string;
  busy: boolean;
  onSave: (rows: InputRow[]) => void;
}) {
  const [draft, setDraft] = useState<InputRow[]>(rows);
  const [errors, setErrors] = useState<string[]>([]);
  const template = useMemo(() => csvTemplate(columns), [columns]);

  function update(index: number, key: string, value: string) {
    setDraft((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) return row;
        if (key === "amountKes" || key === "qty" || key === "reorderAt") {
          return { ...row, [key]: value === "" ? undefined : Number(value) };
        }
        return { ...row, [key]: value };
      })
    );
  }

  function save(next = draft) {
    const checked = next.map((row, index) => validateInputRow(row, index + 1));
    const problems = checked.flatMap((item) => item.errors);
    setErrors(problems);
    if (problems.length) return;
    onSave(checked.map((item) => item.row));
  }

  function onFile(file: File) {
    void file.text().then((csv) => {
      const parsed = csvToEntries(csv, columns);
      setErrors(parsed.errors);
      if (parsed.rows.length) {
        setDraft(parsed.rows);
        if (parsed.errors.length === 0) save(parsed.rows);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">Inputs</h3>
        <p className="text-xs text-muted">{updatedAt ? `Last updated ${updatedAt}` : "Not saved yet"}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-xs text-muted">
              {columns.map((column) => (
                <th key={column} className="px-1 py-1 font-medium">
                  {LABELS[column] || column}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {draft.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((column) => (
                  <td key={column} className="px-1 py-1">
                    <input
                      value={row[column] === undefined ? "" : String(row[column])}
                      type={column === "date" ? "date" : column === "email" ? "email" : column === "amountKes" || column === "qty" || column === "reorderAt" ? "number" : "text"}
                      onChange={(event) => update(index, column, event.target.value)}
                      className="field h-9 w-full px-2 text-xs"
                    />
                  </td>
                ))}
                <td className="px-1">
                  <button type="button" className="text-xs text-muted" onClick={() => setDraft((current) => current.filter((_, rowIndex) => rowIndex !== index))}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {draft.length === 0 && <p className="text-sm text-muted">No rows yet. Add one, or upload a CSV.</p>}
      {errors.length > 0 && (
        <ul className="space-y-1 text-xs text-accent-warm">
          {errors.slice(0, 6).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="admin-btn" onClick={() => setDraft((current) => [...current, { id: crypto.randomUUID() }])}>
          Add row
        </button>
        <button type="button" className="admin-btn" disabled={busy} onClick={() => save()}>
          Save inputs
        </button>
        <a className="admin-btn" href={`data:text/csv,${encodeURIComponent(template)}`} download="beacon-inputs-template.csv">
          CSV template
        </a>
        <a
          className="admin-btn"
          href={`data:text/csv,${encodeURIComponent(entriesToCsv(draft, columns))}`}
          download="beacon-inputs.csv"
        >
          Download CSV
        </a>
        <label className="admin-btn cursor-pointer">
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>
      </div>
    </div>
  );
}
