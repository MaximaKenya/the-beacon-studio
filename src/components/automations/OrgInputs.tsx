"use client";

import { useMemo, useState } from "react";
import { Bars, ProgressRing } from "@/components/automations/Charts";
import {
  CUSTOM_FIELD_TYPES,
  MAX_CUSTOM_FIELDS,
  checkValue,
  orgCompleteness,
  orgMetrics,
  orgSectionsFor,
  readOrgInputs,
  validateOrgInputs,
  type OrgCustomField,
  type OrgField,
  type OrgFieldType,
} from "@/lib/automations/org-fields";

type Draft = Record<string, unknown>;
type CustomDraft = { id: string; label: string; type: OrgCustomField["type"]; options: string; value: unknown };

/** Stored values (money in cents) to what the client types (money in KES). */
function toDraft(type: OrgFieldType, value: unknown): unknown {
  if (value === undefined || value === null) return type === "boolean" ? false : type === "multiselect" || type === "rows" ? [] : "";
  if (type === "money" && typeof value === "number") return String(value / 100);
  if (type === "rows" && Array.isArray(value)) return value.map((row) => ({ ...(row as Record<string, unknown>) }));
  if (typeof value === "number") return String(value);
  return value;
}

function rowsDraftToRaw(field: OrgField, rows: Record<string, unknown>[]) {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const column of field.columns ?? []) {
      const cell = row[column.key];
      out[column.key] = column.type === "money" && typeof cell === "number" ? String(cell / 100) : cell;
    }
    return out;
  });
}

