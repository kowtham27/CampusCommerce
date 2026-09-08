import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Computes a 0-100 trust score from verification, transaction history, reviews,
 * and reports. Intentionally coarse-grained — exact internal weighting is not
 * exposed to end users, only the final score and a short badge list.
 */
export async function computeTrustScore(userId: string) {
  const [user, reviews, completedOrders, reportsAgainst] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.review.findMany({ where: { subjectId: userId } }),
    prisma.order.count({ where: { sellerId: userId, status: "COMPLETED" } }),
    prisma.report.count({ where: { reportedUserId: userId, status: { not: "DISMISSED" } } }),
  ]);
  if (!user) return { score: 0, badges: [] as string[] };

  let score = 50;
  if (user.emailVerified) score += 10;
  score += Math.min(20, completedOrders * 1.5);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;
  score += Math.round(avgRating * 4);

  score -= reportsAgainst * 8;

  const accountAgeMonths =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  score += Math.min(10, accountAgeMonths);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const badges: string[] = [];
  if (user.emailVerified) badges.push("Verified Student");
  if (avgRating >= 4.5 && reviews.length >= 3) badges.push("Reliable Seller");
  if (user.responseRate >= 80) badges.push("Fast Responder");
  if (completedOrders >= 20) badges.push("20+ Transactions");

  return { score, badges };
}
