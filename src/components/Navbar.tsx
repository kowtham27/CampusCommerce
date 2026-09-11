import Link from "next/link";
import { Suspense } from "react";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { SearchBar } from "@/components/SearchBar";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/rent", label: "Rent" },
  { href: "/exchange", label: "Exchange" },
];

export async function Navbar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [notifications, unreadMessages] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.message.count({
      where: {
        read: false,
        senderId: { not: user.id },
        conversation: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
      },
    }),
  ]);

  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/dashboard" className="shrink-0">
          <Logo />
        </Link>

        <nav className="flex shrink-0 items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="max-w-md flex-1">
          <Suspense fallback={<div className="h-10 rounded-md bg-surface-muted" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
            aria-label="Wishlist"
          >
            <Heart size={18} />
          </Link>
          <NotificationDropdown
            initial={notifications.map((n) => ({
              id: n.id,
              type: n.type,
              title: n.title,
              body: n.body,
              read: n.read,
              createdAt: n.createdAt.toISOString(),
              link: n.link,
            }))}
          />
          <Link
            href="/messages"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
            aria-label="Messages"
          >
            <MessageCircle size={18} />
            {unreadMessages > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
            )}
          </Link>

          <div className="mx-1 h-6 w-px bg-border" />

          <Button asChild size="sm">
            <Link href="/sell"><ShoppingBag size={14} /> Sell an Item</Link>
          </Button>

          <ProfileMenu
            userId={user.id}
            fullName={user.fullName}
            email={user.email}
            avatarUrl={user.avatarUrl}
            isAdmin={user.role === "ADMIN"}
          />
        </div>
      </div>
    </header>
  );
}
