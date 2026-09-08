import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ProductFilters {
  q?: string;
  category?: string;
  type?: "all" | "sell" | "rent" | "exchange";
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  department?: string;
  hostel?: string;
  sort?: "recommended" | "newest" | "price_low" | "price_high" | "nearest" | "popular";
  sellerId?: string;
  excludeSellerId?: string;
}

const PRODUCT_CARD_INCLUDE = {
  category: true,
  images: { orderBy: { position: "asc" as const } },
  seller: true,
  location: true,
} satisfies Prisma.ProductInclude;

export async function searchProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { tags: { has: filters.q.toLowerCase() } },
      { category: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  if (filters.category) where.category = { slug: filters.category };
  if (filters.type === "sell") where.isSellable = true;
  if (filters.type === "rent") where.isRentable = true;
  if (filters.type === "exchange") where.isExchangeable = true;
  if (filters.condition) where.condition = filters.condition as never;
  if (filters.department) where.seller = { department: filters.department };
  if (filters.hostel) where.location = { name: filters.hostel };
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.sellerId) where.sellerId = filters.sellerId;
  if (filters.excludeSellerId) where.sellerId = { not: filters.excludeSellerId };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "newest"
      ? { createdAt: "desc" }
      : filters.sort === "price_low"
        ? { price: "asc" }
        : filters.sort === "price_high"
          ? { price: "desc" }
          : filters.sort === "nearest"
            ? { distanceMeters: "asc" }
            : filters.sort === "popular"
              ? { viewCount: "desc" }
              : { createdAt: "desc" };

  return prisma.product.findMany({
    where,
    include: PRODUCT_CARD_INCLUDE,
    orderBy,
    take: 60,
  });
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: PRODUCT_CARD_INCLUDE,
  });
  return product;
}

export async function incrementViewCount(id: string) {
  await prisma.product.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});
}
