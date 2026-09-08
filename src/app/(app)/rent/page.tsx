import { Repeat } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { searchProducts } from "@/services/productService";
import { getSavedProductIds } from "@/services/wishlistService";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata = { title: "Rent" };

export default async function RentPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [products, savedIds] = await Promise.all([
    searchProducts({ type: "rent", sort: "newest" }),
    getSavedProductIds(user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent-foreground">
          <Repeat size={18} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Rent on campus</h1>
          <p className="text-sm text-muted-foreground">
            Cameras, gadgets, and gear — by the day, week, or month.
          </p>
        </div>
      </div>

      <ProductGrid
        products={products}
        savedIds={savedIds}
        emptyTitle="No rentals available right now"
        emptyDescription="Check back soon, or list something of your own to rent out."
      />
    </div>
  );
}
