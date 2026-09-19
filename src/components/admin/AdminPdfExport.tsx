"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analytics-store";
import { siteConfig } from "@/data/site";

const TZ = "Africa/Nairobi";

function formatNairobi(d = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

function fileStamp(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}-${get("hour")}${get("minute")}${get("second")}`;
}

function dateRangeLabel(summary: AnalyticsSummary) {
  if (summary.impressionsByDay.length === 0) {
    return "No dated impressions yet";
  }
  const first = summary.impressionsByDay[0].day;
  const last = summary.impressionsByDay[summary.impressionsByDay.length - 1].day;
  return `${first} → ${last}`;
}

/**
 * Download: branded multi-section PDF via html2canvas + jspdf (automatic file save).
 * Print: opens /admin/report for the browser print dialog only.
 */
export function AdminPdfExport({ summary }: { summary: AnalyticsSummary }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function downloadPdf() {
    if (!captureRef.current) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const node = captureRef.current;
      node.classList.remove("sr-only");
      node.setAttribute("aria-hidden", "false");

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc",
        logging: false,
        windowWidth: 794,
      });

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgW = pageW - 40;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 20;

      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.addImage(img, "PNG", 20, position, imgW, imgH);
      heightLeft -= pageH - 40;

      while (heightLeft > 0) {
        position = heightLeft - imgH + 20;
        pdf.addPage();
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, 0, pageW, pageH, "F");
        pdf.addImage(img, "PNG", 20, position, imgW, imgH);
        heightLeft -= pageH - 40;
      }

      const stamp = fileStamp();
      pdf.save(`Beacon-Studio-Analytics-${stamp}-EAT.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF download failed. Try Print instead, or refresh and retry.");
    } finally {
      if (captureRef.current) {
        captureRef.current.classList.add("sr-only");
        captureRef.current.setAttribute("aria-hidden", "true");
      }
      setBusy(false);
    }
  }

  function openPrint() {
    window.open("/admin/report?print=1", "_blank", "noopener,noreferrer");
  }

  const generatedAt = formatNairobi();
  const stamp = fileStamp();
  const range = dateRangeLabel(summary);
  const reactionRows = Object.entries(summary.reactions.counts).sort(
    (a, b) => b[1] - a[1]
  );
  const maxDay = Math.max(...summary.impressionsByDay.map((d) => d.count), 1);
  const maxProduct = Math.max(...summary.topProducts.map((p) => p.clicks), 1);
  const sentimentTotal =
    summary.reactions.sentiment.positive +
    summary.reactions.sentiment.neutral +
    summary.reactions.sentiment.negative;
  const sent = summary.reactions.sentiment;

  const metricRows: [string, string][] = [
    ["Impressions", String(summary.impressions)],
    ["Unique visitors", String(summary.uniqueVisitors)],
    ["Product clicks", String(summary.productClicks)],
    ["Product views", String(summary.productViews)],
    ["CTA clicks", String(summary.ctaClicks)],
    ["Intake starts", String(summary.intakeStarts)],
    ["Intake submits", String(summary.intakeSubmits)],
    ["Booking clicks", String(summary.bookingClicks)],
    ["Product CTR", `${summary.ctr.productClickRate}%`],
    ["CTA CTR", `${summary.ctr.ctaClickRate}%`],
    ["Conversions", String(summary.funnel.convert)],
    ["Reaction total", String(sentimentTotal)],
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => void downloadPdf()}
        disabled={busy}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40 disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download PDF
      </button>
      <button
        type="button"
        onClick={openPrint}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>

      <div
        ref={captureRef}
        className="sr-only fixed left-0 top-0 z-[-1] w-[794px] overflow-hidden rounded-[20px]"
        aria-hidden
        style={{
          background: "linear-gradient(165deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%)",
          color: "#0f172a",
          fontFamily: "system-ui, sans-serif",
          padding: "40px 44px",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: 20,
            marginBottom: 20,
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Beacon Dot mark */}
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M11 4H21A7 7 0 0 1 28 11V21A7 7 0 0 1 21 28H11A7 7 0 0 1 4 21V11A7 7 0 0 1 11 4Z"
                fill="#0f172a"
              />
              <path d="M10.1 8.1h3.7v15.8H10.1V8.1Z" fill="#0d9488" />
              <path
                d="M13.8 15.45h3.15c3.55 0 5.95 2 5.95 4.75 0 2.95-2.5 5.05-6.35 5.05H13.8V15.45Z"
                fill="#0d9488"
              />
              <path
                d="M16.55 18.2c1.7 0 2.75.95 2.75 2.25s-1.05 2.25-2.75 2.25H13.8v-4.5h2.75Z"
                fill="#0f172a"
              />
              <circle cx="17.35" cy="11.95" r="4.45" fill="#0d9488" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
              {siteConfig.brand.name}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Analytics report · {siteConfig.brand.lockup}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            <div>
              Generated: <span style={{ color: "#0d9488", fontWeight: 600 }}>{generatedAt}</span>
            </div>
            <div>Timezone: {TZ}</div>
            <div>Range: {range}</div>
          </div>
        </div>

        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #0d9488, #2dd4bf, transparent)",
            marginBottom: 22,
            borderRadius: 4,
          }}
        />

        {/* KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 10,
            marginBottom: 22,
          }}
        >
          {[
            ["Impressions", String(summary.impressions)],
            ["Unique visitors", String(summary.uniqueVisitors)],
            ["Product CTR", `${summary.ctr.productClickRate}%`],
            ["Conversions", String(summary.funnel.convert)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6, color: "#0f172a" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed metrics table */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
            Detailed metrics
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  Metric
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "8px 10px",
                    borderBottom: "1px solid #e2e8f0",
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map(([label, value]) => (
                <tr key={label}>
                  <td
                    style={{
                      padding: "7px 10px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {label}
                  </td>
                  <td
                    style={{
                      padding: "7px 10px",
                      borderBottom: "1px solid #f1f5f9",
                      textAlign: "right",
                      fontFamily: "ui-monospace, monospace",
                      color: "#0d9488",
                    }}
                  >
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Funnel + sentiment pie (SVG) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Funnel</div>
            {(
              [
                ["Visit", summary.funnel.visit],
                ["Product view", summary.funnel.productView],
                ["Intake start", summary.funnel.intakeStart],
                ["Convert", summary.funnel.convert],
              ] as const
            ).map(([label, value], i) => {
              const maxF = Math.max(
                summary.funnel.visit,
                summary.funnel.productView,
                summary.funnel.intakeStart,
                summary.funnel.convert,
                1
              );
              const w = Math.max(8, Math.round((value / maxF) * 100));
              return (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      {i + 1}. {label}
                    </span>
                    <span style={{ fontFamily: "ui-monospace, monospace" }}>{value}</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 6,
                      background: "#e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${w}%`,
                        height: "100%",
                        borderRadius: 6,
                        background:
                          i === 3
                            ? "linear-gradient(90deg,#0d9488,#2dd4bf)"
                            : "#0d9488",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
              Sentiment mix
            </div>
            {sentimentTotal === 0 ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>No reactions yet</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="96" height="96" viewBox="0 0 32 32">
                  {(() => {
                    const segs = [
                      { v: sent.positive, c: "#0d9488" },
                      { v: sent.neutral, c: "#94a3b8" },
                      { v: sent.negative, c: "#e11d48" },
                    ];
                    let angle = -90;
                    const r = 12;
                    const cx = 16;
                    const cy = 16;
                    return segs.map((seg, idx) => {
                      const sweep = (seg.v / sentimentTotal) * 360;
                      if (sweep <= 0) return null;
                      const a1 = (angle * Math.PI) / 180;
                      const a2 = ((angle + sweep) * Math.PI) / 180;
                      const x1 = cx + r * Math.cos(a1);
                      const y1 = cy + r * Math.sin(a1);
                      const x2 = cx + r * Math.cos(a2);
                      const y2 = cy + r * Math.sin(a2);
                      const large = sweep > 180 ? 1 : 0;
                      angle += sweep;
                      return (
                        <path
                          key={idx}
                          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
                          fill={seg.c}
                          opacity={0.9}
                        />
                      );
                    });
                  })()}
                  <circle cx="16" cy="16" r="5.5" fill="#f8fafc" />
                </svg>
                <div style={{ fontSize: 11, lineHeight: 1.7, color: "#64748b" }}>
                  <div>
                    <span style={{ color: "#0d9488" }}>●</span> +{sent.positive}
                  </div>
                  <div>
                    <span style={{ color: "#94a3b8" }}>●</span> ~{sent.neutral}
                  </div>
                  <div>
                    <span style={{ color: "#e11d48" }}>●</span> −{sent.negative}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Impressions by day bars */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
            Impressions by day
          </div>
          {summary.impressionsByDay.length === 0 ? (
            <div style={{ fontSize: 12, color: "#64748b" }}>No daily data yet</div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 72,
                paddingTop: 8,
              }}
            >
              {summary.impressionsByDay.map((d) => (
                <div
                  key={d.day}
                  title={`${d.day}: ${d.count}`}
                  style={{
                    flex: 1,
                    height: `${Math.max(6, Math.round((d.count / maxDay) * 64))}px`,
                    background: "linear-gradient(180deg,#2dd4bf,#0d9488)",
                    borderRadius: "6px 6px 2px 2px",
                    minWidth: 8,
                  }}
                />
              ))}
            </div>
          )}
          {summary.impressionsByDay.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 9,
                color: "#64748b",
                marginTop: 6,
              }}
            >
              <span>{summary.impressionsByDay[0].day}</span>
              <span>
                {summary.impressionsByDay[summary.impressionsByDay.length - 1].day}
              </span>
            </div>
          )}
        </div>

        {/* Top products */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>
            Top products
          </div>
          {summary.topProducts.length === 0 ? (
            <div style={{ fontSize: 12, color: "#64748b" }}>No product clicks yet</div>
          ) : (
            summary.topProducts.map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 3,
                  }}
                >
                  <span>{p.id}</span>
                  <span style={{ color: "#64748b", fontFamily: "ui-monospace, monospace" }}>
                    {p.clicks}
                  </span>
                </div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 6,
                    background: "#e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(6, Math.round((p.clicks / maxProduct) * 100))}%`,
                      height: "100%",
                      borderRadius: 6,
                      background: "#0d9488",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reactions */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Emoji reactions
          </div>
          {reactionRows.length === 0 ? (
            <div style={{ fontSize: 12, color: "#64748b" }}>No reactions yet</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {reactionRows.map(([emoji, count]) => (
                <span
                  key={emoji}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "6px 10px",
                    fontSize: 13,
                    background: "#ffffff",
                  }}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: 14,
            fontSize: 10,
            color: "#64748b",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {siteConfig.brand.name} — {siteConfig.brand.lockup}
          <br />
          Generated {generatedAt} ({TZ}) · Range {range}
          <br />
          File: Beacon-Studio-Analytics-{stamp}-EAT.pdf
        </div>
      </div>
    </>
  );
}
