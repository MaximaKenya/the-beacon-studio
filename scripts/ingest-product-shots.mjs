/**
 * Convert reviewed product screenshots to WebP + write src/data/product-shots.ts.
 * Input: a review file per product (JSON array) listing only approved shots:
 *   [{ "src": "/abs/path.png", "screen": "dashboard", "caption": "...", "alt": "..." }]
 * Usage: node scripts/ingest-product-shots.mjs <reviewDir>   (reviewDir/<slug>.json)
 * Raw PNGs are never committed; only public/products/<slug>/<screen>-<device>.webp.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const reviewDir = process.argv[2];
if (!reviewDir) throw new Error("usage: ingest-product-shots.mjs <reviewDir>");
const ORDER = ["confirent", "convoria", "cadenceapp", "confilearn", "lookfinesse"];
const out = [];

for (const slug of ORDER) {
  const file = path.join(reviewDir, `${slug}.json`);
  if (!fs.existsSync(file)) continue;
  const items = JSON.parse(fs.readFileSync(file, "utf8"));
  const dir = path.join("public/products", slug);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const it of items) {
    const meta = await sharp(it.src).metadata();
    const device = meta.width < 800 ? "mobile" : "desktop";
    // Desktop: 1440 wide -> 1280; mobile: 390 -> 2x-ish 600. Keep aspect.
    const targetW = device === "desktop" ? 1280 : 600;
    const name = `${it.screen}-${device}.webp`;
    let q = 72;
    let buf;
    for (;;) {
      buf = await sharp(it.src).resize({ width: targetW, withoutEnlargement: true }).webp({ quality: q, effort: 6 }).toBuffer();
      if (buf.length < 150_000 || q <= 45) break;
      q -= 7;
    }
    fs.writeFileSync(path.join(dir, name), buf);
    const m = await sharp(buf).metadata();
    const blur = await sharp(it.src).resize(16).webp({ quality: 40 }).toBuffer();
    out.push({
      slug, file: `/products/${slug}/${name}`, device, width: m.width, height: m.height,
      caption: it.caption, alt: it.alt, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    });
    console.log(slug, name, `${(buf.length / 1024).toFixed(0)} KB q${q}`);
  }
}

const header = fs.readFileSync("src/data/product-shots.ts", "utf8").split("// @generated-start")[0];
fs.writeFileSync(
  "src/data/product-shots.ts",
  `${header}// @generated-start (scripts/ingest-product-shots.mjs)\nexport const productShots: ProductShot[] = ${JSON.stringify(out, null, 2)};\n`
);
