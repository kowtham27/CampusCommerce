import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getConversationWithMessages } from "@/services/messagingService";
import { ChatWindow } from "@/components/ChatWindow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice, initials } from "@/lib/utils";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await getConversationWithMessages(id, user.id);
  if (!data) notFound();

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-0 sm:px-6 md:py-6">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 sm:rounded-t-lg sm:border">
        <Link href="/messages" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} />
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarImage src={data.other.avatarUrl ?? undefined} />
          <AvatarFallback>{initials(data.other.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${data.other.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
            {data.other.fullName}
          </Link>
          {data.product && <p className="truncate text-xs text-muted-foreground">{data.product.title}</p>}
        </div>
      </div>

      {data.product && (
        <Link
          href={`/product/${data.product.id}`}
          className="flex items-center gap-3 border-b border-border bg-surface-muted/60 px-4 py-2.5 sm:border-x"
        >
          {data.product.images[0] && (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
              <Image src={data.product.images[0].url} alt="" fill className="object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{data.product.title}</p>
            <p className="text-xs text-muted-foreground">{formatPrice(data.product.price)}</p>
          </div>
        </Link>
      )}

      <div className="flex-1 overflow-hidden border-border bg-surface sm:border-x sm:border-b sm:rounded-b-lg">
        <ChatWindow
          conversationId={data.id}
          currentUserId={user.id}
          initialMessages={data.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
