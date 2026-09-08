import Image from "next/image";
import Link from "next/link";
import { Repeat } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { RentalStatusControl } from "@/components/RentalStatusControl";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Rentals" };

export default async function RentalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [renting, lending] = await Promise.all([
    prisma.rental.findMany({
      where: { renterId: user.id },
      include: { product: { include: { images: true } }, owner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.findMany({
      where: { ownerId: user.id },
      include: { product: { include: { images: true } }, renter: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-8">
      <h1 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Rentals</h1>

      <Tabs defaultValue="renting">
        <TabsList>
          <TabsTrigger value="renting">Renting ({renting.length})</TabsTrigger>
          <TabsTrigger value="lending">Lending out ({lending.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="renting">
          {renting.length === 0 ? (
            <EmptyState icon={Repeat} title="No rentals yet" description="Items you rent will show up here." actionLabel="Browse Rentals" actionHref="/rent" />
          ) : (
            <div className="space-y-3">
              {renting.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {r.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={r.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/product/${r.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                          {r.product.title}
                        </Link>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(r.totalPrice)} · {new Date(r.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-muted-foreground">Owner: {r.owner.fullName}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <RentalStatusControl rentalId={r.id} status={r.status} isOwner={false} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lending">
          {lending.length === 0 ? (
            <EmptyState icon={Repeat} title="No lending activity" description="List an item for rent to start earning." actionLabel="Sell an Item" actionHref="/sell" />
          ) : (
            <div className="space-y-3">
              {lending.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-surface p-3.5">
                  <div className="flex items-start gap-3">
                    {r.product.images[0] && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image src={r.product.images[0].url} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/product/${r.product.id}`} className="truncate text-sm font-semibold text-foreground hover:underline">
                          {r.product.title}
                        </Link>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{formatPrice(r.totalPrice)} · Renter: {r.renter.fullName}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <RentalStatusControl rentalId={r.id} status={r.status} isOwner />
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
