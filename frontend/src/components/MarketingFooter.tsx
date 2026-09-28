import Link from "next/link";
import { Logo } from "@/components/Logo";

const columns = [
  {
    title: "Marketplace",
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Rent", href: "/rent" },
      { label: "Exchange", href: "/exchange" },
      { label: "Sell an item", href: "/sell" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Safety Center", href: "/safety" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            A private marketplace for verified students to buy, sell, rent and exchange
            everything they need on campus.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground sm:px-8">
        © {new Date().getFullYear()} Campus Commerce. Built for university communities.
      </div>
    </footer>
  );
}
