import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { getCampusImpact } from "../services/sustainabilityService.js";

/** Unauthenticated reference data and marketing stats. */
export const publicRouter = Router();

publicRouter.get("/categories", async (_req, res) => {
  res.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
});

publicRouter.get("/locations", async (_req, res) => {
  res.json(await prisma.campusLocation.findMany({ orderBy: { name: "asc" } }));
});

/** Headline numbers for the landing page. */
publicRouter.get("/stats/landing", async (_req, res) => {
  const [studentCount, completedTransactions, ratings, impact] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.review.aggregate({ _avg: { overallRating: true } }),
    getCampusImpact(),
  ]);
  res.set("Cache-Control", "public, max-age=60");
  res.json({ studentCount, completedTransactions, avgRating: ratings._avg.overallRating, impact });
});
