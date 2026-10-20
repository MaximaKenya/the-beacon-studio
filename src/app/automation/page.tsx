import { AutomationOffer } from "@/components/sections/AutomationOffer";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "AI automation Kenya",
  description: siteConfig.automation.supporting,
  path: "/automation",
  keywords: [
    "AI automation Kenya",
    "WhatsApp automation",
    "lead follow-up automation",
    siteConfig.brand.name,
  ],
});

export default function AutomationPage() {
  return (
    <div className="pt-16">
      <AutomationOffer titleAs="h1" />
    </div>
  );
}