export function OrgInputs({
  templateId,
  config,
  busy,
  onSave,
}: {
  templateId: string;
  config: Record<string, unknown>;
  busy: boolean;
  onSave: (org: { values: Draft; custom: Draft[] }) => void;
}) {
  const saved = useMemo(() => readOrgInputs(templateId, config), [templateId, config]);
  const sections = useMemo(() => orgSectionsFor(templateId), [templateId]);
  const [values, setValues] = useState<Draft>(() => {
    const draft: Draft = {};
    for (const section of sections) for (const field of section.fields) draft[field.key] = toDraft(field.type, saved.values[field.key]);
    return draft;
  });
  const [custom, setCustom] = useState<CustomDraft[]>(() =>
    saved.custom.map((item) => ({ id: item.id, label: item.label, type: item.type, options: (item.options ?? []).join(", "), value: toDraft(item.type, item.value) }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const payload = () => ({
    values: Object.fromEntries(
      sections.flatMap((section) =>
        section.fields.map((field) => {
          const value = values[field.key];
          return [field.key, field.type === "rows" ? rowsDraftToRaw(field, (value as Record<string, unknown>[]) || []) : value === false && field.type === "boolean" ? false : value];
        })
      )
    ),
    custom: custom.map((item) => ({ id: item.id, label: item.label, type: item.type, options: item.options, value: item.value })),
  });

  const preview = validateOrgInputs(templateId, payload());
  const live = preview.ok ? preview.org : saved;
  const completeness = orgCompleteness(templateId, live);
  const metrics = orgMetrics(templateId, { org: live });

  function setField(field: OrgField, value: unknown) {
    setValues((current) => ({ ...current, [field.key]: value }));
    const blank = value === "" || (Array.isArray(value) && value.length === 0);
    const checked = blank || field.type === "rows" ? null : checkValue(field, value);
    setErrors((current) => {
      const next = { ...current };
      if (checked && !checked.ok) next[field.key] = checked.error;
      else delete next[field.key];
      return next;
    });
  }

  function save() {
    const result = validateOrgInputs(templateId, payload());
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSave(payload());
  }

  return (
    <section className="sleek-card rounded-2xl p-5">
      <button type="button" className="flex w-full items-center justify-between gap-4 text-left" aria-expanded={open} onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-4">
          <ProgressRing progress={completeness.percent / 100} />
          <div>
            <h3 className="font-display text-base font-semibold text-heading">Organization inputs</h3>
            <p className="mt-1 text-sm text-muted">
              {completeness.filled} of {completeness.total} filled ·{" "}
              {completeness.ready ? "ready to activate" : `needed to activate: ${completeness.requiredMissing.map((item) => item.label).join(", ")}`}
            </p>
          </div>
        </div>
        <span className="text-sm text-accent">{open ? "Close" : "Edit"}</span>
      </button>

      {open && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-muted">
            Your rates, terms and contacts. Messages use them as placeholders like {"{{lateFee}}"} or {"{{commission}}"} and add your sign-off and opt-out text.
          </p>
          {sections.map((section) =>
            section.id === "custom" ? (
              <div key={section.id} className="sleek-card rounded-xl p-4">
                <h4 className="text-sm font-semibold text-heading">{section.title}</h4>
                <p className="mb-3 text-xs text-muted">{section.blurb}</p>
                <div className="space-y-3">
                  {custom.map((item, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_9rem_1fr_auto]">
                      <input
                        className="field h-10 px-3 text-sm"
                        placeholder="Field name"
                        maxLength={60}
                        value={item.label}
                        onChange={(event) => setCustom(custom.map((row, i) => (i === index ? { ...row, label: event.target.value, id: row.id || "" } : row)))}
                      />
                      <select
                        className="field h-10 px-3 text-sm"
                        value={item.type}
                        onChange={(event) =>
                          setCustom(custom.map((row, i) => (i === index ? { ...row, type: event.target.value as CustomDraft["type"], value: "" } : row)))
                        }
                      >
                        {CUSTOM_FIELD_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <input
                        className="field h-10 px-3 text-sm"
                        placeholder={item.type === "select" || item.type === "multiselect" ? "Value (options below)" : "Value"}
                        value={Array.isArray(item.value) ? item.value.join(", ") : String(item.value ?? "")}
                        onChange={(event) => setCustom(custom.map((row, i) => (i === index ? { ...row, value: event.target.value } : row)))}
                      />
                      <button type="button" className="text-xs text-muted hover:text-foreground" onClick={() => setCustom(custom.filter((_, i) => i !== index))}>
                        Remove
                      </button>
                      {(item.type === "select" || item.type === "multiselect") && (
                        <input
                          className="field h-10 px-3 text-sm sm:col-span-4"
                          placeholder="Options, comma separated"
                          value={item.options}
                          onChange={(event) => setCustom(custom.map((row, i) => (i === index ? { ...row, options: event.target.value } : row)))}
                        />
                      )}
                      {errors[`custom.${index}`] && <p className="text-xs text-red-400 sm:col-span-4">{errors[`custom.${index}`]}</p>}
                    </div>
                  ))}
                  {custom.length < MAX_CUSTOM_FIELDS && (
                    <button type="button" className="admin-btn" onClick={() => setCustom([...custom, { id: "", label: "", type: "text", options: "", value: "" }])}>
                      Add a custom field
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div key={section.id} className="sleek-card rounded-xl p-4">
                <h4 className="text-sm font-semibold text-heading">{section.title}</h4>
                <p className="mb-3 text-xs text-muted">{section.blurb}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldInput key={field.key} field={field} value={values[field.key]} error={errors[field.key]} onChange={(value) => setField(field, value)} />
                  ))}
                </div>
              </div>
            )
          )}
          {metrics.length > 0 && (
            <div className="sleek-card rounded-xl p-4">
              <h4 className="mb-3 text-sm font-semibold text-heading">Your numbers</h4>
              <Bars slices={metrics.map((metric) => ({ label: `${metric.label} (${metric.display})`, value: metric.value }))} />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="admin-btn" disabled={busy} onClick={save}>
              Save organization inputs
            </button>
            {Object.keys(errors).length > 0 && <p className="text-xs text-red-400">Fix the highlighted fields first.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function FieldInput({ field, value, error, onChange }: { field: OrgField; value: unknown; error?: string; onChange: (value: unknown) => void }) {
  const id = `org-${field.key}`;
  const label = (
    <label htmlFor={id} className="mb-1 block text-xs text-muted">
      {field.label}
      {field.required ? " · required" : ""}
      {field.type === "money" ? " (KES)" : field.type === "percent" ? " (%)" : ""}
    </label>
  );
  const note = error ? <p className="mt-1 text-xs text-red-400">{error}</p> : field.help ? <p className="mt-1 text-xs text-muted">{field.help}</p> : null;

  if (field.type === "boolean") {
    return (
      <div>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input id={id} type="checkbox" checked={value === true} onChange={(event) => onChange(event.target.checked)} />
          {field.label}
        </label>
        {note}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        {label}
        <select id={id} className="field h-10 w-full px-3 text-sm" value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
          <option value="">Choose…</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {note}
      </div>
    );
  }
  if (field.type === "multiselect") {
    const list = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-2">
          {(field.options ?? []).map((option) => {
            const on = list.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={on}
                className={`rounded-full px-3 py-1 text-xs ${on ? "bg-accent/25 text-heading" : "bg-foreground/10 text-muted"}`}
                onClick={() => onChange(on ? list.filter((item) => item !== option.value) : [...list, option.value])}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {note}
      </div>
    );
  }
  if (field.type === "rows") {
    const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
    const columns = field.columns ?? [];
    return (
      <div className="sm:col-span-2">
        {label}
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2">
              {columns.map((column) => (
                <input
                  key={column.key}
                  aria-label={column.label}
                  type={column.type === "date" ? "date" : "text"}
                  className="field h-10 flex-1 px-3 text-sm"
                  placeholder={column.label}
                  value={String(row[column.key] ?? "")}
                  onChange={(event) => onChange(rows.map((item, i) => (i === index ? { ...item, [column.key]: event.target.value } : item)))}
                />
              ))}
              <button type="button" className="text-xs text-muted hover:text-foreground" onClick={() => onChange(rows.filter((_, i) => i !== index))}>
                Remove
              </button>
            </div>
          ))}
          {rows.length < (field.maxRows ?? 50) && (
            <button type="button" className="text-xs text-accent" onClick={() => onChange([...rows, {}])}>
              Add row
            </button>
          )}
        </div>
        {note}
      </div>
    );
  }
  const inputType = field.type === "date" ? "date" : field.type === "time" ? "time" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text";
  return (
    <div className={field.type === "text" && (field.maxLength ?? 0) > 100 ? "sm:col-span-2" : ""}>
      {label}
      <input
        id={id}
        type={inputType}
        inputMode={field.type === "money" || field.type === "percent" ? "decimal" : field.type === "integer" ? "numeric" : undefined}
        className="field h-10 w-full px-3 text-sm"
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        aria-invalid={Boolean(error)}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
      {note}
    </div>
  );
}
