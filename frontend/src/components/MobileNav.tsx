"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/sell", label: "Sell", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile/me", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href) || (item.href === "/profile/me" && pathname.startsWith("/profile"));
        const isSell = item.href === "/sell";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center",
                isSell && "-mt-5 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-md"
              )}
            >
              <item.icon size={isSell ? 20 : 18} />
            </span>
            {!isSell && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
