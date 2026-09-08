import Image from "next/image";
import Link from "next/link";
import { Package, Eye, Tag as TagIcon, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { ListingActions } from "@/components/ListingActions";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "My Listings" };

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const listings = await prisma.product.findMany({
    where: { sellerId: user.id, status: { not: "REMOVED" } },
    include: {
      images: { orderBy: { position: "asc" } },
      _count: { select: { offers: { where: { status: "PENDING" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">My Listings</h1>
        <Button asChild size="sm"><Link href="/sell"><Plus size={14} /> New listing</Link></Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState icon={Package} title="You haven't listed anything yet" description="List your first item in a few minutes." actionLabel="Sell an Item" actionHref="/sell" />
      ) : (
        <div className="space-y-3">
          {listings.map((p) => (
            <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3.5">
              {p.images[0] && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
                  <Image src={p.images[0].url} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/product/${p.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                    {p.title}
                  </Link>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm font-medium text-foreground">{formatPrice(p.price)}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye size={12} /> {p.viewCount} views</span>
                  {p._count.offers > 0 && (
                    <span className="flex items-center gap-1 text-primary"><TagIcon size={12} /> {p._count.offers} pending offer{p._count.offers > 1 ? "s" : ""}</span>
                  )}
                  <span>{formatRelativeTime(p.createdAt)}</span>
                </div>
                <div className="mt-2.5">
                  <ListingActions productId={p.id} status={p.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
