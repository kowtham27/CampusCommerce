import { api } from "@/lib/api";
import type { CampusLocation, Category } from "@/types";
import { ListingWizard } from "@/components/ListingWizard";

export const metadata = { title: "Sell an item" };

export default async function SellPage() {
  const [categories, locations] = await Promise.all([
    api<Category[]>("/categories"),
    api<CampusLocation[]>("/locations"),
  ]);

  return <ListingWizard categories={categories} locations={locations} />;
}
