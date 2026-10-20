import type { Metadata } from "next";
import { siteConfig } from "@/data/site";

export function siteOrigin(): string {
  return siteConfig.seo.siteUrl.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (!path || path === "/") return siteOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteOrigin()}${normalized}`;
}

export function ogImageUrl(title: string, subtitle: string): string {
  const params = new URLSearchParams({
    title: title.slice(0, 90),
    subtitle: subtitle.slice(0, 160),
  });
  return absoluteUrl(`/og?${params.toString()}`);
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = ogImageUrl(input.title, input.description);
  const fullTitle = `${input.title} | ${siteConfig.brand.name}`;

  return {
    title: input.title,
    description: input.description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    alternates: { canonical: url },
    robots: input.index === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url,
      type: "website",
      siteName: siteConfig.brand.name,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
      images: [image],
    },
  };
}
