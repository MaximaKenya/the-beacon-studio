import { siteConfig, type Product } from "@/data/site";

export type ProductScreen = {
  id: string;
  productId: string;
  label: string;
  alt: string;
  src?: string;
};

/** Real screenshots only. Coming-soon products use a mark, not an old capture. */
export const productScreens: ProductScreen[] = [
  {
    id: "confirent-login",
    productId: "confirent",
    label: "Sign in",
    alt: "ConfiRent sign-in screen on a phone",
    src: "/images/products/confirent-login.jpg",
  },
  {
    id: "cadenceapp-home",
    productId: "cadenceapp",
    label: "Home",
    alt: "CadenceApp home page on a desktop",
    src: "/images/products/cadenceapp-home.jpg",
  },
];

export function productForScreen(screen: ProductScreen): Product | undefined {
  return siteConfig.products.find((p) => p.id === screen.productId);
}

export function screensForProduct(productId: string): ProductScreen[] {
  return productScreens.filter((s) => s.productId === productId && s.src);
}

/** Address-bar label for device chrome — uses a real host only when liveUrl exists. */
export function productChromeLabel(product: Product, screenLabel: string): string {
  if (product.liveUrl) {
    try {
      return `${new URL(product.liveUrl).host} · ${screenLabel}`;
    } catch {
      return `${product.name} · ${screenLabel}`;
    }
  }
  return `${product.name} · ${screenLabel}`;
}
