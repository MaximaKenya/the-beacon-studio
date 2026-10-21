import { renderOgCard, ogSize } from "@/lib/og-card";

export const runtime = "nodejs";
export const alt = "The Beacon Studio — products, software, and IT from Nairobi";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgCard("The Beacon", "Products, custom software, and IT from Nairobi.");
}
