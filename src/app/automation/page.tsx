import type { Metadata } from "next";
import { AutomationOffer } from "@/components/sections/AutomationOffer";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "AI Automation",
  description: siteConfig.automation.supporting,
  keywords: [
    "AI automation Kenya",
    "WhatsApp automation",
    "lead follow-up automation",
    siteConfig.brand.name,
  ],
  alternates: {
    canonical: "/automation",
  },
  openGraph: {
    title: `AI Automation | ${siteConfig.brand.name}`,
    description: siteConfig.automation.supporting,
    url: "/automation",
  },
};

export default function AutomationPage() {
  return (
    <div className="pt-16">
      <AutomationOffer titleAs="h1" />
    </div>
  );
}
