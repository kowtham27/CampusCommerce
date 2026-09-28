import { ProductGridSkeleton } from "@/components/ProductGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
      <div className="mb-6 h-7 w-48 animate-pulse rounded-md bg-surface-muted" />
      <ProductGridSkeleton />
    </div>
  );
}
