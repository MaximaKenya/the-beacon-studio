import { renderOgCard, ogSize } from "@/lib/og-card";

export const runtime = "nodejs";
export const alt = "Beacon Creek — products, software, and IT from Nairobi";
export const size = ogSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return renderOgCard("Beacon Creek", "Products, custom software, and IT from Nairobi.");
}
