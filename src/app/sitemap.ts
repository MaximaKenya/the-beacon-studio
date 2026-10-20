import type { MetadataRoute } from "next";
import { categoryLandings, industryLandings } from "@/data/landings";
import { siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/automation", "/automations", "/book", "/checklist"];
  const landingPaths = [...categoryLandings, ...industryLandings].map((page) => page.path);
  const productPaths = siteConfig.products.map((product) => `/products/${product.id}`);

  return [...staticPaths, ...landingPaths, ...productPaths].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "weekly",
    priority: path === "/" ? 1 : path === "/automation" || path === "/automations" ? 0.9 : 0.8,
  }));
}
