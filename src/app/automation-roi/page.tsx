import { AutomationRoi } from "@/components/roi/AutomationRoi";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Automation ROI calculator (KES)",
  description: "Enter your hours, unpaid invoices and staff cost to see what manual follow-up costs, and which automation pack fits. Estimates in KES.",
  path: "/automation-roi",
  keywords: ["automation ROI Kenya", "automation calculator KES", siteConfig.brand.name],
});

export default function AutomationRoiPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">ROI calculator</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight text-heading">What does manual follow-up cost you?</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Four numbers. Results are estimates from your inputs only.</p>
      <div className="mt-10">
        <AutomationRoi />
      </div>
    </div>
  );
}
