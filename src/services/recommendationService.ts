import "server-only";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

const PRODUCT_CARD_INCLUDE = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  seller: true,
  location: true,
} as const;

/**
 * Rule-based recommendation engine. Ranks active listings using signals derived
 * from the viewer's department/interests/wishlist. Kept as a single scoring
 * function so it can later be replaced by a learned ranking model — callers
 * only depend on the returned, already-sorted product list.
 */
export async function getRecommendedProducts(user: User | null, take = 8) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", ...(user ? { sellerId: { not: user.id } } : {}) },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  if (!user) return products.slice(0, take);

  const wishlistCategoryIds = new Set(
    (
      await prisma.wishlist.findMany({
        where: { userId: user.id },
        include: { product: true },
      })
    ).map((w) => w.product.categoryId)
  );

  const interestSet = new Set(user.interests.map((i) => i.toLowerCase()));

  const scored = products.map((p) => {
    let score = 0;
    if (wishlistCategoryIds.has(p.categoryId)) score += 4;
    if (interestSet.has(p.category.name.toLowerCase())) score += 3;
    if (user.department && p.tags.some((t) => t.toLowerCase().includes(user.department!.toLowerCase())))
      score += 2;
    score += Math.max(0, 3 - Math.floor(p.distanceMeters / 300));
    score += Math.min(2, p.viewCount / 50);
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, take).map((s) => s.product);
}

export async function getTrendingProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
    take,
  });
}

export async function getNearbyProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { distanceMeters: "asc" },
    take,
  });
}

export async function getRecentProducts(take = 8) {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getSimilarProducts(productId: string, categoryId: string, take = 4) {
  return prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: productId } },
    include: PRODUCT_CARD_INCLUDE,
    orderBy: { viewCount: "desc" },
    take,
  });
}
