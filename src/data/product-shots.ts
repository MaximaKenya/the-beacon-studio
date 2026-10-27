/** Product screenshot manifest. Data below the marker is written by scripts/ingest-product-shots.mjs. */
export type ShotDevice = "desktop" | "mobile";

export type ProductShot = {
  /** Product id from siteConfig.products */
  slug: string;
  /** Public path, e.g. /products/confirent/home-desktop.webp */
  file: string;
  device: ShotDevice;
  width: number;
  height: number;
  caption: string;
  /** Describes what the screen shows. */
  alt: string;
  blurDataURL: string;
};

export function shotsFor(slug: string): ProductShot[] {
  return productShots.filter((s) => s.slug === slug);
}

/** Desktop + mobile pair for the animated tour (first of each, falls back to whatever exists). */
export function tourShots(slug: string): { desktop: ProductShot[]; mobile: ProductShot[] } {
  const all = shotsFor(slug);
  return {
    desktop: all.filter((s) => s.device === "desktop").slice(0, 3),
    mobile: all.filter((s) => s.device === "mobile").slice(0, 3),
  };
}

// @generated-start (scripts/ingest-product-shots.mjs)
export const productShots: ProductShot[] = [
  {
    "slug": "confirent",
    "file": "/products/confirent/dashboard-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Landlord Portfolio HQ shows rent collected, occupancy, overdue rent and upcoming items at a glance",
    "alt": "ConfiRent dashboard screen on desktop: Landlord Portfolio HQ shows rent collected, occupancy, overdue rent and upcoming items at a glance",
    "blurDataURL": "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAAAwAQCdASoQAAoAA4BaJZwAA3AA/vOb7YgmB4K1zwf1BneAAAA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/dashboard-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Landlord Portfolio HQ shows rent collected, occupancy, overdue rent and upcoming items at a glance",
    "alt": "ConfiRent dashboard screen on a phone: Landlord Portfolio HQ shows rent collected, occupancy, overdue rent and upcoming items at a glance",
    "blurDataURL": "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAADwAwCdASoQACMAPu1kqU6ppaOiKqwBMB2JZwAAQX3PXAol/edV280uAP7thQxdpZFDkxCPHc1b25c8ifAVnT0jIWi1DyDorFGpktrMwCMuct8Y3a5f8J1OUyNkJNBCSi5GupA/6jmLSGfOaEAAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/rent-collection-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Send in-app rent reminders or batch M-Pesa STK requests to tenants with balances",
    "alt": "ConfiRent rent collection screen on desktop: Send in-app rent reminders or batch M-Pesa STK requests to tenants with balances",
    "blurDataURL": "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAABQAQCdASoQAAoAA4BaJZwABAAAAP7zXf9QIN9HDqEB8DeQfA4zAIAA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/rent-collection-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Send in-app rent reminders or batch M-Pesa STK requests to tenants with balances",
    "alt": "ConfiRent rent collection screen on a phone: Send in-app rent reminders or batch M-Pesa STK requests to tenants with balances",
    "blurDataURL": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAABQAwCdASoQACMAPu1irU2ppaSiKqwBMB2JQBlWgj5v8+90AAD+7/UdhyE3zIlYARKg4PpJmAtYaAjPKHhPLX6E9ELGx7nCb4a4xdKb9BfiX658ja8OdSF4gxmkd+faMct5MDrmMolzkAgA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/payments-mpesa-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The payments hub tracks M-Pesa prompts, recorded rent and statement lines, with paid, pending and failed status",
    "alt": "ConfiRent payments mpesa screen on desktop: The payments hub tracks M-Pesa prompts, recorded rent and statement lines, with paid, pending and failed status",
    "blurDataURL": "data:image/webp;base64,UklGRigAAABXRUJQVlA4IBwAAAAwAQCdASoQAAoAA4BaJaQAA3AA/vQ4kX6BAAAA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/payments-mpesa-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The payments hub tracks M-Pesa prompts, recorded rent and statement lines, with paid, pending and failed status",
    "alt": "ConfiRent payments mpesa screen on a phone: The payments hub tracks M-Pesa prompts, recorded rent and statement lines, with paid, pending and failed status",
    "blurDataURL": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAgCdASoQACMAPu1qrlCppaQiqqgBMB2JaWhwACTQgAD+8Ge/BSZoDEAZGV6Iv+y6yfr41aey64KvK8AFRhs6S2MRobQg7e6yaQiKwHK3tg0LFluanJ5lQgAAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/homepage-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Search verified rentals, homes for sale and short stays across Kenya, with M-Pesa payments and 0% commission on rent",
    "alt": "ConfiRent homepage screen on desktop: Search verified rentals, homes for sale and short stays across Kenya, with M-Pesa payments and 0% commission on rent",
    "blurDataURL": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoQAAoAA4BaJZQC/OERG9omFAAA/vUc883WsfdaArf3CdWL8lelO7BGgJHRkt/8rnVcDk5zXOlOPGAqnknwCCzYM4AAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/homepage-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Search verified rentals, homes for sale and short stays across Kenya, with M-Pesa payments and 0% commission on rent",
    "alt": "ConfiRent homepage screen on a phone: Search verified rentals, homes for sale and short stays across Kenya, with M-Pesa payments and 0% commission on rent",
    "blurDataURL": "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAQBACdASoQACMAPu1kqU6ppaOiKqwBMB2JZADNwEX4orObAKby7nfYAAD+9/JGFouXJUzEa9iHmPNQ5G5a2Q8e/p0iOTfsh0cwr1txC3zE+SBPT1Bu4cDCSRqaZVOfN0S+K17reObUrlmiV7E0T0wEap/3Z68KCEHAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/listings-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Manage properties and units, see vacant or occupied status, and request rent or send reminders from each card",
    "alt": "ConfiRent listings screen on desktop: Manage properties and units, see vacant or occupied status, and request rent or send reminders from each card",
    "blurDataURL": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACwAQCdASoQAAoAA4BaJZwAAudnHizQAP72IZ5jJzrVAxIJ2v0xtfSHVVs8U/SQfORxUUafdvjsst9hkU6ZXY/qyQGM0WKhizE44bbgzleYcAAA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/listings-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Manage properties and units, see vacant or occupied status, and request rent or send reminders from each card",
    "alt": "ConfiRent listings screen on a phone: Manage properties and units, see vacant or occupied status, and request rent or send reminders from each card",
    "blurDataURL": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAABwBACdASoQACMAPulip02pJaOiNVgIASAdCWMAuDBFcsz2SGCaX/9sVvg0AAD+9hlV0Nv9n1RPdQcR7z6QN4QoVgE6BurJsk6/JzUY3/M8+2aLCZ5jCA+EBpU3B0Af9qasFBq9PKOIo1CkhzBo3BgmTux7oqRcYiBB46thoQ+fSfHUQPtYJtoGPpS+drqSHV2HcvTst6dl5aQAAAA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/property-detail-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Public listing page with photos, price, rooms and a Kenya trust-and-safety panel",
    "alt": "ConfiRent property detail screen on desktop: Public listing page with photos, price, rooms and a Kenya trust-and-safety panel",
    "blurDataURL": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoQAAoAA4BaJZwAAu0cGFWUgAD+9iHLoS9yVBAh/13SKxkiwfiMb5pj5CH7jwFbI+5Mys24R8Uve9py0lJGmC+M/dYAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/property-detail-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Public listing page with photos, price, rooms and a Kenya trust-and-safety panel",
    "alt": "ConfiRent property detail screen on a phone: Public listing page with photos, price, rooms and a Kenya trust-and-safety panel",
    "blurDataURL": "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAACwBACdASoQACMAPt1apE2opSOiNUgBEBuJQBhQBYdB+EgVKPb2XXNQlxmwmRmoAP7x+AyHwZWyGp6HcfvbM4SNAHkVbVnPFOmfvHqjwc5GGf1Zi6xVctQef5mfK6aiUI3WzI1585+ymY37FhLn10Q++5tQCV0bDUGJAfj/iOzN4AykaEWSoymIre3dzi/nmvYXyIkn8K2AAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/receipt-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Payment detail shows the receipt, period, statement lines and M-Pesa transaction status",
    "alt": "ConfiRent receipt screen on desktop: Payment detail shows the receipt, period, statement lines and M-Pesa transaction status",
    "blurDataURL": "data:image/webp;base64,UklGRioAAABXRUJQVlA4IB4AAABQAQCdASoQAAoAA4BaJaQABAAAAP7zyTUyhdMAAAA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/receipt-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Payment detail shows the receipt, period, statement lines and M-Pesa transaction status",
    "alt": "ConfiRent receipt screen on a phone: Payment detail shows the receipt, period, statement lines and M-Pesa transaction status",
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAwCdASoQACMAPu1qrVCppaQiqqgBMB2JaR9kAAOoYAAA/vBO9U19T90xt0A3Ov25P+3DUqrctaRsrreAjrJNjsFh4cQhcn1WVQAA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/maintenance-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Log maintenance tickets, then track them from reported to in progress to done",
    "alt": "ConfiRent maintenance screen on desktop: Log maintenance tickets, then track them from reported to in progress to done",
    "blurDataURL": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAACwAQCdASoQAAoAA4BaJZwAAu0dpsNwAP73GsxR5wfThAAA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/maintenance-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Log maintenance tickets, then track them from reported to in progress to done",
    "alt": "ConfiRent maintenance screen on a phone: Log maintenance tickets, then track them from reported to in progress to done",
    "blurDataURL": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADwAwCdASoQACMAPt1apE2opSOiNUgBEBuJZwDOOCw90Iq2pOaRmXgAAP7x/Zm5L8NXKVIwjM3V2TXm1htcCWtjC7ol0IviUuvVGreG3VuuPXo9Hvd1JfmzAEAAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/reports-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Portfolio reports by date range, with CSV and PDF export and an optional monthly email",
    "alt": "ConfiRent reports screen on desktop: Portfolio reports by date range, with CSV and PDF export and an optional monthly email",
    "blurDataURL": "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAABQAQCdASoQAAoAA4BaJZwABAAAAP7z1CJA8y0W7RzxesOAKAA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/reports-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Portfolio reports by date range, with CSV and PDF export and an optional monthly email",
    "alt": "ConfiRent reports screen on a phone: Portfolio reports by date range, with CSV and PDF export and an optional monthly email",
    "blurDataURL": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQBACdASoQACMAPt1YpE2opSOiNUgBEBuJZQAAbjKC8OZJV02OhDU/AAD+8fgMknGjjooinn5g/V3llG83aUEk1k8p34REtLfm+fvr+Hcod3Ct+J/OiSUIq8IKMSEamWIja7AA"
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/messaging-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "In-app inbox for direct enquiries and property group chats",
    "alt": "ConfiRent messaging screen on desktop: In-app inbox for direct enquiries and property group chats",
    "blurDataURL": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAABQAQCdASoQAAoAA4BaJZwABAAAAP7zyZ3xPfnK1GwAAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/messaging-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "In-app inbox for direct enquiries and property group chats",
    "alt": "ConfiRent messaging screen on a phone: In-app inbox for direct enquiries and property group chats",
    "blurDataURL": "data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwAwCdASoQACMAPt1apE2opSOiNUgBEBuJZwDM0ChxWWRfhwPP3hYAAP7zikTUta1N9E9LdE859cyPw1CBOXkF3a0n4eoApSyAMqO3qzPDCM8dnDaxXBm82Ej0bhCAAAA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/agency-dashboard-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Agency HQ with listings, leads, viewings, agent invites and plan status during the free trial",
    "alt": "ConfiRent agency dashboard screen on desktop: Agency HQ with listings, leads, viewings, agent invites and plan status during the free trial",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoQAAoAA4BaJZwABAAAAP7zHwhRnSAldFNpShOqgZCgAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/agency-dashboard-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Agency HQ with listings, leads, viewings, agent invites and plan status during the free trial",
    "alt": "ConfiRent agency dashboard screen on a phone: Agency HQ with listings, leads, viewings, agent invites and plan status during the free trial",
    "blurDataURL": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAACwBACdASoQACMAPt1YpE2opSOiNUgBEBuJZwDM0C+/ejJsHcgsXSZpMPzRucZqAP7x+AyMWPr3FHt/FeFgc9h86GiFT83R8hFjFas1x3S/uFRySdiX7u1o+XiQJh3EafHfyWEGxIdIFTt14AA="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/browse-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Explore nearby listings, then book a viewing, message the lister or make an offer from the card",
    "alt": "ConfiRent browse screen on desktop: Explore nearby listings, then book a viewing, message the lister or make an offer from the card",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoQAAoAA4BaJZwAAu0XCJ1AAP72Ic/Pkd8ZVbtI9vX/xYfdflMWQvGPmIAMbS90omHCAA=="
  },
  {
    "slug": "confirent",
    "file": "/products/confirent/browse-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Explore nearby listings, then book a viewing, message the lister or make an offer from the card",
    "alt": "ConfiRent browse screen on a phone: Explore nearby listings, then book a viewing, message the lister or make an offer from the card",
    "blurDataURL": "data:image/webp;base64,UklGRrQAAABXRUJQVlA4IKgAAADwBACdASoQACMAPu1kqU6ppaOiKqwBMB2JZQAFEAXomcrP/ImNWUe9xsE2clcwNEAA/vgJWTdF9pqilIhkZUClujDvGizbNFrsXu8lRWBiVWXuGJAnB1xZm8rwKAA4pXRB6gsa93RzyvwzRB/f9HNi0gqRua/wuBubpygQpQqq0tXCvsfv2MC9uCACsV8+CeTJG6hOuUe07ILkxZjo8Y8ANSG4uTp64AA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/home-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Story of the day, quick practice tiles, a 5-minute call with Sofía, and a trial countdown",
    "alt": "Convoria home screen on desktop: Story of the day, quick practice tiles, a 5-minute call with Sofía, and a trial countdown",
    "blurDataURL": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAQAgCdASoQAAoAA4BaJYwC7AD0jpqCYeGAAP71RMVOwrxExa2pqQjT60Eu3jPUS6aKo9W7NlIl8jVyrqt5Kx/2dCb/RbRb1dDgpR4APyCUeAAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/home-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Story of the day, quick practice tiles, a 5-minute call with Sofía, and a trial countdown",
    "alt": "Convoria home screen on a phone: Story of the day, quick practice tiles, a 5-minute call with Sofía, and a trial countdown",
    "blurDataURL": "data:image/webp;base64,UklGRr4AAABXRUJQVlA4ILIAAAAQBQCdASoQACMAPt1apE2opSOiNUgBEBuJaADE2d2hhUhHJj73QnYsuO7hDHfStAOAAP7tbt9bnX29p9GdEgwwedKdUKt+fb/AD+VVA2G4tbOFJK7oujjZ/20kcK26+LU4rOHmCqTYJxoIQxF5Jk0GbPFhjIVmtMpO78+MWvb1MZio7XnbC2cSYHlfvGuRcZQf6IxeKvwZ2Uno6xQAjj6p+DTIpZx2fNEAHyq4mIwBAVAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/lesson-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Bite-size lessons with a narrated dialogue and new words, ready in 13 exercises",
    "alt": "Convoria lesson screen on desktop: Bite-size lessons with a narrated dialogue and new words, ready in 13 exercises",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoQAAoAA4BaJYwAAudQDYcAAP73DzOtbjyfnkSjfYJgpC5IG8oyw+FPfvnlk9iJwwAAAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/lesson-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Bite-size lessons with a narrated dialogue and new words, ready in 13 exercises",
    "alt": "Convoria lesson screen on a phone: Bite-size lessons with a narrated dialogue and new words, ready in 13 exercises",
    "blurDataURL": "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAABwBACdASoQACMAPu1kqk6ppaOiKqwBMB2JYwDBzEYb50F0ScdVxK63MA79QAD+9ziri+OiRxz1OphB2C0mHyKNnxE/nUpAWbiI25uYU12JGLFhlkDVp2OU6qLuLMFcLjcsIkzIjqLNTJgN4rGUTxC+SA82Vs5hHLABfaoEmREei+hZRfV+eTdYEtUlQHE7/dixM9t52DqjcgPhfuZo/AAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/story-reader-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Graded stories with narration and line-by-line translation (tap any word to translate it)",
    "alt": "Convoria story reader screen on desktop: Graded stories with narration and line-by-line translation (tap any word to translate it)",
    "blurDataURL": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAoAA4BaJZQAAu18tdb2AAD+9w82uBYD8C2yvwpM16eKcSPYMmzYbl8krKAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/story-reader-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Graded stories with narration and line-by-line translation (tap any word to translate it)",
    "alt": "Convoria story reader screen on a phone: Graded stories with narration and line-by-line translation (tap any word to translate it)",
    "blurDataURL": "data:image/webp;base64,UklGRq4AAABXRUJQVlA4IKIAAACQBACdASoQACMAPt1apE2opSOiNUgBEBuJYwDGQC03+MfycLaPlzMYYJMHUwAA/vHhJ5BlNfIsTZSCE+NTvynC0NuEKl+q16hh9VbHnGo4LxqHGsmgI/FnchJD9g4EpSlz9FnWL3XHIdiNfnbsjwyi/hGmdcio2dBQRlk1D9qgSQ8uYyuGHpBFsnhtvAoebGt5SjQ0Tv0MhwFcGj+AryhSAAA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/progress-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "CEFR level, skill profile across listening/speaking/reading/writing, and a forecast",
    "alt": "Convoria progress screen on desktop: CEFR level, skill profile across listening/speaking/reading/writing, and a forecast",
    "blurDataURL": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACwAQCdASoQAAoAA4BaJQAAU/pAabAAAP73EJpQNyFzNUb107KvVk9L6h1WTXfHTfUl1lchmJehywwWomrWsxOR1hzwAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/progress-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "CEFR level, skill profile across listening/speaking/reading/writing, and a forecast",
    "alt": "Convoria progress screen on a phone: CEFR level, skill profile across listening/speaking/reading/writing, and a forecast",
    "blurDataURL": "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAABQBACdASoQACMAPu1kqU6ppaOiKqwBMB2JYwAAPZCWc225ja5TXEd6ZMlIAP62x2CG6wRbmt81IcpPiVsZWlU2jmTOL9dVLFIOgiYf0kD3r/C6ezbGJYcWaK4iVHL/pZ+69FROvMuncOaXxvfWszowafUyEmebNtmcqHhYJq6/XcuTCILEou98hbijoWN/VzIQf9kuXGAAAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/study-buddy-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Practice chat, quizzes, and a plan for today",
    "alt": "Convoria study buddy screen on desktop: Practice chat, quizzes, and a plan for today",
    "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAoAA4BaJZQAApMX9vseAADfdpTdl1+nQZ2fSr5GcxjemMV7xNj14yQQJGrwx2dIhaO3XVtgAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/study-buddy-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Practice chat, quizzes, and a plan for today",
    "alt": "Convoria study buddy screen on a phone: Practice chat, quizzes, and a plan for today",
    "blurDataURL": "data:image/webp;base64,UklGRm4AAABXRUJQVlA4IGIAAACQBACdASoQACMAPu1aqE2ppKQiNVgIATAdiWcAzcAOsbHhmRl2qfTXE5gTlzAAyV2DvrjoiNWADnsLYlrNax5GLRrGCM6iv0TI38DsSTa58+t3EpWa5EsDTnKfZsOp4IAAAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/sounds-letters-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Learn every vowel and sound with audio and example words",
    "alt": "Convoria sounds letters screen on desktop: Learn every vowel and sound with audio and example words",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACQAQCdASoQAAoAA4BaJZwAAqHyOwgA/vcRYYuBD3+x/yjCibcUAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/sounds-letters-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Learn every vowel and sound with audio and example words",
    "alt": "Convoria sounds letters screen on a phone: Learn every vowel and sound with audio and example words",
    "blurDataURL": "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAACQBACdASoQACMAPt1cpU2opSOiNUgBEBuJZQAu/8CgWmd/eeqhP4RUsvniT2AA/vHhIZU5dXjTcDQJ6MFj9iYotKG111fTnext4dFP10097wvTsbpiweS+4+DGGf7EdadaYS4vO+2KUIoz83UsQ2p1HdmHF4HT96hTMYkgBEEkeiQA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/grammar-guide-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Short rules with tables and examples from A1 upward",
    "alt": "Convoria grammar guide screen on desktop: Short rules with tables and examples from A1 upward",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACQAQCdASoQAAoAA4BaJZwAApO6XgAA/vcRSisv16Jj9yoTQ0zA7A8AAAA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/grammar-guide-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Short rules with tables and examples from A1 upward",
    "alt": "Convoria grammar guide screen on a phone: Short rules with tables and examples from A1 upward",
    "blurDataURL": "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAACwBACdASoQACMAPuVipk2pJaOiNVgIASAciWUAygAWmztN8ELEXlB/IIu10ZGgAP7v2CshKBFWB+e/nQiX3cl6nkbpmifhd6BvWjEeR8JN9xTsbtwCgIo9nARKQT289GNoAxAx23Z06VM+0Q8Ry3JcFsg5docBfIQsUAAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/vocabulary-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Hundreds of core words grouped by topic, tracked as you learn",
    "alt": "Convoria vocabulary screen on desktop: Hundreds of core words grouped by topic, tracked as you learn",
    "blurDataURL": "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAABwAQCdASoQAAoAA4BaJZ2ZAAHhAAD+85mcFuwU2IEepUfka3NcDgAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/vocabulary-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Hundreds of core words grouped by topic, tracked as you learn",
    "alt": "Convoria vocabulary screen on a phone: Hundreds of core words grouped by topic, tracked as you learn",
    "blurDataURL": "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAACQBACdASoQACMAPt1cpE2opSOiNUgBEBuJZQDOOCw92jGKYqR3Wp18fSAuVAAA/vHhJ5BtLyK/pY4qjMTSodjerpIIaI1fPLbVik2EQURC/sW2oD8K4mMooBY5UeOlVhCUVhJ/ze6xguXs8xHkghQi4Zjn6vjNxYdvu8cu0feIU4K858A0pVlwX8YFOFAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/profile-settings-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Themes, text size, translation help, accessibility, and smart reminders",
    "alt": "Convoria profile settings screen on desktop: Themes, text size, translation help, accessibility, and smart reminders",
    "blurDataURL": "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAAAwAQCdASoQAAoAA4BaJaQAA3AA/vQLpBVbRmfr344leoDwAAA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/profile-settings-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Themes, text size, translation help, accessibility, and smart reminders",
    "alt": "Convoria profile settings screen on a phone: Themes, text size, translation help, accessibility, and smart reminders",
    "blurDataURL": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAABQBACdASoQACMAPulip02pJaOiNVgIASAdCWUAAL+PsOHJ2QYvDMQN7f8wAP704BgRZ10Fd/81Po7QQPft3vxBY0cjdgY3PjK49F4lAiXhOtGiauZ7q/zwPvhFeEQ4x9qOfW3TcjcB5i+xfEKAjA0wAGgQ6BAA"
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/plans-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "30 days free with no card, plus regional and student pricing",
    "alt": "Convoria plans screen on desktop: 30 days free with no card, plus regional and student pricing",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACQAQCdASoQAAoAA4BaJZwAApJr7AAA/vcME39JT6Gu4dhQWhAAAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/plans-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "30 days free with no card, plus regional and student pricing",
    "alt": "Convoria plans screen on a phone: 30 days free with no card, plus regional and student pricing",
    "blurDataURL": "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAQBACdASoQACMAPt1apE2opSOiNUgBEBuJZQDI1CzbBeDuYjCSyaXN8AD+6GsU7cwi1c0rEA82NsxZuni8L2hIiJB+efDqE9hFoznwVR+P3rziAh7QTeq9Da+RlJCiqcIPw5/52W+GJXsquoFrffZw0bJMIf94695fdUICBPX/2oMAAAA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/download-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Direct APK download with release notes",
    "alt": "Convoria download screen on desktop: Direct APK download with release notes",
    "blurDataURL": "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAACwAQCdASoQAAoAA4BaJZwAApz/cmOgAP73EWCBsBysrUH3QPNYpn7hZYHgAA=="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/download-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Direct APK download with release notes",
    "alt": "Convoria download screen on a phone: Direct APK download with release notes",
    "blurDataURL": "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAABQBACdASoQACMAPu1qrVEppaQiqqgBMB2JZQAAQX/FCb2K4igQqhwLy3LAAP7qxnj+hJ90GI+NLcnrBi89kmvhentZrGyZIJbt/Y9kkjZuHhOAvtvy1uvuglLukpMLn6VrloYQ+Zdl2lPX4UNjY/jSoQAAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/home-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "One workspace for CRM, collections, call center, support, HR and finance, free for 30 days",
    "alt": "CadenceApp home screen on desktop: One workspace for CRM, collections, call center, support, HR and finance, free for 30 days",
    "blurDataURL": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAwAgCdASoQAAoAA4BaJbACdAEVz8FUyEBoAAD+5/7cgTYNPSHGK2qC6NSKQDMIU62OsjVhoPEOUCQYVcL9R4P4vbNj+X5MHY8xiK8p+CdAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/home-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "One workspace for CRM, collections, call center, support, HR and finance, free for 30 days",
    "alt": "CadenceApp home screen on a phone: One workspace for CRM, collections, call center, support, HR and finance, free for 30 days",
    "blurDataURL": "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAACwBACdASoQACMAPt1apE2opSOiNUgBEBuJYwDH5Ch9NCnX7zaDkJNUPCQc8+cAAP7v2CzZ0nagp4K4SUS/dCz3mbxBtbjWhEEcZ7ut3OmUpzWDFPu3K9Un7qYhSV4lOHqziON+C89gFAHE6ADHP4b28SuB/q69b59iDVd9CLAAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/industry-lenders-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Track every borrower, promise to pay and M-Pesa payment in one place",
    "alt": "CadenceApp industry lenders screen on desktop: Track every borrower, promise to pay and M-Pesa payment in one place",
    "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoQAAoAA4BaJYwCsAEPCmLXiwAA/u3q9DSGxlyt9OE916QqRDb0zju45YWiV/VvL8D4UW9vhLnCUgkYqAA="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/industry-lenders-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Track every borrower, promise to pay and M-Pesa payment in one place",
    "alt": "CadenceApp industry lenders screen on a phone: Track every borrower, promise to pay and M-Pesa payment in one place",
    "blurDataURL": "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAABQBACdASoQACMAPu1cqE2ppKOiNVgIATAdiUAXughmnuAONB+qCwHDgsqAAP704BqtTj9HzPkLSs93VcjKk4usfSBmFaWfvOOjlh6/0yx+tGvLntnG3QOx2M6aic35LsouqPxOvU7sAbNfvdACwS5xMCFL0gex99QAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/pricing-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Simple per-agent pricing in Kenya shillings: Collector KES 1,500, Supervisor KES 2,500, BPO/Agency KES 3,500 a month",
    "alt": "CadenceApp pricing screen on desktop: Simple per-agent pricing in Kenya shillings: Collector KES 1,500, Supervisor KES 2,500, BPO/Agency KES 3,500 a month",
    "blurDataURL": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAAAQAgCdASoQAAoAA4BaJZACsAEPAEadZWAAAP7v+a/8jyEV19IfveIhvB/MzCmJQDYDw19FUXvuv0UsxsgtZAAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/pricing-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Simple per-agent pricing in Kenya shillings: Collector KES 1,500, Supervisor KES 2,500, BPO/Agency KES 3,500 a month",
    "alt": "CadenceApp pricing screen on a phone: Simple per-agent pricing in Kenya shillings: Collector KES 1,500, Supervisor KES 2,500, BPO/Agency KES 3,500 a month",
    "blurDataURL": "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAACwAwCdASoQACMAPt1apE2opSOiNUgBEBuJQBg5hQo6otDur+mYAAD+79gs2dK4iPd1M8TOJnN2IurU19SrYyTOgXPTgFWoYoOwix/T35d2ea2LZ/mswZfhfSf4BrdaVn1sSy3VcJ85UZn+YO2kKL7t3Wj5gqYAx2JIL+zOdfUxB/ryT1uFkFfCLfT6xEAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/home-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "A clean welcome page that points learners to courses, tutors and holiday tuition, free for 30 days",
    "alt": "ConfiLearn home screen on desktop: A clean welcome page that points learners to courses, tutors and holiday tuition, free for 30 days",
    "blurDataURL": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAACwAQCdASoQAAoAA4BaJZQAAudlAS2AAPl2MOsaIEEgTSffy3Mn3oN4FNTEkn4+9KJjd3UAAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/home-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "A clean welcome page that points learners to courses, tutors and holiday tuition, free for 30 days",
    "alt": "ConfiLearn home screen on a phone: A clean welcome page that points learners to courses, tutors and holiday tuition, free for 30 days",
    "blurDataURL": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADwAwCdASoQACMAPt1apE2opSOiNUgBEBuJZQAAel+NgHEQW1t5syAAAPff2BGuOxc3qAhrGSqwpJx7VEiiI0WkjE2y/qVuUWJxLDJtMP3Pe932nGRhshtF4J/fpUf/8x0Pw1qfUiT/GisSnRjrttXjq2IlHnAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/course-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Each course page shows the lesson, a step-by-step curriculum and your progress toward a certificate",
    "alt": "ConfiLearn course screen on desktop: Each course page shows the lesson, a step-by-step curriculum and your progress toward a certificate",
    "blurDataURL": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAACwAQCdASoQAAoAA4BaJbACdAENLXxQAP2Pxa9gqluENZhfFHrf58mt2zFEeZwXBGsthkK2nSQ0G3WS3c9gHj7dX7x7NeS4wpl8b9hLa9M2l1VIcyu/kAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/course-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Each course page shows the lesson, a step-by-step curriculum and your progress toward a certificate",
    "alt": "ConfiLearn course screen on a phone: Each course page shows the lesson, a step-by-step curriculum and your progress toward a certificate",
    "blurDataURL": "data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAADwAwCdASoQACMAPt1apE2opSOiNUgBEBuJagCo9C4cRnCD3nV5MRYAAPuhnD+PNVvwnWND0A75XkQdyuTPRvyEQpkC4xGUh7mpqe6CeJwKuKzTv97hgZc06WIHgIfGzEAZBWW/uCwR61dfOq83hveBE8RaTWR+TpOpUGCAzt63VwGaWLj/rvmYueWC9ftZaZbUrGUG8WohP1PiqGkn/LTt6zCUCetMXwAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/learner-library-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Learners pick up where they left off, with progress rings on every course",
    "alt": "ConfiLearn learner library screen on desktop: Learners pick up where they left off, with progress rings on every course",
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADQAQCdASoQAAoAA4BaJQBOgCHh3IpbOAD2t8K8Zv9R4GR1y9pHpC/BqO9WSdHi4EflKABuqPHKWon0ujFj9tUoemVJY4ro2z6IAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/learner-library-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Learners pick up where they left off, with progress rings on every course",
    "alt": "ConfiLearn learner library screen on a phone: Learners pick up where they left off, with progress rings on every course",
    "blurDataURL": "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAADwAwCdASoQACMAPu1kqk6ppaOiKqwBMB2JbACw7D37uu2RrOOLhf7gAP6fAuEJCY+grAyW/8pGfc/jt6ySInIDZG+9fZUIouKdRuA0yTEl/v81Lv8WEt+d9N/1/bWLl5mwa+PssLqS2lKoAob0ClICFuGfhnL5OU7XJFcQhRL9mzZHZXmFlUKKhvqwuhnPxX32V8ch78Wrwuo3Dh3tCOMLw9e6Ba8Z2/ccAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/progress-xp-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Levels, XP, streaks and badges keep learners motivated week to week",
    "alt": "ConfiLearn progress xp screen on desktop: Levels, XP, streaks and badges keep learners motivated week to week",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAoAA4BaJZQAAudfBXUgAAD2vbaowF+j2NzckBvIGzLAvqsQvIG+xzHaimfMD0AAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/progress-xp-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Levels, XP, streaks and badges keep learners motivated week to week",
    "alt": "ConfiLearn progress xp screen on a phone: Levels, XP, streaks and badges keep learners motivated week to week",
    "blurDataURL": "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAAAwBACdASoQACMAPtlcpE2oJSOiNUgBABsJZQAAUFfwPqY9CwV9NyuFfegA/haKuk0fBCurZvCdr6AzxOI7FAksrB7MLHJogBy3yA1nJA2CyMMA/S+JIGgb8ZP0f3DAcDk3+sGfO5+PcWm/XeNpgKTxlP+lpt8EUStUAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/catalog-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Browse trending courses across business, design, health and languages, with clear prices in shillings",
    "alt": "ConfiLearn catalog screen on desktop: Browse trending courses across business, design, health and languages, with clear prices in shillings",
    "blurDataURL": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAoAA4BaJYwAAudCPJtLgAD1nMDC0jhQ1+/pKxO/qVB2wTUdgoQD7EarkVGwkfSJaBUnRtL12BBauN4RXXOSNt6iM72RjgA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/catalog-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Browse trending courses across business, design, health and languages, with clear prices in shillings",
    "alt": "ConfiLearn catalog screen on a phone: Browse trending courses across business, design, health and languages, with clear prices in shillings",
    "blurDataURL": "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAACwBACdASoQACMAPt1Yo02opSMiNUgBEBuJQBkTBXuz0XJFVLr6nRoUJpo44gzQAP4RF1n7OMf7t125YCLW9hMvna65s1mvF9HKraSoG1RmKhrJCFEQUZrolbdL/2pHc4yISUOndxOM2DO8k0St2HegEChN/WfkRP1NdwP3gX95RqONHeODT2ffmCn8aJphNB+FMBpHULTeB7/5yXJDER+7rs1PZL0HxCA4WsAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/exam-prep-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "KCSE, KJSEA and CBC practice questions with an AI tutor for hints",
    "alt": "ConfiLearn exam prep screen on desktop: KCSE, KJSEA and CBC practice questions with an AI tutor for hints",
    "blurDataURL": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAACwAQCdASoQAAoAA4BaJZQC7AEO+COAAM49ND450BASsag5JNmbhg81ckXtAfBUYV/db1ypgAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/exam-prep-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "KCSE, KJSEA and CBC practice questions with an AI tutor for hints",
    "alt": "ConfiLearn exam prep screen on a phone: KCSE, KJSEA and CBC practice questions with an AI tutor for hints",
    "blurDataURL": "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAABwBACdASoQACMAPu1qrlCppaQiqqgBMB2JZQC/auiCMJM3JgH1dWv9MSjgAAD334l7XZskKGKM1Bv6ymuGfsM9m4GMiWn4ORIrwWnNR8m9joricyHS9Y2nZ0czcKBq1PARpWD1QW0EIhZfutv5BPKQrrEjj+bbB6JpBaekkAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/holiday-tuition-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Parents book CBC and KCSE holiday tuition while school is closed, December to January",
    "alt": "ConfiLearn holiday tuition screen on desktop: Parents book CBC and KCSE holiday tuition while school is closed, December to January",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACQAQCdASoQAAoAA4BaJZQAAudFxpAA+Xanz89E+kUy6pjbRl/JAW25goxNih/SUpaR11o33rGAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/holiday-tuition-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Parents book CBC and KCSE holiday tuition while school is closed, December to January",
    "alt": "ConfiLearn holiday tuition screen on a phone: Parents book CBC and KCSE holiday tuition while school is closed, December to January",
    "blurDataURL": "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAABQBACdASoQACMAPt1Yo02opSMiNUgBEBuJZwAAfMLzfNE0otdvLwvGziAAAPff2Bxzvfspu7HYplYkJD95w4f+ERo5NuwQFWfJG0Bp7UBao6oRm/jAQjQxXKzYcnLcIMkBtNptdh8Cv2HhuBTqRvYk1lhVcjU6Im82jYjWq/O3coc5sAAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/pricing-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Simple monthly plans in Kenya shillings for learners, families and tutors",
    "alt": "ConfiLearn pricing screen on desktop: Simple monthly plans in Kenya shillings for learners, families and tutors",
    "blurDataURL": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAAAQAgCdASoQAAoAA4BaJZQCdAEUox21Kp4AAM4+nvaOJSBfvTl5xzWnxlqJGucW5HKhvbpqS/k2TpUvRpozoTiTq5M7IAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/pricing-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Simple monthly plans in Kenya shillings for learners, families and tutors",
    "alt": "ConfiLearn pricing screen on a phone: Simple monthly plans in Kenya shillings for learners, families and tutors",
    "blurDataURL": "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAADQBACdASoQACMAPt1cpU2opSOiNUgBEBuJZQDCgywCS98OegYlXPWMJk+y6rAC0AD339gcc51EHM4FeAhrGSqyo7rh5pA7etHEUwRtGTQVD0of2qwC+RIfp5ACHIWhqScHY+ZmZlRATEaq2hRbDm9zA6DbsCcp/zMAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/home-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "\"shop the culture, live the look\" with Browse shop, Near me, and shortcuts to Wellness, Virtual Gym, AI Stylist and services",
    "alt": "LookFinesse home screen on desktop: \"shop the culture, live the look\" with Browse shop, Near me, and shortcuts to Wellness, Virtual Gym, AI Stylist and services",
    "blurDataURL": "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoQAAoAA4BaJZwAAudfWmQm3gD++RNXzd+8r6rR8XChEJiOlnowAAAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/home-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "\"shop the culture, live the look\" with Browse shop, Near me, and shortcuts to Wellness, Virtual Gym, AI Stylist and services",
    "alt": "LookFinesse home screen on a phone: \"shop the culture, live the look\" with Browse shop, Near me, and shortcuts to Wellness, Virtual Gym, AI Stylist and services",
    "blurDataURL": "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAABwBACdASoQACMAPuleqE2pJSOiNVgIASAdCWcAyFxFdHxkXSSRB61fn7xQIAD+937H1wUUa+ImC28WV5XwiZQNT2/srTKwFNPJu1MxXeGMZBPjnae9/DE8E4NSMNspFnTATL6Jz/kMPNw126eEjVb76js4OgPeIwvc44o4GDksL0VAAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/vendor-dashboard-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Wallet balance, conversion, orders, active products and a setup checklist",
    "alt": "LookFinesse vendor dashboard screen on desktop: Wallet balance, conversion, orders, active products and a setup checklist",
    "blurDataURL": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAABwAQCdASoQAAoAA4BaJZVefAGIAAD+8/SjLTSRyu8oBAXCUQODEh2/aUcOb0hH8k3LehQAAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/vendor-dashboard-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Wallet balance, conversion, orders, active products and a setup checklist",
    "alt": "LookFinesse vendor dashboard screen on a phone: Wallet balance, conversion, orders, active products and a setup checklist",
    "blurDataURL": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAAAQBQCdASoQACMAPu1ysVGppySiqqgBMB2JaAC23QAATL+05oUQj73wDu2LAtzxzTYAAP7ytSzTlVmxhooyFvh5rnY/KnPUprLhRX7BoS7FLyGd7HqQoIxKsj4hoOiDbTH//IpJKv/VCn4dwT4/zfB9hyvtvma3Znu+IDxygsgJ2LxNsfzKTtW4xhnGHkWpqTvrPU1LOLfAGxwsAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/discover-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Vendors on a Nairobi map with radius filters, category chips, Shop/Book/Deliver tabs and Directions",
    "alt": "LookFinesse discover screen on desktop: Vendors on a Nairobi map with radius filters, category chips, Shop/Book/Deliver tabs and Directions",
    "blurDataURL": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAoAA4BaJaQAAu188WoQAAD++RcP0Zxv94EtRcgwoOvI8I3W7RYcl1VnH09YaW5873AAAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/discover-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Vendors on a Nairobi map with radius filters, category chips, Shop/Book/Deliver tabs and Directions",
    "alt": "LookFinesse discover screen on a phone: Vendors on a Nairobi map with radius filters, category chips, Shop/Book/Deliver tabs and Directions",
    "blurDataURL": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoQACMAPu1qrVCppaQiqqgBMB2JYgDDNFyt46D91qLtM1I4recAAP78rP8ALXYidfc+qxNUDsb7LdOQYXa+1ITlF26dLutIHka6DZ3v7mQ7fu4F6aXfUTrBzCcmUqw6MZgOqqik/o2zBAT0g+YLgt6k7rAt5p9zCKXuK5TvEpoaHEV8naz7oCqwgUA6lpzhEf60xaAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/ai-stylist-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "AI Stylist chat with suggested prompts for Nairobi weather, occasions and stylists nearby",
    "alt": "LookFinesse ai stylist screen on desktop: AI Stylist chat with suggested prompts for Nairobi weather, occasions and stylists nearby",
    "blurDataURL": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAADQAQCdASoQAAoAA4BaJaQAAudTBA6oAAD++RRLfA70AAAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/ai-stylist-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "AI Stylist chat with suggested prompts for Nairobi weather, occasions and stylists nearby",
    "alt": "LookFinesse ai stylist screen on a phone: AI Stylist chat with suggested prompts for Nairobi weather, occasions and stylists nearby",
    "blurDataURL": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAwCdASoQACMAPu1qrFCppaQiqqgBMB2JaQAAPRlOExiW6V7yxAAA/vQjeaAZwU33slElRHmahNnCzuMDH2qcJSv8f1/NSNMIAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/services-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Salon, fitness and wellness services with prices, in-person/virtual tags and Book Now",
    "alt": "LookFinesse services screen on desktop: Salon, fitness and wellness services with prices, in-person/virtual tags and Book Now",
    "blurDataURL": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAAAQAgCdASoQAAoAA4BaJaQAAu19ulptz7wAAP74jNbDpdkQt7QWFKm+piKPfbnvwhDGTGnSLXuABkTGQpWer+dsM/QFWYOHSgAAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/services-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Salon, fitness and wellness services with prices, in-person/virtual tags and Book Now",
    "alt": "LookFinesse services screen on a phone: Salon, fitness and wellness services with prices, in-person/virtual tags and Book Now",
    "blurDataURL": "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAACQBACdASoQACMAPu1irU2ppaSiKqwBMB2JZwDM0EXUzGMAGhNd+a70+Vsb6ogA/vkYlAoCudlAANrlZ3wNznp4q+aeReDkn++bv6t9uLYvWdjtRecPyzgwbZCPtfxImxtEhOSgXLPjSlhzftSuNfScruvX+Q6AAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/wellness-gym-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Exercise library, programs, foods and diets, calculators, your plan, coach and nearby gyms",
    "alt": "LookFinesse wellness gym screen on desktop: Exercise library, programs, foods and diets, calculators, your plan, coach and nearby gyms",
    "blurDataURL": "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoQAAoAA4BaJZwAAp/iKVSUAAD+6l99I+x8POYHS8Yjhs3Teuegah8BwAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/wellness-gym-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Exercise library, programs, foods and diets, calculators, your plan, coach and nearby gyms",
    "alt": "LookFinesse wellness gym screen on a phone: Exercise library, programs, foods and diets, calculators, your plan, coach and nearby gyms",
    "blurDataURL": "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAACQBACdASoQACMAPu1qrVCppaQiqqgBMB2JZwDDcBZgjYXdZn7po48j+3dBaGAA/nk/S5D9Cg/eDcTL+z0EeldGcy+tBWdR8/2erezoac3AwDwZjFjV1pcr8xfD9q8XjwZLCl1bbquge9V6fqg/FUO0Jitdpq+nIEvsc0iWpgYmQAAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/vendor-profile-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Verified gym with location map, Directions/OpenStreetMap/Apple Maps/Waze, rating and Book Session",
    "alt": "LookFinesse vendor profile screen on desktop: Verified gym with location map, Directions/OpenStreetMap/Apple Maps/Waze, rating and Book Session",
    "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAACwAQCdASoQAAoAA4BaJaQAAuraUEtAAP75F+or3WvheQMP+zwO4U9LLXhP2S08BqmtFksxQguxhdlx9bAAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/vendor-profile-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Verified gym with location map, Directions/OpenStreetMap/Apple Maps/Waze, rating and Book Session",
    "alt": "LookFinesse vendor profile screen on a phone: Verified gym with location map, Directions/OpenStreetMap/Apple Maps/Waze, rating and Book Session",
    "blurDataURL": "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAAAwBACdASoQACMAPu1kqk6ppaOiKqwBMB2JZQDLpBSkX+3iLi2gL52tqsAA/uybw6bm4aHzkWc3KH/jWnOar6fpmoc/yHhwEjcpNnTakQJrVc2f2S0E3dyUdBOH7s9itEV1QAASlJt0B5meVtAj54Bf4hKBGDgNcs9qtOtm3YlNWHvUxEio5OfFaAy7mfumwIAAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/service-detail-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "HIIT Bootcamp with price, duration, capacity and \"Select a Time Slot\" (no payment until confirmed)",
    "alt": "LookFinesse service detail screen on desktop: HIIT Bootcamp with price, duration, capacity and \"Select a Time Slot\" (no payment until confirmed)",
    "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAQCdASoQAAoAA4BaJZwAAqHySodAAP75GG46nc0KXUvdEEbjQW79ksnRlGuNxKY8kRRChUXxwsCJLukz8z4QAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/service-detail-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "HIIT Bootcamp with price, duration, capacity and \"Select a Time Slot\" (no payment until confirmed)",
    "alt": "LookFinesse service detail screen on a phone: HIIT Bootcamp with price, duration, capacity and \"Select a Time Slot\" (no payment until confirmed)",
    "blurDataURL": "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAACQBACdASoQACMAPt1apE2opSOiNUgBEBuJZwDE2CypV1UcPdvZXrMx9yE75UAA/vVuShXa13ZP4fpKvnaN3lx6d8Ot0FPtYORoR2BakUcptUzmhvYrSBVzlH2hygUKNL8mVijk//PpQrOsLEjZH92h+XUfdNaCWYxj8fatDGoRX2vX555oUxDLmTQcJCe5d6AAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/booking-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Pick a time, add-ons with prices, participants and notes (stopped before confirming)",
    "alt": "LookFinesse booking screen on desktop: Pick a time, add-ons with prices, participants and notes (stopped before confirming)",
    "blurDataURL": "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADQAQCdASoQAAoAA4BaJaQAAu19bhwcAAD++RRQZNddM4M+sL7eiDfkWasAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/booking-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Pick a time, add-ons with prices, participants and notes (stopped before confirming)",
    "alt": "LookFinesse booking screen on a phone: Pick a time, add-ons with prices, participants and notes (stopped before confirming)",
    "blurDataURL": "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAABQBACdASoQACMAPt1apE2opSOiNUgBEBuJaQAAeYCkU4fao+/72AIJXK5YAP71bkoV2td+vBavvhNeUY0mJ8Co7uabAr82QfIK5FXq3eW2H4sQnRHKj5BZwGVAtCcS2ZFw+0N/mVMs3NXpYTvb2EAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/reminders-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Booking confirmations & reminders, rebook nudges, birthday greetings, consent-only sending",
    "alt": "LookFinesse reminders screen on desktop: Booking confirmations & reminders, rebook nudges, birthday greetings, consent-only sending",
    "blurDataURL": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAAAwAQCdASoQAAoAA4BaJaQAA3AA/vU3xlysAet1hZrSgAAA"
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/reminders-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Booking confirmations & reminders, rebook nudges, birthday greetings, consent-only sending",
    "alt": "LookFinesse reminders screen on a phone: Booking confirmations & reminders, rebook nudges, birthday greetings, consent-only sending",
    "blurDataURL": "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAACQBACdASoQACMAPt1cpU2opaOiNUgBEBuJZwDDrC030aZ/fugb6NGEO4edmjAA/vQzK1cEdTxt8Gn+EHRvtBjQqEcFhPJeuNHm6WTmBi9+5iYl5wBp5bLkbOVXAePr+pESSpbmVBe7UlD9DWAAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/pricing-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "30-day free trial, then Premium 1, 3 or 12 month passes in KES via M-Pesa or card",
    "alt": "LookFinesse pricing screen on desktop: 30-day free trial, then Premium 1, 3 or 12 month passes in KES via M-Pesa or card",
    "blurDataURL": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAACwAQCdASoQAAoAA4BaJaQAAu18Zx6AAP75FyZy9TDye3H0kHA3vjySjqS9E66ESYAAAA=="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/pricing-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "30-day free trial, then Premium 1, 3 or 12 month passes in KES via M-Pesa or card",
    "alt": "LookFinesse pricing screen on a phone: 30-day free trial, then Premium 1, 3 or 12 month passes in KES via M-Pesa or card",
    "blurDataURL": "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAAAQBACdASoQACMAPt1cpU2opSOiNUgBEBuJaQAD4/KxjJINsm4JrmyKAAD+9W5Juw/pMr/YlJW8YtuZGG3JfbJNu5RUohGl7uDxAwle92LzSqJq1X+4Tz4OYf+Xa4wyNuvs/5C7b2+er/qYPGqY8Byp66FlxCv77HR/e3sIAAA="
  }
];
