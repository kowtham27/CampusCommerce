import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchProducts } from "@/services/productService";
import { getSavedProductIds } from "@/services/wishlistService";
import { ProductGrid } from "@/components/ProductGrid";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { ExchangeStatusControl } from "@/components/ExchangeStatusControl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Exchange" };

export default async function ExchangePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, savedIds, sent, received] = await Promise.all([
    searchProducts({ type: "exchange", sort: "newest" }),
    getSavedProductIds(user.id),
    prisma.exchange.findMany({
      where: { requesterId: user.id },
      include: { product: { include: { images: true } }, owner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exchange.findMany({
      where: { ownerId: user.id },
      include: { product: { include: { images: true } }, requester: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent-foreground">
          <ArrowLeftRight size={18} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Exchange marketplace</h1>
          <p className="text-sm text-muted-foreground">Trade an item you have for something you actually need.</p>
        </div>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="sent">My Requests ({sent.length})</TabsTrigger>
          <TabsTrigger value="received">Received ({received.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <ProductGrid
            products={products}
            savedIds={savedIds}
            emptyTitle="No exchange listings yet"
            emptyDescription="List an item you're open to swapping."
          />
        </TabsContent>

        <TabsContent value="sent">
          {sent.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="No exchange requests sent" description="Find something to swap for on the Browse tab." />
          ) : (
            <div className="space-y-3">
              {sent.map((ex) => (
                <div key={ex.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5">
                  {ex.product.images[0] && (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image src={ex.product.images[0].url} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/product/${ex.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">{ex.product.title}</Link>
                      <StatusBadge status={ex.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">You offered <span className="font-medium text-foreground">{ex.offeredItem}</span> to {ex.owner.fullName}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(ex.createdAt)}</p>
                  </div>
                  <ExchangeStatusControl exchangeId={ex.id} status={ex.status} isOwner={false} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received">
          {received.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="No exchange requests received" description="Requests on your exchangeable listings will show up here." />
          ) : (
            <div className="space-y-3">
              {received.map((ex) => (
                <div key={ex.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {ex.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={ex.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/product/${ex.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">{ex.product.title}</Link>
                        <StatusBadge status={ex.status} />
                      </div>
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{ex.requester.fullName}</span> offered {ex.offeredItem}</p>
                      {ex.message && <p className="mt-0.5 text-xs text-muted-foreground">&ldquo;{ex.message}&rdquo;</p>}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(ex.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <ExchangeStatusControl exchangeId={ex.id} status={ex.status} isOwner />
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
