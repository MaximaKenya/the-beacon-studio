import { siteConfig } from "@/data/site";
import { isPlaceholderContact } from "@/lib/launch";
import { absoluteUrl } from "@/lib/seo";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const baseUrl = absoluteUrl("/");
  const phone = siteConfig.phone;

  const products = siteConfig.products.map((product) => ({
    "@type": ["Product", "SoftwareApplication"],
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: product.pricing ? `${product.description} ${product.pricing}` : product.description,
    url: product.liveUrl || absoluteUrl(`/products/${product.id}`),
    brand: { "@id": `${baseUrl}/#organization` },
    ...(product.pricing ? { offers: { "@type": "Offer", description: product.pricing } } : {}),
  }));

  const services = siteConfig.services.map((service) => ({
    "@type": "Service",
    name: service.title,
    description: service.description,
    serviceType: service.title,
    provider: { "@id": `${baseUrl}/#organization` },
    areaServed: { "@type": "Country", name: "Kenya" },
    url: service.id === "ai-automation" ? absoluteUrl("/automation") : baseUrl,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: siteConfig.brand.name,
        legalName: siteConfig.brand.legalName,
        description: siteConfig.seo.description,
        url: baseUrl,
        ...(isPlaceholderContact(siteConfig.email) ? {} : { email: siteConfig.email }),
        telephone: phone,
        logo: absoluteUrl(siteConfig.seo.ogImage),
        sameAs: siteConfig.social
          .filter((link) => link.icon !== "email" && !isPlaceholderContact(link.href))
          .map((link) => link.href),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        founder: {
          "@type": "Person",
          name: siteConfig.founder.name,
          jobTitle: siteConfig.founder.role,
        },
        knowsAbout: [
          "AI automation",
          "Custom software",
          "Managed IT",
          "M-Pesa payments",
          "Kenyan SMEs",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#localbusiness`,
        name: siteConfig.brand.name,
        description: siteConfig.brand.description,
        url: baseUrl,
        telephone: phone,
        ...(isPlaceholderContact(siteConfig.email) ? {} : { email: siteConfig.email }),
        image: absoluteUrl(siteConfig.seo.ogImage),
        priceRange: "KES 2500-6500/month",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressRegion: "Nairobi",
          addressCountry: "KE",
        },
        areaServed: { "@type": "Country", name: "Kenya" },
        parentOrganization: { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: siteConfig.brand.name,
        description: siteConfig.seo.description,
        publisher: { "@id": `${baseUrl}/#organization` },
      },
      ...services,
      ...products,
    ],
  };

  return <JsonLd data={jsonLd} />;
}
