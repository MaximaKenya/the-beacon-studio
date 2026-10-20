import type { FaqItem } from "@/data/site";
import { JsonLd } from "@/components/seo/OrganizationJsonLd";

export function FaqJsonLd({ items }: { items?: readonly FaqItem[] }) {
  if (!items?.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
