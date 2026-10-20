import { renderOgCard } from "@/lib/og-card";

export const runtime = "nodejs";

function clean(value: string | null, max: number, fallback: string): string {
  const text = (value ?? "").replace(/[\r\n\t<>]+/g, " ").replace(/\s+/g, " ").trim();
  return (text || fallback).slice(0, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), 90, "The Beacon Studio");
  const subtitle = clean(
    searchParams.get("subtitle"),
    160,
    "AI automation, custom software, and IT from Nairobi."
  );
  return renderOgCard(title, subtitle);
}
