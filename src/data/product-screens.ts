import { siteConfig, type Product } from "@/data/site";

export type PlaceholderKind = "confilearn" | "cadenceapp" | "confirent";

export type ProductScreen = {
  id: string;
  productId: string;
  label: string;
  alt: string;
  /** Real product screenshot under /public. Omit for studio placeholder frames. */
  src?: string;
  placeholder?: PlaceholderKind;
};

/**
 * Motion-strip frames. Live wings use captured product UI;
 * ConfiLearn / CadenceApp / ConfiRent use device-frame placeholders
 * until a public screenshot exists. Never invents a live URL.
 */
export const productScreens: ProductScreen[] = [
  {
    id: "lookfinesse-home",
    productId: "lookfinesse",
    label: "Home",
    alt: "LookFinesse homepage — shop the culture, live the look, with M-Pesa checkout",
    src: "/images/products/screens/lookfinesse-home.png",
  },
  {
    id: "lookfinesse-shop",
    productId: "lookfinesse",
    label: "Shop",
    alt: "LookFinesse shop — creator listings, categories, and Kenya shilling prices",
    src: "/images/products/screens/lookfinesse-shop.png",
  },
  {
    id: "confilearn-studio",
    productId: "confilearn",
    label: "LMS",
    alt: "ConfiLearn studio preview — live class and course progress frame",
    placeholder: "confilearn",
  },
  {
    id: "cadenceapp-studio",
    productId: "cadenceapp",
    label: "Week",
    alt: "CadenceApp studio preview — weekly shipping rhythm frame",
    placeholder: "cadenceapp",
  },
  {
    id: "confirent-studio",
    productId: "confirent",
    label: "Listings",
    alt: "ConfiRent studio preview — rental listing and trust frame",
    placeholder: "confirent",
  },
  {
    id: "triviayard-home",
    productId: "triviayard",
    label: "Home",
    alt: "TriviaYard homepage — family yard games with a live Rock Paper Scissors match",
    src: "/images/products/screens/triviayard-home.png",
  },
  {
    id: "triviayard-games",
    productId: "triviayard",
    label: "Games",
    alt: "TriviaYard games — Rock Paper Scissors, Snap Match, Noughts & Crosses, and more",
    src: "/images/products/screens/triviayard-games.png",
  },
];

function screenById(id: string): ProductScreen {
  const screen = productScreens.find((s) => s.id === id);
  if (!screen) throw new Error(`Unknown product screen: ${id}`);
  return screen;
}

export const productScreenRowA: ProductScreen[] = [
  screenById("lookfinesse-home"),
  screenById("confilearn-studio"),
  screenById("lookfinesse-shop"),
  screenById("cadenceapp-studio"),
];

export const productScreenRowB: ProductScreen[] = [
  screenById("triviayard-home"),
  screenById("confirent-studio"),
  screenById("triviayard-games"),
  screenById("lookfinesse-shop"),
];

export function productForScreen(screen: ProductScreen): Product | undefined {
  return siteConfig.products.find((p) => p.id === screen.productId);
}

export function screensForProduct(productId: string): ProductScreen[] {
  return productScreens.filter((s) => s.productId === productId);
}

/** Address-bar label for the device chrome — uses a real host only when liveUrl exists. */
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
