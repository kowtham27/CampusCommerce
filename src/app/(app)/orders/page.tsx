import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderStatusControl } from "@/components/OrderStatusControl";
import { ReviewModal } from "@/components/ReviewModal";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [buying, selling] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: user.id },
      include: { product: { include: { images: true, location: true } }, seller: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { sellerId: user.id },
      include: { product: { include: { images: true, location: true } }, buyer: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Orders</h1>

      <Tabs defaultValue="buying">
        <TabsList>
          <TabsTrigger value="buying">Buying ({buying.length})</TabsTrigger>
          <TabsTrigger value="selling">Selling ({selling.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="buying">
          {buying.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No orders yet" description="Items you buy will show up here." actionLabel="Explore Marketplace" actionHref="/explore" />
          ) : (
            <div className="space-y-3">
              {buying.map((o) => (
                <div key={o.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {o.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={o.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Order #{o.code}</p>
                        <StatusBadge status={o.status} />
                      </div>
                      <Link href={`/product/${o.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                        {o.product.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(o.price)} · Seller: {o.seller.fullName}</p>
                      <p className="text-xs text-muted-foreground">Pickup: {o.product.location?.name ?? "On campus"}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(o.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <OrderStatusControl orderId={o.id} status={o.status} isSeller={false} />
                    {o.status === "COMPLETED" && (
                      <ReviewModal subjectId={o.seller.id} subjectName={o.seller.fullName} transactionId={o.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="selling">
          {selling.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="No sales yet" description="Orders from buyers will show up here." actionLabel="Sell an Item" actionHref="/sell" />
          ) : (
            <div className="space-y-3">
              {selling.map((o) => (
                <div key={o.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {o.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={o.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Order #{o.code}</p>
                        <StatusBadge status={o.status} />
                      </div>
                      <Link href={`/product/${o.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                        {o.product.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(o.price)} · Buyer: {o.buyer.fullName}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(o.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <OrderStatusControl orderId={o.id} status={o.status} isSeller />
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
