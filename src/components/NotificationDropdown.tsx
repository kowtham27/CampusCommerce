"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { cn, formatRelativeTime } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  type?: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string | null;
};

export function NotificationDropdown({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/notifications/${id}/read`, { method: "POST" }).catch(() => {});
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3.5 py-3">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">{unread} unread</span>
          )}
        </div>
        <DropdownMenuSeparator className="mt-0" />
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No notifications yet" />
            </div>
          ) : (
            items.slice(0, 8).map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-muted",
                  !n.read && "bg-primary-tint/40"
                )}
              >
                <div className="flex w-full items-center gap-1.5">
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                </div>
                <span className="line-clamp-1 text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="mb-0" />
        <Link
          href="/notifications"
          className="block px-3.5 py-2.5 text-center text-sm font-medium text-primary hover:bg-surface-muted"
        >
          View all
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
