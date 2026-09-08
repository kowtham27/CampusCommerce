import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { searchProducts } from "@/services/productService";
import { getSavedProductIds } from "@/services/wishlistService";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";

export const metadata = { title: "Explore" };

type SearchParams = Record<string, string | string[] | undefined>;

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;

  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const type = (searchParams.type as "all" | "sell" | "rent" | "exchange" | undefined) ?? "all";
  const condition = typeof searchParams.condition === "string" ? searchParams.condition : undefined;
  const department = typeof searchParams.department === "string" ? searchParams.department : undefined;
  const hostel = typeof searchParams.hostel === "string" ? searchParams.hostel : undefined;
  const sort = (searchParams.sort as never) ?? "recommended";
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

  const [products, savedIds] = await Promise.all([
    searchProducts({ q, category, type, condition, department, hostel, sort, minPrice, maxPrice }),
    getSavedProductIds(user.id),
  ]);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{products.length} results</p>
      <ProductGrid
        products={products}
        savedIds={savedIds}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your filters or search for something else."
      />
    </>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Explore</h1>
        <Suspense>
          <SearchBar className="max-w-lg" />
        </Suspense>
      </div>

      <div className="flex gap-6">
        <Suspense>
          <FilterPanel />
        </Suspense>
        <div className="min-w-0 flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            <Results searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
