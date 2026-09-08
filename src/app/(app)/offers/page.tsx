import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { OfferActions } from "@/components/OfferActions";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Offers" };

export default async function OffersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [received, made] = await Promise.all([
    prisma.offer.findMany({
      where: { sellerId: user.id },
      include: { product: { include: { images: true } }, buyer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { buyerId: user.id },
      include: { product: { include: { images: true } }, seller: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Offers</h1>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
          <TabsTrigger value="made">Made ({made.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? (
            <EmptyState icon={Tag} title="No offers received yet" description="Offers on your listings will show up here." />
          ) : (
            <div className="space-y-3">
              {received.map((o) => (
                <div key={o.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {o.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={o.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/product/${o.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                          {o.product.title}
                        </Link>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{o.buyer.fullName}</span> offered {formatPrice(o.amount)}
                      </p>
                      {o.message && <p className="mt-0.5 text-xs text-muted-foreground">&ldquo;{o.message}&rdquo;</p>}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(o.createdAt)}</p>
                    </div>
                  </div>
                  {o.status === "PENDING" && (
                    <div className="mt-3 border-t border-border pt-3">
                      <OfferActions offerId={o.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="made">
          {made.length === 0 ? (
            <EmptyState icon={Tag} title="You haven't made any offers" description="Find something you like and make an offer." actionLabel="Explore Marketplace" actionHref="/explore" />
          ) : (
            <div className="space-y-3">
              {made.map((o) => (
                <div key={o.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5">
                  {o.product.images[0] && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image src={o.product.images[0].url} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/product/${o.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                        {o.product.title}
                      </Link>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">You offered {formatPrice(o.amount)} to {o.seller.fullName}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(o.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
