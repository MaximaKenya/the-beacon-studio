import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";

export async function GET() {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: `${siteConfig.brand.name} — Products & Work`,
    home_page_url: siteConfig.seo.siteUrl,
    feed_url: `${siteConfig.seo.siteUrl}/api/feed`,
    description: siteConfig.seo.description,
    author: {
      name: siteConfig.brand.name,
      url: siteConfig.seo.siteUrl,
    },
    items: [
      ...siteConfig.products.map((product) => ({
        id: `product-${product.id}`,
        url: product.liveUrl || `${siteConfig.seo.siteUrl}/#products`,
        title: product.name,
        content_text: `${product.tagline} — ${product.description}`,
        tags: product.tags,
        date_modified: new Date().toISOString(),
        _meta: {
          type: "product",
          status: product.status,
          docsUrl: product.docsUrl,
          image: product.image,
        },
      })),
      ...siteConfig.projects.map((project) => ({
        id: project.id,
        url: project.liveUrl || `${siteConfig.seo.siteUrl}/#work`,
        title: project.title,
        content_text: project.description,
        tags: project.tags,
        date_modified: new Date().toISOString(),
        _meta: {
          type: "case-study",
          github: project.githubUrl,
          comingSoon: project.comingSoon ?? false,
          image: project.image,
        },
      })),
    ],
  };

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
