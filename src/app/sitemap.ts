import type { MetadataRoute } from "next";
import { categoryLandings, industryLandings } from "@/data/landings";
import { workStudies } from "@/data/work";
import { industryPacks, siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/automation", "/automations", "/book", "/checklist", "/automation-roi", "/referrals"];
  const landingPaths = [...categoryLandings, ...industryLandings].map((page) => page.path);
  const packPaths = industryPacks.map((pack) => `/packs/${pack.id}`);
  const workPaths = workStudies.map((study) => study.path);
  const productPaths = siteConfig.products.map((product) => `/products/${product.id}`);

  return [...staticPaths, ...packPaths, ...landingPaths, ...workPaths, ...productPaths].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "weekly",
    priority: path === "/" ? 1 : path === "/automation" || path === "/automations" ? 0.9 : 0.8,
  }));
}
