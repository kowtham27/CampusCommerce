import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsForUser } from "@/services/messagingService";
import { EmptyState } from "@/components/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatRelativeTime, initials } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const conversations = await getConversationsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No conversations yet"
          description="Message a seller from a product page to start chatting."
          actionLabel="Explore Marketplace"
          actionHref="/explore"
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-muted"
            >
              <Avatar className="h-11 w-11">
                <AvatarImage src={c.other.avatarUrl ?? undefined} />
                <AvatarFallback>{initials(c.other.fullName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{c.other.fullName}</p>
                  {c.lastMessage && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeTime(c.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {c.product && <p className="truncate text-xs text-muted-foreground">{c.product.title}</p>}
                <p className={cn("truncate text-sm", c.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {c.lastMessage?.body ?? "Say hello 👋"}
                </p>
              </div>
              {c.product?.images[0] && (
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                  <Image src={c.product.images[0].url} alt="" fill className="object-cover" />
                </div>
              )}
              {c.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {c.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
