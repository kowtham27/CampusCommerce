import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSavedProductIds(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}
