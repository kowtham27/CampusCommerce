import { prisma } from "@/lib/prisma";
import { ListingWizard } from "@/components/ListingWizard";

export const metadata = { title: "Sell an item" };

export default async function SellPage() {
  const [categories, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.campusLocation.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ListingWizard categories={categories} locations={locations} />;
}
