"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Package,
  ShoppingBag,
  Repeat,
  Settings,
  LogOut,
  ShieldCheck,
  LifeBuoy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";

export function ProfileMenu({
  userId,
  fullName,
  email,
  isAdmin,
}: {
  userId: string;
  fullName: string;
  email: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <UserAvatar email={email} className="h-8 w-8" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-sm font-semibold text-foreground">{fullName}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/profile/${userId}`}><UserIcon size={15} /> Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-listings"><Package size={15} /> My Listings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders"><ShoppingBag size={15} /> Orders</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/rentals"><Repeat size={15} /> Rentals</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings"><Settings size={15} /> Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/safety"><LifeBuoy size={15} /> Safety Center</Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin"><ShieldCheck size={15} /> Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut size={15} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
