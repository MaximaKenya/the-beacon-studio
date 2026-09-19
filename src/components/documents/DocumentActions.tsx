"use client";

import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import type { QuotationRecord, ReceiptRecord } from "@/lib/documents";
import {
  downloadQuotationPdf,
  downloadReceiptPdf,
  printQuotationPdf,
  printReceiptPdf,
} from "@/lib/pdf-docs";

type Props =
  | { kind: "quotation"; record: QuotationRecord; className?: string }
  | { kind: "receipt"; record: ReceiptRecord; className?: string };

export function DocumentActions(props: Props) {
  const [busy, setBusy] = useState<"dl" | "print" | null>(null);

  async function onDownload() {
    setBusy("dl");
    try {
      if (props.kind === "quotation") await downloadQuotationPdf(props.record);
      else await downloadReceiptPdf(props.record);
    } catch (e) {
      console.error(e);
      alert("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function onPrint() {
    setBusy("print");
    try {
      if (props.kind === "quotation") await printQuotationPdf(props.record);
      else await printReceiptPdf(props.record);
    } catch (e) {
      console.error(e);
      alert("Print failed. Try Download instead.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${props.className ?? ""}`}>
      <button
        type="button"
        onClick={() => void onDownload()}
        disabled={!!busy}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40 disabled:opacity-60"
      >
        {busy === "dl" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download
      </button>
      <button
        type="button"
        onClick={() => void onPrint()}
        disabled={!!busy}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:border-accent/40 disabled:opacity-60"
      >
        {busy === "print" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        Print
      </button>
    </div>
  );
}
