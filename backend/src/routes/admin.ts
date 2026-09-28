import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, parse, queryString } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const userActionSchema = z.object({ action: z.enum(["verify", "suspend", "restore"]) });
const reportActionSchema = z.object({
  action: z.enum(["dismiss", "warn_user", "remove_listing", "suspend_user"]),
});

const REPORT_ACTIONS = {
  dismiss: "DISMISSED",
  warn_user: "WARNED_USER",
  remove_listing: "REMOVED_LISTING",
  suspend_user: "SUSPENDED_USER",
} as const;

/** Midnight (server time) for each of the last `n` days, oldest first. */
function lastNDays(n: number) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
}

function countPerDay(days: Date[], count: (range: { gte: Date; lt: Date }) => Promise<number>) {
  return Promise.all(
    days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return count({ gte: d, lt: next });
    })
  );
}

adminRouter.get("/stats", async (_req, res) => {
  const days = lastNDays(7);

  const [
    totalStudents,
    activeListings,
    completedTransactions,
    activeRentals,
    pendingReports,
    marketplaceValue,
    categories,
    topProducts,
    listingsPerDay,
    ordersPerDay,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.rental.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.product.aggregate({ _sum: { price: true }, where: { status: "ACTIVE" } }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({
      include: { _count: { select: { orders: true, offers: true } } },
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    countPerDay(days, (createdAt) => prisma.product.count({ where: { createdAt } })),
    countPerDay(days, (createdAt) => prisma.order.count({ where: { createdAt } })),
  ]);

  res.json({
    totalStudents,
    activeListings,
    completedTransactions,
    activeRentals,
    pendingReports,
    marketplaceValue: marketplaceValue._sum.price ?? 0,
    categories: categories.map((c) => ({ id: c.id, name: c.name, productCount: c._count.products })),
    topProducts: topProducts.map(({ _count, ...p }) => ({ ...p, orderCount: _count.orders, offerCount: _count.offers })),
    days: days.map((d) => d.toISOString()),
    listingsPerDay,
    ordersPerDay,
  });
});

adminRouter.get("/users", async (req, res) => {
  const q = queryString(req, "q");
  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    select: { ...PUBLIC_USER_SELECT, status: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(users);
});

adminRouter.patch("/users/:id", async (req, res) => {
  const { action } = parse(userActionSchema, req.body, "Invalid input");
  const data =
    action === "verify"
      ? { emailVerified: true }
      : action === "suspend"
        ? { status: "SUSPENDED" as const }
        : { status: "ACTIVE" as const };

  const updated = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ id: updated.id, status: updated.status, emailVerified: updated.emailVerified });
});

adminRouter.get("/listings", async (_req, res) => {
  const listings = await prisma.product.findMany({
    where: { status: { not: "REMOVED" } },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: { select: PUBLIC_USER_SELECT },
      category: true,
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(listings.map(({ _count, ...p }) => ({ ...p, reportCount: _count.reports })));
});

adminRouter.get("/reports", async (_req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      product: true,
      reportedUser: { select: PUBLIC_USER_SELECT },
      reportedBy: { select: PUBLIC_USER_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(reports);
});

adminRouter.patch("/reports/:id", async (req, res) => {
  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw new HttpError(404, "Report not found");

  const { action } = parse(reportActionSchema, req.body, "Invalid input");

  if (action === "remove_listing" && report.productId) {
    await prisma.product.update({ where: { id: report.productId }, data: { status: "REMOVED" } });
  }
  if (action === "suspend_user" && report.reportedUserId) {
    await prisma.user.update({ where: { id: report.reportedUserId }, data: { status: "SUSPENDED" } });
  }

  const updated = await prisma.report.update({
    where: { id: report.id },
    data: {
      status: action === "dismiss" ? "DISMISSED" : "REVIEWED",
      action: REPORT_ACTIONS[action],
      resolvedAt: new Date(),
    },
  });
  res.json(updated);
});
