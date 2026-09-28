"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
  Users,
  Package,
  Flag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function AdminMobileMenu() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Admin menu"
      >
        <Menu size={18} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {NAV.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}><item.icon size={15} /> {item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard"><ArrowLeft size={15} /> Back to marketplace</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut size={15} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
