import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { ListingActions } from "@/components/ListingActions";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Admin · Listings" };

export default async function AdminListingsPage() {
  const listings = await prisma.product.findMany({
    where: { status: { not: "REMOVED" } },
    include: { images: { orderBy: { position: "asc" } }, seller: true, category: true, _count: { select: { reports: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Listings</h1>
        <p className="text-sm text-muted-foreground">{listings.length} listings across the marketplace</p>
      </div>

      <div className="space-y-2.5">
        {listings.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
            {p.images[0] && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                <Image src={p.images[0].url} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/product/${p.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">{p.title}</Link>
                <StatusBadge status={p.status} />
                {p._count.reports > 0 && <span className="text-xs font-medium text-destructive">{p._count.reports} report{p._count.reports > 1 ? "s" : ""}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{p.category.name} · {formatPrice(p.price)} · {p.seller.fullName} · {formatRelativeTime(p.createdAt)}</p>
            </div>
            <ListingActions productId={p.id} status={p.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
