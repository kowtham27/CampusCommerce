import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCartProductIds(userId: string) {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(rows.map((r) => r.productId));
}

export async function getCartCount(userId: string) {
  return prisma.cartItem.count({ where: { userId } });
}

export async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { category: true, images: { orderBy: { position: "asc" } }, seller: true, location: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
