"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  Tag,
  MessageCircle,
  Repeat,
  ArrowLeftRight,
  Star,
  Package,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { NotificationItem } from "@/components/NotificationDropdown";

const ICONS: Record<string, LucideIcon> = {
  OFFER_RECEIVED: Tag,
  OFFER_ACCEPTED: Tag,
  OFFER_REJECTED: Tag,
  OFFER_COUNTERED: Tag,
  LISTING_VIEWS: Package,
  EXCHANGE_REQUEST: ArrowLeftRight,
  EXCHANGE_ACCEPTED: ArrowLeftRight,
  RENTAL_REQUEST: Repeat,
  RENTAL_APPROVED: Repeat,
  NEW_MESSAGE: MessageCircle,
  ORDER_UPDATE: Package,
  REVIEW_RECEIVED: Star,
  SYSTEM: Bell,
};

export function NotificationsList({ initial }: { initial: NotificationItem[] }) {
  const [items, setItems] = useState(initial);

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Couldn't mark all as read.");
    }
  }

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    fetch(`/api/notifications/${id}/read`, { method: "POST" }).catch(() => {});
  }

  if (items.length === 0) {
    return <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates about offers, orders, and messages here." />;
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all as read</Button>
        </div>
      )}
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {items.map((n) => {
          const Icon = ICONS[n.type ?? ""] ?? Bell;
          const content = (
            <div
              className={cn(
                "flex items-start gap-3 p-3.5 transition-colors hover:bg-surface-muted",
                !n.read && "bg-primary-tint/40"
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
              </div>
            </div>
          );

          return n.link ? (
            <Link key={n.id} href={n.link} onClick={() => markRead(n.id)}>{content}</Link>
          ) : (
            <button key={n.id} onClick={() => markRead(n.id)} className="block w-full text-left">{content}</button>
          );
        })}
      </div>
    </div>
  );
}
