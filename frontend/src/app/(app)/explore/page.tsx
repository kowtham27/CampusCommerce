import { Suspense } from "react";
import { getCollections, getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { ProductCardData } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";

export const metadata = { title: "Explore" };

type SearchParams = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["q", "category", "type", "condition", "department", "hostel", "sort", "minPrice", "maxPrice"];

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) return null;

  // Forward the recognised filters as-is; the API validates and ignores bad values.
  const query = Object.fromEntries(
    FILTER_KEYS.map((key) => {
      const value = searchParams[key];
      return [key, typeof value === "string" ? value : undefined];
    })
  );

  const [products, { savedIds, cartIds }] = await Promise.all([
    api<ProductCardData[]>("/products", { query }),
    getCollections(),
  ]);

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{products.length} results</p>
      <ProductGrid
        products={products}
        savedIds={savedIds}
        cartIds={cartIds}
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
