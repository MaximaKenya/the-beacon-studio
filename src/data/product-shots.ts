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
    "file": "/products/convoria/friends-leagues-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Climb the weekly XP leaderboard and add friends",
    "alt": "Convoria friends and leagues screen on desktop: Climb the weekly XP leaderboard and add friends",
    "blurDataURL": "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAACwAQCdASoQAAoAA4BaJYwAAuQ12U0gAP73CQBJA1+UD75S4ZcAK4jOZzP4UTkAAAA="
  },
  {
    "slug": "convoria",
    "file": "/products/convoria/friends-leagues-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Climb the weekly XP leaderboard and add friends",
    "alt": "Convoria friends and leagues screen on a phone: Climb the weekly XP leaderboard and add friends",
    "blurDataURL": "data:image/webp;base64,UklGRp4AAABXRUJQVlA4IJIAAADwBACdASoQACMAPu1cqE2ppKQiNVgIATAdiWIAxz4gAI+n5P7DyXTrouA6EcnhvIAA/v1AcxaIBJKnCl+V8PcEKYOaCvP9KWvKtd9nPMKgMeQqR/1YTbBFtOgZeR9H7Hv4nYe4UaiHUrt/qVW4h4izvlkL3/XNIMG1r2vhivWrY8NX8E7VUaxN3UH4th7GbRleAA=="
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
    "file": "/products/cadenceapp/dashboard-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The organisation command centre: a setup checklist, hours saved by automation, and live totals for collection cases, promises to pay and outstanding balance",
    "alt": "CadenceApp dashboard screen on desktop: The organisation command centre: a setup checklist, hours saved by automation, and live totals for collection cases, promises to pay and outstanding balance",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAADQAQCdASoQAAoAA4BaJaQAAu1gwUeaAAD+9xLyAcvEO5IE4d/VcF0RQAA="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/dashboard-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The organisation command centre: a setup checklist, hours saved by automation, and live totals for collection cases, promises to pay and outstanding balance",
    "alt": "CadenceApp dashboard screen on a phone: The organisation command centre: a setup checklist, hours saved by automation, and live totals for collection cases, promises to pay and outstanding balance",
    "blurDataURL": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAABQBACdASoQACMAPu1iqk4ppaQiKqwBMB2JZQDO7Babls2u3VSEHkm21AsAAP7v2CX/Mn5Wos+PN2/wVyApimn1nvuAD0BKsYae/0zU03Gl8dkuhZsY69RSkq+0H1id8hY5dvOaZQR0ugAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/wallboard-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Live agent activity, callbacks due, collections and items that need attention, refreshed every 30 seconds",
    "alt": "CadenceApp real-time wallboard screen on desktop: Live agent activity, callbacks due, collections and items that need attention, refreshed every 30 seconds",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoQAAoAA4BaJaQAAucKreGwAP73OXRe9lQ2WqF/2gAAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/wallboard-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Live agent activity, callbacks due, collections and items that need attention, refreshed every 30 seconds",
    "alt": "CadenceApp real-time wallboard screen on a phone: Live agent activity, callbacks due, collections and items that need attention, refreshed every 30 seconds",
    "blurDataURL": "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADwAwCdASoQACMAPu1qrVEppaQiqqgBMB2JZV/2AClBkyI2t1Ugg/fAAP7v2SRbMh1ClpXRY9EUN6TnaT96CP7OAJtTa/o0q8d0o4cY2iI1icbEMJMmg8FVn7RVauoOJia/KwrKaO6pOenABcvGo2P+XmYAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/debtors-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The live debtor book: search and filter every account by status, aging bucket, agent or portfolio, then add them to a call campaign in one step",
    "alt": "CadenceApp debtors list screen on desktop: The live debtor book: search and filter every account by status, aging bucket, agent or portfolio, then add them to a call campaign in one step",
    "blurDataURL": "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAADQAQCdASoQAAoAA4BaJZwAAud+fyM7SAD+9xL35HFbNx5k5CbJkzkFWrwt4AAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/debtors-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The live debtor book: search and filter every account by status, aging bucket, agent or portfolio, then add them to a call campaign in one step",
    "alt": "CadenceApp debtors list screen on a phone: The live debtor book: search and filter every account by status, aging bucket, agent or portfolio, then add them to a call campaign in one step",
    "blurDataURL": "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoQACMAPuFepk2opSOiNUgBEBwJQBibBfTiFZzmM0oLtbCKcQAA/vHhHZFiMxD9DYKELz0WuTz940/uOBa3OnEUCqI+zS5ONVcQ70+kwdjAvS58U53KGstO6PZ+/YiPeyfa7z//2Kq3jSXyhsDtS0IQBOHpqp/MBwtQab6jBqIeQsJ0G+B15QAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/dialer-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The call console: pick a campaign, your own accounts or the whole team queue, and the next debtor comes up automatically after each call",
    "alt": "CadenceApp dialer screen on desktop: The call console: pick a campaign, your own accounts or the whole team queue, and the next debtor comes up automatically after each call",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoQAAoAA4BaJaQAAuUu9JwAAP73OX6WV9davTvaTwAAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/dialer-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The call console: pick a campaign, your own accounts or the whole team queue, and the next debtor comes up automatically after each call",
    "alt": "CadenceApp dialer screen on a phone: The call console: pick a campaign, your own accounts or the whole team queue, and the next debtor comes up automatically after each call",
    "blurDataURL": "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAADwAwCdASoQACMAPu1mqk6ppaOiKqwBMB2JZQDM0CEl02WCiPLUx3SAAP7wT2vxxiSh+2yBHvQghyHYFQ6TOCcyWJwtzyrstbFYgGbjt9+hNtSNCUGtZr8vtgjSDO751/5BY/xHQuYuN8zvU8AAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/promises-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The promise tracker: every promise to pay with its live status from real payments, so broken and due-today promises get chased first",
    "alt": "CadenceApp promise tracker screen on desktop: The promise tracker: every promise to pay with its live status from real payments, so broken and due-today promises get chased first",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACwAQCdASoQAAoAA4BaJaQAAuP3tYSAAP73EwHZLx3SGMtOKIAAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/promises-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The promise tracker: every promise to pay with its live status from real payments, so broken and due-today promises get chased first",
    "alt": "CadenceApp promise tracker screen on a phone: The promise tracker: every promise to pay with its live status from real payments, so broken and due-today promises get chased first",
    "blurDataURL": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAAAwBACdASoQACMAPuVip02pJiOiNVgIASAciWMAzjhFm+TxyEl3P08/tIAA/vTgGad/fU1X4rBUQF1Od1J7bHjTgJSvRELxv05LAHCkKHVtCaePwb9hskVDSMoAcsl65DJ6hI/kM7n05+QWMyfxGkdJ2QLVHAAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/recovery-analytics-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Recovery analytics: cash collected, promise-kept rate, contact rate and callbacks due, from real payments and call outcomes",
    "alt": "CadenceApp recovery analytics screen on desktop: Recovery analytics: cash collected, promise-kept rate, contact rate and callbacks due, from real payments and call outcomes",
    "blurDataURL": "data:image/webp;base64,UklGRjQAAABXRUJQVlA4ICgAAADwAQCdASoQAAoAA4BaJZwAAudN/+qYwAAA/vc5fpaLIqlw8haUAAAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/recovery-analytics-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Recovery analytics: cash collected, promise-kept rate, contact rate and callbacks due, from real payments and call outcomes",
    "alt": "CadenceApp recovery analytics screen on a phone: Recovery analytics: cash collected, promise-kept rate, contact rate and callbacks due, from real payments and call outcomes",
    "blurDataURL": "data:image/webp;base64,UklGRpIAAABXRUJQVlA4IIYAAADwAwCdASoQACMAPuVmpk2pJiOiNVgIASAciUrz4AvRQoEL3/rsTFTAAP7w5adGhLwIachhq8u9w4a611bOMYvA0mv4g9F/7HrcIyHmO0B/CaN1QBImuKmZFa9CmzMvs/1aE47jqDigCsX2lCOo0PCRA47wfkYOtC0THd+6LPKNVxpvb55gAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/call-history-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Every inbound and outbound call with the agent, module, duration and outcome",
    "alt": "CadenceApp call history screen on desktop: Every inbound and outbound call with the agent, module, duration and outcome",
    "blurDataURL": "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAACwAQCdASoQAAoAA4BaJaQAAuTrYhQAAP73EwGOMy2gA7FAAAA="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/call-history-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Every inbound and outbound call with the agent, module, duration and outcome",
    "alt": "CadenceApp call history screen on a phone: Every inbound and outbound call with the agent, module, duration and outcome",
    "blurDataURL": "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAACwAwCdASoQACMAPt1gpU2opiOiNUgBEBuJZQAAmCdTxpCjJ9VuAAD+8JgPF5PEaA2ZIaJX5uOX+G6QzKabWuZ0MSbwSMFtAr7b4R0rwIwOPPRwUQ8utG9Odt9wXJAMXDOT4AAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/contacts-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "The CRM contact list, with CSV import templates and a filter, select, add to campaign and dial flow",
    "alt": "CadenceApp CRM contacts screen on desktop: The CRM contact list, with CSV import templates and a filter, select, add to campaign and dial flow",
    "blurDataURL": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADwAQCdASoQAAoAA4BaJZwAAug0wxrwAAAA/vcS9zBvP/fR9UvBEJ8yxP3BWi280wOAAA=="
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/contacts-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "The CRM contact list, with CSV import templates and a filter, select, add to campaign and dial flow",
    "alt": "CadenceApp CRM contacts screen on a phone: The CRM contact list, with CSV import templates and a filter, select, add to campaign and dial flow",
    "blurDataURL": "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAABQBACdASoQACMAPt1cpE2opSOiNUgBEBuJYwAAehu64W2dqRcMXvndOqzwAP7xzch/kyhh5QdPpQk+6llZ5RRI+oN6Q2EXgAamZjFazgX46gY0T0fkJ2bOBhTacCYnAak2fp613dhL8oEag2fVwgAA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/reports-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Sales reports: leads by source, a conversion funnel from lead to won, and the win rate",
    "alt": "CadenceApp reports screen on desktop: Sales reports: leads by source, a conversion funnel from lead to won, and the win rate",
    "blurDataURL": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAoAA4BaJaQAAudpN2laAAD+9zl9UZfrN423kuJQ2mF/TmeleXzTDWz/6BwA"
  },
  {
    "slug": "cadenceapp",
    "file": "/products/cadenceapp/reports-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Sales reports: leads by source, a conversion funnel from lead to won, and the win rate",
    "alt": "CadenceApp reports screen on a phone: Sales reports: leads by source, a conversion funnel from lead to won, and the win rate",
    "blurDataURL": "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAABQBACdASoQACMAPu1cqE2ppKOiNVgIATAdiUAZQA7T+Zqm/hDHnfpXwe+AAP79MZ1sOOaiENCBCpaURtFZjPR5hqfk2ZdkmvWkdsDzQLbTxtelr1kjjVCoEb8bcxf9P7DVNBO8vT8pXqL2Kn/R3Klb2vsAh+7yeEky9eMpFAH1A8vjUU9H7EM4AAA="
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
    "file": "/products/confilearn/catalog-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Trending courses, top tutors and a sticky search bar to find the right course fast",
    "alt": "ConfiLearn course catalog screen on desktop: Trending courses, top tutors and a sticky search bar to find the right course fast",
    "blurDataURL": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoQAAoAA4BaJZwAAudCffWcYAAA/vP53sr+H6yCZfE8WRluU9Xbdf5qw43Hfxy0gxySAyHR4W6xpLFCNpUiRJnDA7+wyJZ05xLwAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/catalog-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Trending courses, top tutors and a sticky search bar to find the right course fast",
    "alt": "ConfiLearn course catalog screen on a phone: Trending courses, top tutors and a sticky search bar to find the right course fast",
    "blurDataURL": "data:image/webp;base64,UklGRqoAAABXRUJQVlA4IJ4AAAAwBACdASoQACMAPt1Yo02opSMiNUgBEBuJQBhuBQ5RyZnlPJm4dnhT3QAA/vHpl/a4vghvjpx1WFpnNG0E77wxqZntM8uzeYf7KJOAr+yrCEFlyFO+CLH4rm5LDR1cfd1VLo8ZsMvabAobwUVcttGhC/c0Uk6w2wG+gGE6SAAOOq5uNUdG/67t1C0gP9WIpdx+f8QgPmXN0NTJI4AAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/course-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Lesson video, progress ring, curriculum and a certificate path, shown for Kiswahili for Business",
    "alt": "ConfiLearn course player screen on desktop: Lesson video, progress ring, curriculum and a certificate path, shown for Kiswahili for Business",
    "blurDataURL": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAQCdASoQAAoAA4BaJbACdAEN23X0y4AA/vQSC7lQjQI672ACrwE2WLzX37rZaYkofX7Nkbg0JcHk5WiHNL6j8IzdIthjC+YneW7a1yei3ko6SRreNAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/course-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Lesson video, progress ring, curriculum and a certificate path, shown for Kiswahili for Business",
    "alt": "ConfiLearn course player screen on a phone: Lesson video, progress ring, curriculum and a certificate path, shown for Kiswahili for Business",
    "blurDataURL": "data:image/webp;base64,UklGRrIAAABXRUJQVlA4IKYAAAAwBACdASoQACMAPt1cpE2opSOiNUgBEBuJZgCuHC+/cfi8DHxAQKkTjMAA/vHhH/w84zAktG0E0lmT8Y66MVJEx+HfjciLkq8Ii1qqaqHupFaxyBlzTpZlID0Lrdngye16jMH6EA8RP6D6O5LaksuIzNMrLymIo+AeVLnxrrmxAOvzFSI6NNURJ5YR4E7zp8Wg1eMh6xUm+xXEMpjEbrdFqpNvAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/quiz-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "An authored CAT shown inside the lesson, right where the learner studies",
    "alt": "ConfiLearn lesson quiz screen on desktop: An authored CAT shown inside the lesson, right where the learner studies",
    "blurDataURL": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAADQAQCdASoQAAoAA4BaJQBOgCGwgpU8AAD+9VhlGT5knpGfVu9R5gPebr5VupU/H/R1DrnOOJoq4VuFA3kPvaxPBQAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/quiz-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "An authored CAT shown inside the lesson, right where the learner studies",
    "alt": "ConfiLearn lesson quiz screen on a phone: An authored CAT shown inside the lesson, right where the learner studies",
    "blurDataURL": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAADQBACdASoQACMAPu1kqk6ppaOiKqwBMB2JYgDE2Bff9O4DgmhCfGrEGxQo+KplIAD+79gpa7Xc9xiz96QnHHbjSiqJyB4LJJ/pm5Z35SeTt8MW6fDj2MDXKF4BDxMOKFpiopLmiprdInaOYx/HxWXbrfCvzbLssuNQabVlS0gpH+4h5zH8JK9Fc8a5Mb7uiZWC2JTXoPZ057hfwAA="
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
    "file": "/products/confilearn/my-results-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Learners see each returned mark, the tutor comment, the overall grade and a slip download",
    "alt": "ConfiLearn my results screen on desktop: Learners see each returned mark, the tutor comment, the overall grade and a slip download",
    "blurDataURL": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAABQAQCdASoQAAoAA4BaJZwABDOAAP7zYUakYmlS+aqdTOr4uYOGz/vqPd2tNr+CmAgAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/my-results-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Learners see each returned mark, the tutor comment, the overall grade and a slip download",
    "alt": "ConfiLearn my results screen on a phone: Learners see each returned mark, the tutor comment, the overall grade and a slip download",
    "blurDataURL": "data:image/webp;base64,UklGRngAAABXRUJQVlA4IGwAAADQAwCdASoQACMAPu1orFCppaQiqqgBMB2JZwDCgBJN0xaIpAbXrYAA/u2DPmoN9xTlDiCV5EokBn+HFk9r3RaGfsJi3igBr6lbJ8zDRfGWu8kgIPZ4GRDmf1Vdjln8bTM87Hi8pkwegVCYAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/certificate-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "A verified certificate of completion with a public verification code",
    "alt": "ConfiLearn certificate screen on desktop: A verified certificate of completion with a public verification code",
    "blurDataURL": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAoAA4BaJZwAAuqYErlUgAD+9xL+GJg/OOXtcJ1cRYXssWl988DaOXs/aq4gvmqxfXAAAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/certificate-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "A verified certificate of completion with a public verification code",
    "alt": "ConfiLearn certificate screen on a phone: A verified certificate of completion with a public verification code",
    "blurDataURL": "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQBACdASoQACMAPu1kq04ppaQiKqwBMB2JZwDKABfa++2XfHVAl2OcWxAAAP7v4u5KFMvaDpX0oc8eVkPvnjQg1l2+HSzgRsAQn5gRAyyOtQpArUNf+zzIULUHmS/nCHjQzOIXqta3uqUWmUAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/find-a-tutor-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Search verified tutors by subject, level, language and price",
    "alt": "ConfiLearn find a tutor screen on desktop: Search verified tutors by subject, level, language and price",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAoAA4BaJYwC7AEQFDFt4ADifsNy6SwIiAiS5plUDYRuM+BgqEaSr4fe0qMkbKAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/find-a-tutor-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Search verified tutors by subject, level, language and price",
    "alt": "ConfiLearn find a tutor screen on a phone: Search verified tutors by subject, level, language and price",
    "blurDataURL": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAABwAwCdASoQACMAPu1qrVEppaQiqqgBMB2JZwDE2BZ3X9mn+AAA99+Je12bJChijNQb+5LVob3JqFhQc0tAXI0Oi8ZoxwgR4+z/SBJRIqrD/QUwN/cNc3VKHhoAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/marking-queue-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Submitted work waiting for a mark, scored per criterion against a rubric",
    "alt": "ConfiLearn tutor marking queue screen on desktop: Submitted work waiting for a mark, scored per criterion against a rubric",
    "blurDataURL": "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAADQAQCdASoQAAoAA4BaJZwAAvreHWUiAAD+9xMCTFJ8g2HEEtvf59HmP3mgAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/marking-queue-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Submitted work waiting for a mark, scored per criterion against a rubric",
    "alt": "ConfiLearn tutor marking queue screen on a phone: Submitted work waiting for a mark, scored per criterion against a rubric",
    "blurDataURL": "data:image/webp;base64,UklGRnwAAABXRUJQVlA4IHAAAABwAwCdASoQACMAPu1kqU6ppaOiKqwBMB2JZQDDNBzE23u5QyAA/u/Zbx79xVkFOyNXmZX1aho5XL49o+MeVxrQ3Ukew0FdK3HAhtn2DBX9L/UgBx6oARPh2hcXo013lDfdy43oLlMt3dMG44nJwAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/gradebook-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Set the weights for assignments, CATs, exams and quizzes, plus the KCSE grade scale and term label",
    "alt": "ConfiLearn gradebook screen on desktop: Set the weights for assignments, CATs, exams and quizzes, plus the KCSE grade scale and term label",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAADQAQCdASoQAAoAA4BaJZwAAvrd4s6nAAD+9xMCTFJ1wVrtaQhrjr2gEAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/gradebook-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Set the weights for assignments, CATs, exams and quizzes, plus the KCSE grade scale and term label",
    "alt": "ConfiLearn gradebook screen on a phone: Set the weights for assignments, CATs, exams and quizzes, plus the KCSE grade scale and term label",
    "blurDataURL": "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAABwAwCdASoQACMAPu1kqU6ppaOiKqwBMB2JZwDDNBzE24cXNIAA/u/Zbx79xVkFOyNXmZX1aho5XXnWlhGCJWYO/T37X55P2HzWt5lkMYb3kzLfy0G4JjGw9aDCvzU4uQbWA5eIVYAPGehS2uSbpLWuh+AAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/results-slip-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "A printable PDF report with the weighting, overall grade, tutor remark and a verify code",
    "alt": "ConfiLearn results slip screen on desktop: A printable PDF report with the weighting, overall grade, tutor remark and a verify code",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAQCdASoQAAoAA4BaJaQAAvmGF9xAAP73EP4aq1UXzgcpuWrQJNhwAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/results-slip-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 844,
    "caption": "A printable PDF report with the weighting, overall grade, tutor remark and a verify code",
    "alt": "ConfiLearn results slip screen on a phone: A printable PDF report with the weighting, overall grade, tutor remark and a verify code",
    "blurDataURL": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAABQAwCdASoQACMAPu1qrFEppaQiqqgBMB2JZwDLpBZa79rkAAD+lQW2BobjA9qAWcWzGdbSRj/xit3GD3XLLjJx5uSBZcZI3kzbAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/results-verify-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Anyone can confirm a results slip is genuine using its code",
    "alt": "ConfiLearn results verification screen on desktop: Anyone can confirm a results slip is genuine using its code",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAQCdASoQAAoAA4BaJZwAAud+iJSsAP73EvcxFmHMqJ9sCVEjFiaWBAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/results-verify-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Anyone can confirm a results slip is genuine using its code",
    "alt": "ConfiLearn results verification screen on a phone: Anyone can confirm a results slip is genuine using its code",
    "blurDataURL": "data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAADQAwCdASoQACMAPu1qrVCppaQiqqgBMB2JaQAAOs3bxD8K8Qs2xAAA/u1iNpVLG4jIzO5dz2ysXq22SgaZhbZQzFWeSxGrnEVplrvR1a1Ex/lpXSW4QBGjY4AAAA=="
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
    "slug": "confilearn",
    "file": "/products/confilearn/school-01-home-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1852,
    "caption": "School admin home: next-step card, my day, notices, stats and the setup checklist",
    "alt": "ConfiLearn school home screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAgCdASoQABcAPu1iqU2ppaOiMAgBMB2JZwDA3C0kAAD+8IBfqna21YrJHi+PjwBCUyqzbPI4h1x6PpYkIzBheAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-01-home-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3157,
    "caption": "School admin home: next-step card, my day, notices, stats and the setup checklist",
    "alt": "ConfiLearn school home screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAABQBwCdASoQAIIAPu1mqlGppSOiqrVcATAdiWUAz2WJkArSqLtXILZaHPquUR3ZazDOamxoxzWtH03fF7nnU6ylpuLwAP7tYjLWcCZ8NKTtLUZAB1eRBrp5GLQhFQ/CVpb3lXAcLP/LJ2b1Gt8U5RBu3PCQlZTiRiHX1svMvX1c395SoCV+umcvrLnaBnhl8k7VqcG1vf3mcWFVji6b5i51c0Z59wEZVrRIYSxRYZpXNM28AbII6eJRWcnMrHN4NIECMt2WpfS1En0kzFg+vdCxwEgCC+3oNtwgjZEYQYj5nAianjVQ3P2YRyj4y1BNSJJKrqA4pVM3Qd1KGJAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-02-structure-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1902,
    "caption": "Set up years, terms, grades and streams",
    "alt": "ConfiLearn school structure screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAwCdASoQABgAPu1iqU2ppaOiMAgBMB2JZwC+SDKHHiAA/vCXGx/6ennKo8Aoa/8JhTwHPHsjWck2H48QASQAAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-02-structure-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3370,
    "caption": "Set up years, terms, grades and streams",
    "alt": "ConfiLearn school structure screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRioBAABXRUJQVlA4IB4BAABwBwCdASoQAIoAPu1mrE4ppaSiKqwBMB2JZWASkHPIs7H/8CE6XItE+jWSDOGj0yinU7Ef71OHaUGutJ4K2qffRbjiAAD+7WIxEWmKwyqerXcpzflnf3MKEbcRrCQ6l4rSdOWUTOZ1hSA6alABUQPFqI/NbOrNpXJPTFNavv4mzaU8YLXyody/pfCWwXsWoffgbxCUszI8YII+Ij2tx1v1bTBeI/48S/QOP5kFbywhuHJpFN5Myxa5v1fr4bwgB3KATaW22NeDjAtiN7PnCjFu1AS8wJCaytEHz4gFni+VnQHg6rmwcytrZmxApjJ/VAkKHOB1O9AO3a2bkZTYOsyCV7uA+yrWKlRiCKJsSmcuE540e3RrnzGRlqYA/+AA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-03-people-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1991,
    "caption": "Learner list with parent invites, fee payments and bulk invites",
    "alt": "ConfiLearn school people screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAgCdASoQABkAPu1iqk2ppaQmMAgBMB2JZwDCgC0kAAD+8JZhBxmQNswDLA2y/5bR+oZkdj1wAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-03-people-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3600,
    "caption": "Learner list with parent invites, fee payments and bulk invites",
    "alt": "ConfiLearn school people screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRgQBAABXRUJQVlA4IPgAAADQBgCdASoQAJYAPu1sr1OppSQipngJATAdiWdojSudIHxPBCwFoHzFGZ0meTWZHSRvnasds1NXgd5i+doCWuAA/u1iMNCaS61ftNF43laehEbMkWb6WhNY4MSeEzafZelUsX9XBEABqGXNmRDULXFr2DKhwppmsF8uDW5sNa3drgSQTdQobdag2RAv6PxeirzBaxNeficoIrDI3DzAFy9+i3nxUXUMLlXfUGjV5yvi1mbWSHfQa4CmxKvKTPgWyp2WMM6nAnug50T1hm9mA9ulfLvBiq+K16DF0rHoiFyt27bf98IJ9w9PMlUQYnRo4oq/g6A4ESIAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-04-invite-flow-desktop.webp",
    "device": "desktop",
    "width": 1136,
    "height": 749,
    "caption": "Invite staff and parents by email or phone and track each invite",
    "alt": "ConfiLearn invite people screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAAAwAQCdASoQAAsAA4BaJZwAA3AA/vSAAkjWM9xN8CAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-04-invite-flow-mobile.webp",
    "device": "mobile",
    "width": 358,
    "height": 1099,
    "caption": "Invite staff and parents by email or phone and track each invite",
    "alt": "ConfiLearn invite people screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAADQBACdASoQADEAPu1qrVCppaQiqAqpMB2JZwDMWBEPt2Lv7TpgL/lvd6l42RWcAAD+7+JXOm6A8QLhb0MZs4fP453SlXE94mRlMyDj0Xi7YvQP45CQATgydJAu9/VAbEdEBpYLHg62jSYiSyUmBXnXMfnCXatI5s66b7CTb1vAGo2dZlW1OfixyDpiAAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-04c-invite-join-preview-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 978,
    "caption": "Invitees see the school and their role before joining",
    "alt": "ConfiLearn invite join preview screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAACQAwCdASoQACgAPt1cpE2opSOiNUgBEBuJZAC7ACa+ItU+NYlMAP7v2CzZ2FUyVadQ6hmBb8aeqNZ+jhGfAF/jg6cNBo5HPahBCF2iTxI5K1mHIxtluUL5vXy2bH5gvlAN7eWGGjLz6PZa4PyHh02XSgXGaAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-04d-invite-accepted-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1484,
    "caption": "Accepted invites land straight in the school",
    "alt": "ConfiLearn invite accepted screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAAAQAwCdASoQABMAPu1iqk2ppaQiMAgBMB2JZ2fkVLMV8gAA/vCAawWZkYyBqmz6H2zAGThjRX25zxKaUAAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-05-timetable-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1232,
    "caption": "Weekly timetable by stream",
    "alt": "ConfiLearn timetable screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACwAQCdASoQAA8AA4BaJZwAAtz1Ja/wAP73DvtOoUE31cY5IVxNSPTA4QVbYAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-05-timetable-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3061,
    "caption": "Weekly timetable by stream",
    "alt": "ConfiLearn timetable screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAAAwBgCdASoQAH4APu1yrlOppqOipApJMB2JZwDRvAiOe+b44Vowzr3+7nblIci/cefgZUSKYPzTA8AAAP7tYjDQmkutX7TReQ/Z14nODqIVo0ZF+ZfOei3lS6ePvV5e6BrNt0pLj9wNAI40VlBRk810COOfxfE71uD8d4yOym+X56gvkAbnEa6jeSes7Y1uPbpMCA4z1DeZQYQ6Ax58BrgYSKUqIf+cNFCJa7jguq2A50lZznnXxaQVbw0AAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-06-admissions-pipeline-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 932,
    "caption": "Admissions pipeline: applications grouped by status",
    "alt": "ConfiLearn admissions pipeline screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjgAAABXRUJQVlA4ICwAAACwAQCdASoQAAwAA4BaJZwAAudPqKvAAP73B2VxdOYfIkO1Y4omtTaBbmQAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-06-admissions-pipeline-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1592,
    "caption": "Admissions pipeline: applications grouped by status",
    "alt": "ConfiLearn admissions pipeline screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABQAwCdASoQAEEAPu1oqlAppaOipm35MB2JZ2iTXKuHlTO6AAD+8C73dBVpGr2DNs2PgRkC1UiY6GPrA0UJMwkNQYiMK/BsKGHw0gZ+1TbrnL8DJ+cBPVaGqhfvGdjQBCeNW1prbtjfTdF6t29OEM6RSAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-07-public-apply-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1082,
    "caption": "Public application form: a branded 4-step wizard",
    "alt": "ConfiLearn online application screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAABwAQCdASoQAA4AA4BaJZwC7AF1AAD+85hiwPnZvCzfy7oq04AAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-07-public-apply-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1652,
    "caption": "Public application form: a branded 4-step wizard",
    "alt": "ConfiLearn online application screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRqQAAABXRUJQVlA4IJgAAAAQBQCdASoQAEQAPu1qrE+ppiQiLMgBMB2JZQC5IBsp20O/2A3DH7OMCnTGoVTpMgQAAP7tbs6IG3J+NjNFkIipGTn3vEcwSU1wy5utQx8ySl6BHrnae0Qpo6/dY4NV4CBDBHc4ZALy2uMy/Dgh9JiByaA9j1gYToJfl8OMcuAtHL5NzbTvHnxg4pSS+HowTIrE7zkC7fNAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-08-status-page-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Applicants check their application status online",
    "alt": "ConfiLearn application status screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoQAAoAA4BaJZwABAAAAP7zXI/Fex8q5YD+Y0YLiNwEAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-08-status-page-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 920,
    "caption": "Applicants check their application status online",
    "alt": "ConfiLearn application status screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAQBACdASoQACYAPt1Yo02opSMiNUgBEBuJYwCw7C+rWboCKTDXQ/wYgAD+7/naPdpFfd/ugWw2vXm2TaZBYsQZ0SeQAxMEWVz635cmOBgx2yuw2gsV91+wWcJCttmWIbmT2eIGYGUmqAAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-09-attendance-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 988,
    "caption": "Take the class register in a few taps",
    "alt": "ConfiLearn attendance screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAQAgCdASoQAAwAA4BaJZgC7AYqNwn3DJvAAP73CP6exoebAwsDqRtXdbxYDgyqHfBEapGrb8WAXpETrjHzEaJ6AAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-09-attendance-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1543,
    "caption": "Take the class register in a few taps",
    "alt": "ConfiLearn attendance screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRt4AAABXRUJQVlA4INIAAADwBQCdASoQAD8APtFYok2oJSMiN+gBABoJTB1rPMMA3jA5qzDJhLMZpc13djZKMEo7TxPJ/O6AUAD+8PRufu8TOJw4On+UybhtGPBDEDir7YVacJAF3WrwnieLOwNVsI+Hrc/U4HaOK6OxC1mM4Gi17HwHGU+ePJc05gHRQPr8QPCk89VMQC5Me0mb28NWb/4hFpF0hzOWjiG/MQmjlNs/8+hh25eXMnafzr+c/U6GDF7UQKC5D6CDOF6e0ssgZa8i1rcOuWCNxBtgy0vTvI3gAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-10-analytics-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 2400,
    "caption": "School analytics: admissions, enrolment, attendance and fees",
    "alt": "ConfiLearn school analytics screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRpgAAABXRUJQVlA4IIwAAADwAwCdASoQAB8APu1iqU2ppaQiMAgBMB2JQBdiP/wXgc4p7L/DKrIAAP79fa5cMaGTzIFStrUql8YlDz02W1W8Un3N08Q17U7t/UZPDxF78Xa5xCro75VAuM2YqMefSkLyJQXj86QKym5oKQFpJsB8KPTgzz51c5CCv3Q63FN9Bb5DVCjm8CkKCcBQAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-10-analytics-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3600,
    "caption": "School analytics: admissions, enrolment, attendance and fees",
    "alt": "ConfiLearn school analytics screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRmoCAABXRUJQVlA4IF4CAADQDQCdASoQAOUAPuVepU2pJSOiNVZrMSAciWYAwJhilP4B+2p55nTdN5DaZHtNlwQ/TQpa8NjVQBJByLSBga4TcbPWzIhpGf1Yho+h/yqS1AUl7l84aXY1w4c3ENmXQ3pMf+Jjzvvsh1woi2M1okCa7urK//WxIAD+84OCOHWa5ka7dULKucB5Z4f4Y4Nxbse7fq3EcTsJE1XiFu2zYz90thlrkg+IrcPcQF3a6rHeQMJmPNWtZUIgd1jDoHKuP7MKeghrg7MJpJ4pDEbCU8VHSi4Bn9AFT9d6/52xEoMIu2YzE4a3uuBxJHp2bu2VR1WFM2+RzWtQHndIIoLsNVNQm3qeE+nc0QKP4QejZYZ1XchRP6EH01/KLYmdiqncxmDd2+8YLKwXaBNv6BHS5jL2F2USuzBH4RE9uD/8XGPSHGqW529UJhbjHFGzH63yn+EzpoWThrjIqOnqv5MkkXRXQ9T/Njdas1+7DkJm6qnOyaPIAqc3veAuoN8dH7HnCEL/x3fWHqk5Bc/L3uWvgAbFuHcUU28MEc1Q87PSbWibwmMcGaiFly2AB+dcjKkLKwFZVjgLNA+rP5wh1k85LBoBvJ2oXzCQONKuZ8VB8ch8Ecs/CUMjPDr8i4vliklu3u3FwyeJmZaXejfU0KVPd/9Vu73Z6yIcDlonAO1NFXs/Q71YUAoCepOt77kf9jurTIXPX4GU1ipnpdGzdGgerySii1Tga/oWG6BRtSq7klCMsdMBmW/Oy/Qn0giIcZBFFpmSr9Dtje0kFx5Yumo0TGDjw57Wu/9ztj5yHQcagAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-11-branding-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 925,
    "caption": "Pick the school's brand colour and logo",
    "alt": "ConfiLearn school branding screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADwAQCdASoQAAwAA4BaJZwAAudmXQhyPgAA/vcFakDJXSaJ3GIv+Dq/ZdIa7vBnnQoAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-11-branding-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1899,
    "caption": "Pick the school's brand colour and logo",
    "alt": "ConfiLearn school branding screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRsgAAABXRUJQVlA4ILwAAAAQBQCdASoQAE4APuFgpk2opaOiMygBEBwJY1nyWPaQsCswsBZRIDV4n0gTT4+jcTGAAP7wfNl9qZ0rFksBqPtycIBvgcKy4rzNZwfVjiXFX9Ly612ftJ3IqkbumDYoBNVyE1ysq8dOFtAkCKK8GjVtU7ZRTPHyzyy37SSLETmaF+3Ugfm3gwRkXa+SbNHCy1atJrUSC8fKou3Bgeyn3pgE45Prnv3DOTKGo7S5l7CfCaMGpV9weKVd2IAAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-12-landing-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Public school page with admissions, classes offered and sign-in",
    "alt": "ConfiLearn school landing page screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAABQAQCdASoQAAoAA4BaJZwABAAAAP7zXN+cx2JOPHywKn3FE21CAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-12-landing-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1090,
    "caption": "Public school page with admissions, classes offered and sign-in",
    "alt": "ConfiLearn school landing page screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAACwBACdASoQAC0APt1epU2opaOiNUgBEBuJYwC4MC+rCPY5oe0QiKgiD+YNtb6AAP7v+do92lNyDfTBW79c2sivquAwRSWJGLr7d+zuZuZEa6zaWK1n6c3T1e6OBXmVC5864gPybkrdneaIQigy0O6Jy3LUAMYZ99mV7+W8yC7oAzGxZyba4AOGAAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-13-guardian-portal-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1529,
    "caption": "Guardian portal: attendance, fee balance, latest report card and today's lessons",
    "alt": "ConfiLearn guardian portal screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAgCdASoQABMAPu1iqU2ppaQiMAgBMB2JZwC7ADKUAAD+8Jc1S1lUhDBtMEIlygAtTagTgAA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-13-guardian-portal-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 2175,
    "caption": "Guardian portal: attendance, fee balance, latest report card and today's lessons",
    "alt": "ConfiLearn guardian portal screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRs4AAABXRUJQVlA4IMIAAADQBQCdASoQAFkAPu1or1KppSQiqrgIATAdiWcAzUgLK2Jaoyz7+G/Iuvy0GJbrYQKEBQL8Y/oAAP7tYjERaYrDKp6r4ZaTjdcp1nZl6ytg7x05VgXc3h/5vYCzxRkvbubcbyNiGfKycESfJCrfTO+U+ZI+VACiaOegSSx+x1xiFCfVsHBvJ3pLCrQE0QGUGc8ibsKwW+ceBaeXRYIcUsVDAODaNOum9puYNZgyIvmIVEVd1EBYLC8r8PnKPB6o+jQAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-14-teacher-today-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 1745,
    "caption": "Teacher's day: lessons, registers to take and quick links",
    "alt": "ConfiLearn teacher today screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAAAQAwCdASoQABYAPu1iqk2ppaQiMAgBMB2JZw22BWBxN0AA/vCWxwl25OdERKDPdcnBegb3LQ63f8bx2w4iGwAA"
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-14-teacher-today-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 3071,
    "caption": "Teacher's day: lessons, registers to take and quick links",
    "alt": "ConfiLearn teacher today screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRgoBAABXRUJQVlA4IP4AAABwBwCdASoQAH4APu1qr1KppSQiqBgJWTAdiWcAzrW59oyA8k/LxTyEGlevAB/qrala272ZwEIBlAMw6j677YbUnjpp2AD+7WKNBmYgx1IanEkM+oKXaTrzO9Ix6Jy71++ij6p+4azvw0nT9TYS+B/HoPxx5gyee2yVfJy1I9rhu49hDaG5EaEAkYO4f8Z4ohAPrEM0O5Sn3z4wUiKL4KZyNqbZxgdRVkQCrHbO1LXTJRtpCOTlS/vWu9lYwkN5wG1zbBIgqshPXG/ZFvT8DdAlnh8FwAYlC/j/t3KnaILgtbDDzX7Q3tXrCVIJLkgQiXy+4a9tm7PRXfV4MmgAAA=="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-15-admin-all-schools-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 852,
    "caption": "Platform admin overview of all schools, read-only",
    "alt": "ConfiLearn all schools screen on desktop (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACQAQCdASoQAAsAA4BaJZ2HgU0AqkAA/vMYla5Y6ER6etmajb6ctiiM+AA="
  },
  {
    "slug": "confilearn",
    "file": "/products/confilearn/school-15-admin-all-schools-mobile.webp",
    "device": "mobile",
    "width": 390,
    "height": 1565,
    "caption": "Platform admin overview of all schools, read-only",
    "alt": "ConfiLearn all schools screen on mobile (Mwangaza Demo Academy, demo data)",
    "blurDataURL": "data:image/webp;base64,UklGRogAAABXRUJQVlA4IHwAAABQBACdASoQAEAAPu1mqk8ppaOiKA1RMB2JZ2VuWPGLGxFTkA5irolMt1dgAP7v8yWb6RDYlOzu1PiTL/xUrNbgWUsdAzTDbUK2E/XI0y8xGP4OsZMeynddFSkPrVvWXo0c7TEDjg6oXXcCsFAoW7y/OYRGf7Ul5VWg9HAA"
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
    "file": "/products/lookfinesse/staff-shifts-desktop.webp",
    "device": "desktop",
    "width": 1280,
    "height": 800,
    "caption": "Staff roster with roles and commission, weekly shifts, time off and booking slot generation",
    "alt": "LookFinesse team and schedule screen on desktop: Staff roster with roles and commission, weekly shifts, time off and booking slot generation",
    "blurDataURL": "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAACwAQCdASoQAAoAA4BaJaQAAuQpQHoAAP74djNyf2A5yEZ6c/8cfhgT/K9+q4UAAAA="
  },
  {
    "slug": "lookfinesse",
    "file": "/products/lookfinesse/staff-shifts-mobile.webp",
    "device": "mobile",
    "width": 600,
    "height": 1298,
    "caption": "Staff roster with roles and commission, weekly shifts, time off and booking slot generation",
    "alt": "LookFinesse team and schedule screen on a phone: Staff roster with roles and commission, weekly shifts, time off and booking slot generation",
    "blurDataURL": "data:image/webp;base64,UklGRrYAAABXRUJQVlA4IKoAAACwBACdASoQACMAPu1orFCppaQiqqgBMB2JaQALAEcAakXDfPZgpUKtaDe0jCMAAP78Yn4lhxevCxqH7zfiVjhr69z6tehhY6PjbE/l0mqKE6ctCodVgrWTwQ+KrJW0jRldXqHmtJtMJjf7wHTqmRYYLd7iv86MEiHvjSYhAS6wpf0eFbXRlFUpmfBQtsTX1Eeltf8rRddl/gX0RvEq7f4XizIn1FPe9/gAAA=="
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
