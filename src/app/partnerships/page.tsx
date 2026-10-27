import { PartnershipsSection } from "@/components/revenue/PartnershipsSection";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Partnerships for associations and accountants",
  description: "Associations, chambers, accountants and SACCO networks: introduce members to automations. Send an enquiry.",
  path: "/partnerships",
});

export default function PartnershipsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Partnerships</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Work with us.</h1>
      <PartnershipsSection />
    </div>
  );
}
