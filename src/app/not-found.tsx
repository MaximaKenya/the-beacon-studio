import Link from "next/link";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { siteConfig } from "@/data/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book a call" },
  { href: "/automations", label: "Automations" },
  { href: "/work/confirent", label: "ConfiRent" },
  { href: "/work/cadenceapp", label: "CadenceApp" },
];

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
      <div className="sleek-card w-full max-w-lg rounded-3xl px-8 py-10 text-center">
        <BeaconMark size={84} className="mx-auto" />
        <p className="mt-6 text-sm font-medium text-accent">404</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-heading">This page is not on the map</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {siteConfig.brand.name} could not find that address. Try one of these.
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated px-4 text-sm font-semibold text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
