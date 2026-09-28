import { Heart } from "lucide-react";
import { getCollections, getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { ProductCardData } from "@/types";
import { ProductGrid } from "@/components/ProductGrid";
import { EmptyState } from "@/components/EmptyState";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, { cartIds }] = await Promise.all([
    api<ProductCardData[]>("/wishlist"),
    getCollections(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-5 flex items-center gap-2">
        <Heart size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">My Wishlist</h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No wishlist items yet"
          description="Discover something you'll love."
          actionLabel="Explore Marketplace"
          actionHref="/explore"
        />
      ) : (
        <ProductGrid products={products} savedIds={new Set(products.map((p) => p.id))} cartIds={cartIds} />
      )}
    </div>
  );
}
