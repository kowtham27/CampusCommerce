import { getCollections, getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { ProductCardData } from "@/types";
import { SearchBar } from "@/components/SearchBar";
import { QuickActions } from "@/components/QuickActions";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeader } from "@/components/SectionHeader";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ recommended, trending, recent, nearby }, { savedIds, cartIds }] = await Promise.all([
    api<Record<"recommended" | "trending" | "recent" | "nearby", ProductCardData[]>>("/products/feed", {
      query: { take: 8 },
    }),
    getCollections(),
  ]);

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 md:py-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">
            {greeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">What are you looking for today?</p>
        </div>
        <SearchBar className="max-w-lg" placeholder="Search products, books, electronics..." />
      </div>

      <QuickActions />

      <section>
        <SectionHeader
          title={user.department ? `Recommended for you · because you study ${user.department}` : "Recommended for you"}
          viewAllHref="/explore"
        />
        <ProductGrid products={recommended} savedIds={savedIds} cartIds={cartIds} emptyTitle="Nothing recommended yet" emptyDescription="Browse the marketplace to help us personalize this." />
      </section>

      <section>
        <SectionHeader title="Trending around campus" viewAllHref="/explore?sort=popular" />
        <ProductGrid products={trending} savedIds={savedIds} cartIds={cartIds} />
      </section>

      <section>
        <SectionHeader title="Recently added" viewAllHref="/explore?sort=newest" />
        <ProductGrid products={recent} savedIds={savedIds} cartIds={cartIds} />
      </section>

      <section>
        <SectionHeader title="Nearby" viewAllHref="/explore?sort=nearest" />
        <ProductGrid products={nearby} savedIds={savedIds} cartIds={cartIds} />
      </section>
    </div>
  );
}
