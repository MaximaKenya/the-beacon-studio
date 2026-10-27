import type { Metadata } from "next";
import { PortalAutomations } from "@/components/automations/PortalAutomations";

export const metadata: Metadata = {
  title: "Demo client portal",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ e?: string; t?: string }> };

/** Read-only portal view for a named demo client. The link is signed in /admin. */
export default async function PortalDemoPage({ searchParams }: Props) {
  const { e = "", t = "" } = await searchParams;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
      <div className="mb-6 sleek-card rounded-3xl p-5">
        <h1 className="text-heading text-2xl font-semibold">Demo client portal</h1>
        <p className="mt-1 text-sm text-muted">Sample data. Read-only. Nothing here sends a message or takes a payment.</p>
      </div>
      {e && t ? (
        <PortalAutomations demo={{ email: e, token: t }} />
      ) : (
        <p className="text-sm text-muted">Open this page from the demo link in /admin.</p>
      )}
    </main>
  );
}
