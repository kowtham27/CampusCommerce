import { prisma } from "../lib/prisma.js";

export async function getSavedProductIds(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}
