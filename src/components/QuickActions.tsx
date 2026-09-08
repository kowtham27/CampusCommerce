import Link from "next/link";
import { ShoppingBag, Tag, Repeat, ArrowLeftRight } from "lucide-react";

const ACTIONS = [
  { href: "/explore", label: "Buy", icon: ShoppingBag },
  { href: "/sell", label: "Sell", icon: Tag },
  { href: "/rent", label: "Rent", icon: Repeat },
  { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary-tint"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary">
            <a.icon size={16} />
          </span>
          <span className="text-xs font-medium text-foreground">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}
