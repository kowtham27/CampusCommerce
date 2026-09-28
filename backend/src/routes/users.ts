import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { requireUser } from "../middleware/auth.js";
import { PRODUCT_CARD_INCLUDE } from "../services/productService.js";
import { computeTrustScore } from "../services/trustScoreService.js";
import { getUserImpact } from "../services/sustainabilityService.js";

export const usersRouter = Router();
usersRouter.use(requireUser);

/** Resolves `me` to the signed-in user's id. */
function resolveId(raw: string, currentUserId: string) {
  return raw === "me" ? currentUserId : raw;
}

async function sellerStats(userId: string) {
  const [ratings, completedSales, completedRentals, completedExchanges] = await Promise.all([
    prisma.review.aggregate({ where: { subjectId: userId }, _avg: { overallRating: true }, _count: true }),
    prisma.order.count({ where: { sellerId: userId, status: "COMPLETED" } }),
    prisma.rental.count({ where: { ownerId: userId, status: "RETURNED" } }),
    prisma.exchange.count({ where: { ownerId: userId, status: "COMPLETED" } }),
  ]);
  return {
    avgRating: ratings._avg.overallRating,
    reviewCount: ratings._count,
    completedSales,
    completedRentals,
    completedExchanges,
  };
}

/** Lightweight seller summary for the product page's seller card. */
usersRouter.get("/:id/stats", async (req, res) => {
  const id = resolveId(req.params.id, authUser(req).id);
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new HttpError(404, "User not found");
  res.json(await sellerStats(id));
});

/** Full public profile: user, active listings, reviews, trust and impact. */
usersRouter.get("/:id/profile", async (req, res) => {
  const viewer = authUser(req);
  const id = resolveId(req.params.id, viewer.id);

  const profile = await prisma.user.findUnique({
    where: { id },
    select: { ...PUBLIC_USER_SELECT, phone: true, contactVisible: true },
  });
  if (!profile) throw new HttpError(404, "User not found");

  const { phone, contactVisible, ...user } = profile;
  const isOwn = id === viewer.id;

  const [listings, reviews, boughtCount, soldCount, trust, impact] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId: id, status: "ACTIVE" },
      include: PRODUCT_CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.findMany({
      where: { subjectId: id },
      include: { author: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: { buyerId: id, status: "COMPLETED" } }),
    prisma.order.count({ where: { sellerId: id, status: "COMPLETED" } }),
    computeTrustScore(id),
    getUserImpact(id),
  ]);

  res.json({
    user: { ...user, phone: isOwn || contactVisible ? phone : null },
    isOwn,
    listings,
    reviews,
    boughtCount,
    soldCount,
    trust,
    impact,
  });
});
