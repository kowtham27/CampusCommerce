import { prisma } from "../lib/prisma.js";
import { PRODUCT_CARD_INCLUDE } from "./productService.js";

export async function getCartProductIds(userId: string) {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

export async function getCartCount(userId: string) {
  return prisma.cartItem.count({ where: { userId } });
}

export async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: PRODUCT_CARD_INCLUDE } },
    orderBy: { createdAt: "desc" },
  });
}
