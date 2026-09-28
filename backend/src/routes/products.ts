import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse, queryNumber, queryString } from "../lib/http.js";
import { productSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { getProductById, incrementViewCount, searchProducts, type ProductFilters } from "../services/productService.js";
import {
  getNearbyProducts,
  getRecentProducts,
  getRecommendedProducts,
  getSimilarProducts,
  getTrendingProducts,
} from "../services/recommendationService.js";

export const productsRouter = Router();
productsRouter.use(requireUser);

const TYPES = ["all", "sell", "rent", "exchange"] as const;
const SORTS = ["recommended", "newest", "price_low", "price_high", "nearest", "popular"] as const;

const statusSchema = z.object({ status: z.enum(["ACTIVE", "PAUSED", "REMOVED"]) });

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** GET /api/products?q=&category=&type=&condition=&department=&hostel=&minPrice=&maxPrice=&sort= */
productsRouter.get("/", async (req, res) => {
  const filters: ProductFilters = {
    q: queryString(req, "q"),
    category: queryString(req, "category"),
    type: oneOf(queryString(req, "type"), TYPES),
    condition: queryString(req, "condition"),
    department: queryString(req, "department"),
    hostel: queryString(req, "hostel"),
    minPrice: queryNumber(req, "minPrice"),
    maxPrice: queryNumber(req, "maxPrice"),
    sort: oneOf(queryString(req, "sort"), SORTS),
  };
  res.json(await searchProducts(filters));
});

/** Dashboard rails: personalised, trending, recent and nearby listings. */
productsRouter.get("/feed", async (req, res) => {
  const take = Math.min(24, queryNumber(req, "take") ?? 8);
  const [recommended, trending, recent, nearby] = await Promise.all([
    getRecommendedProducts(authUser(req), take),
    getTrendingProducts(take),
    getRecentProducts(take),
    getNearbyProducts(take),
  ]);
  res.json({ recommended, trending, recent, nearby });
});

productsRouter.get("/:id", async (req, res) => {
  const product = await getProductById(req.params.id);
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
});

productsRouter.get("/:id/similar", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, select: { categoryId: true } });
  if (!product) throw new HttpError(404, "Product not found");
  res.json(await getSimilarProducts(req.params.id, product.categoryId));
});

productsRouter.post("/:id/view", async (req, res) => {
  await incrementViewCount(req.params.id);
  res.status(204).end();
});

productsRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const d = parse(productSchema, req.body);

  const product = await prisma.product.create({
    data: {
      title: d.title,
      description: d.description,
      categoryId: d.categoryId,
      sellerId: user.id,
      condition: d.condition,
      originalPrice: d.originalPrice,
      price: d.price,
      isSellable: d.isSellable,
      isRentable: d.isRentable,
      rentDaily: d.isRentable ? d.rentDaily : undefined,
      rentWeekly: d.isRentable ? d.rentWeekly : undefined,
      rentMonthly: d.isRentable ? d.rentMonthly : undefined,
      rentDeposit: d.isRentable ? d.rentDeposit : undefined,
      isExchangeable: d.isExchangeable,
      exchangeWants: d.isExchangeable ? (d.exchangeWants ?? []) : [],
      brand: d.brand,
      ageMonths: d.ageMonths,
      locationId: d.locationId,
      tags: d.tags ?? [],
      distanceMeters: 50 + Math.floor(Math.random() * 700),
      images: { create: d.images.map((url, i) => ({ url, position: i })) },
    },
  });

  res.status(201).json(product);
});

productsRouter.patch("/:id", async (req, res) => {
  const user = authUser(req);
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw new HttpError(404, "Not found");
  if (product.sellerId !== user.id && user.role !== "ADMIN") throw new HttpError(403, "Forbidden");

  const { status } = parse(statusSchema, req.body, "Invalid input");
  const updated = await prisma.product.update({ where: { id: product.id }, data: { status } });
  res.json(updated);
});
