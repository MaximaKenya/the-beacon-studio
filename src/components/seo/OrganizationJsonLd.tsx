import { siteConfig } from "@/data/site";

export function OrganizationJsonLd() {
  const baseUrl = siteConfig.seo.siteUrl.replace(/\/$/, "");

  const softwareApps = siteConfig.products.map((product) => ({
    "@type": "SoftwareApplication",
    name: product.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: product.description,
    url: product.liveUrl || `${baseUrl}/#products`,
    offers:
      product.status !== "coming-soon"
        ? {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          }
        : undefined,
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
        email: siteConfig.email,
        logo: `${baseUrl}${siteConfig.seo.ogImage}`,
        sameAs: siteConfig.social
          .filter((link) => link.icon !== "email")
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
          image: `${baseUrl}${siteConfig.profileImage}`,
        },
        knowsAbout: [
          "Custom software development",
          "Cloud applications",
          "SaaS",
          "API development",
          "Product design",
        ],
      },
      {
        "@type": "Person",
        "@id": `${baseUrl}/#founder`,
        name: siteConfig.founder.name,
        jobTitle: siteConfig.founder.role,
        description: siteConfig.founder.bio.split("\n\n")[0],
        email: siteConfig.email,
        url: baseUrl,
        image: `${baseUrl}${siteConfig.profileImage}`,
        worksFor: { "@id": `${baseUrl}/#organization` },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Nairobi",
          addressCountry: "KE",
        },
        sameAs: siteConfig.social
          .filter((link) => link.icon !== "email")
          .map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: siteConfig.brand.name,
        description: siteConfig.seo.description,
        publisher: { "@id": `${baseUrl}/#organization` },
      },
      ...softwareApps,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
