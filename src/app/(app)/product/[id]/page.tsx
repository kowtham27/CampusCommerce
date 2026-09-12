import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Calendar, Tag, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/ProductGallery";
import { SellerCard } from "@/components/SellerCard";
import { WishlistButton } from "@/components/WishlistButton";
import { ReportModal } from "@/components/ReportModal";
import { OfferModal } from "@/components/OfferModal";
import { RentalRequestModal } from "@/components/RentalRequestModal";
import { ExchangeRequestModal } from "@/components/ExchangeRequestModal";
import { ChatWithSellerButton, BuyNowButton } from "@/components/ProductActionButtons";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProductById, incrementViewCount } from "@/services/productService";
import { getSimilarProducts } from "@/services/recommendationService";
import { getSavedProductIds } from "@/services/wishlistService";
import { CONDITION_LABELS } from "@/lib/constants";
import { formatPrice, formatRelativeTime } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description.slice(0, 150),
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, product] = await Promise.all([getCurrentUser(), getProductById(id)]);
  if (!user) return null;
  if (!product) notFound();

  incrementViewCount(id);

  const [reviews, completedOrders, completedRentals, completedExchanges, savedIds, similar] = await Promise.all([
    prisma.review.findMany({ where: { subjectId: product.sellerId } }),
    prisma.order.count({ where: { sellerId: product.sellerId, status: "COMPLETED" } }),
    prisma.rental.count({ where: { ownerId: product.sellerId, status: "RETURNED" } }),
    prisma.exchange.count({ where: { ownerId: product.sellerId, status: "COMPLETED" } }),
    getSavedProductIds(user.id),
    getSimilarProducts(product.id, product.categoryId),
  ]);

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length : 4.6;
  const isOwner = product.sellerId === user.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images.map((i) => i.url)} title={product.title} />

        <div className="space-y-5">
          <div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">{product.title}</h1>
              <WishlistButton productId={product.id} initialSaved={savedIds.has(product.id)} className="static" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin size={13} /> {product.location?.name ?? "On campus"}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> Posted {formatRelativeTime(product.createdAt)}</span>
              <span>·</span>
              <span>{product.viewCount} views</span>
            </div>
          </div>

          <div>
            {product.isRentable ? (
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-2xl font-extrabold text-foreground">{formatPrice(product.rentDaily ?? 0)}<span className="text-sm font-medium text-muted-foreground">/day</span></span>
                {product.rentWeekly && <span className="text-sm text-muted-foreground">{formatPrice(product.rentWeekly)}/week</span>}
                {product.rentMonthly && <span className="text-sm text-muted-foreground">{formatPrice(product.rentMonthly)}/month</span>}
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{CONDITION_LABELS[product.condition]}</Badge>
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
            {product.isRentable && <Badge variant="accent">Rentable</Badge>}
            {product.isExchangeable && <Badge variant="accent">Open to Exchange</Badge>}
          </div>

          {isOwner ? (
            <div className="rounded-md border border-dashed border-border-strong p-3 text-sm text-muted-foreground">
              This is your own listing. Manage it from{" "}
              <a href="/my-listings" className="font-medium text-primary hover:underline">My Listings</a>.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {product.isSellable && !product.isRentable && <BuyNowButton productId={product.id} />}
              {product.isSellable && !product.isRentable && (
                <OfferModal
                  productId={product.id}
                  listedPrice={product.price}
                  trigger={<Button variant="outline" className="w-full"><Tag size={15} /> Make Offer</Button>}
                />
              )}
              {product.isRentable && (
                <RentalRequestModal
                  productId={product.id}
                  rentDaily={product.rentDaily ?? 0}
                  rentWeekly={product.rentWeekly}
                  deposit={product.rentDeposit}
                  trigger={<Button className="w-full">Request Rental</Button>}
                />
              )}
              {product.isExchangeable && (
                <ExchangeRequestModal
                  productId={product.id}
                  productTitle={product.title}
                  wants={product.exchangeWants}
                  trigger={<Button variant="outline" className="w-full">Send Exchange Request</Button>}
                />
              )}
              <div className="col-span-2">
                <ChatWithSellerButton sellerId={product.sellerId} productId={product.id} />
              </div>
            </div>
          )}

          {product.isExchangeable && product.exchangeWants.length > 0 && (
            <div className="rounded-lg border border-border bg-surface-muted p-3.5">
              <p className="mb-1.5 text-sm font-semibold text-foreground">Open to Exchange</p>
              <p className="text-xs text-muted-foreground">Looking for:</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {product.exchangeWants.map((w) => <Badge key={w} variant="outline">{w}</Badge>)}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">Description</p>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Seller</p>
            <SellerCard
              id={product.seller.id}
              fullName={product.seller.fullName}
              email={product.seller.email}
              department={product.seller.department}
              year={product.seller.year}
              rating={avgRating}
              transactionCount={completedOrders + completedRentals + completedExchanges}
              verified={product.seller.emailVerified}
            />
          </div>

          {!isOwner && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck size={13} className="text-primary" /> Meet on campus for a safe transaction
              </span>
              <ReportModal productId={product.id} reportedUserId={product.sellerId} />
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-foreground">Similar products</h2>
          <ProductGrid products={similar} savedIds={savedIds} />
        </div>
      )}
    </div>
  );
}
