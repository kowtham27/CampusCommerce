import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { rentalRequestSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { notify } from "../services/notificationService.js";

export const rentalsRouter = Router();
rentalsRouter.use(requireUser);

const statusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ACTIVE", "RETURNED", "CANCELLED"]),
});

const RENTAL_PRODUCT = { include: { images: { orderBy: { position: "asc" as const } } } };
const DAY_MS = 1000 * 60 * 60 * 24;

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS));
}

/** Items the user is renting from others, and items they're lending out. */
rentalsRouter.get("/", async (req, res) => {
  const userId = authUser(req).id;
  const [renting, lending] = await Promise.all([
    prisma.rental.findMany({
      where: { renterId: userId },
      include: { product: RENTAL_PRODUCT, owner: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.findMany({
      where: { ownerId: userId },
      include: { product: RENTAL_PRODUCT, renter: { select: PUBLIC_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ renting, lending });
});

rentalsRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const data = parse(rentalRequestSchema, req.body, "Invalid input");

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || !product.isRentable || product.status !== "ACTIVE") {
    throw new HttpError(404, "This item isn't available for rent.");
  }
  if (product.sellerId === user.id) throw new HttpError(400, "You can't rent your own listing.");

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    throw new HttpError(400, "Choose a valid date range.");
  }

  // Whole weeks at the weekly rate, leftover days at the daily rate.
  const days = daysBetween(startDate, endDate);
  const dailyRate = product.rentDaily ?? 0;
  const weeklyRate = product.rentWeekly ?? dailyRate * 7;
  const totalPrice = Math.floor(days / 7) * weeklyRate + (days % 7) * dailyRate;

  const rental = await prisma.rental.create({
    data: {
      productId: product.id,
      renterId: user.id,
      ownerId: product.sellerId,
      startDate,
      endDate,
      totalPrice: totalPrice || dailyRate,
      deposit: product.rentDeposit ?? 0,
    },
  });
  await notify({
    userId: product.sellerId,
    type: "RENTAL_REQUEST",
    title: "New rental request",
    body: `${user.fullName} requested to rent ${product.title}.`,
    link: "/rentals",
  });

  res.status(201).json(rental);
});

rentalsRouter.patch("/:id", async (req, res) => {
  const user = authUser(req);
  const { status } = parse(statusSchema, req.body, "Invalid input");

  const rental = await prisma.rental.findUnique({ where: { id: req.params.id }, include: { product: true } });
  if (!rental) throw new HttpError(404, "Rental not found");

  const isOwner = rental.ownerId === user.id;
  const isRenter = rental.renterId === user.id;
  if (!isOwner && !isRenter) throw new HttpError(403, "Forbidden");
  if (["APPROVED", "REJECTED", "RETURNED"].includes(status) && !isOwner) {
    throw new HttpError(403, "Only the owner can update this rental.");
  }

  const updated = await prisma.rental.update({ where: { id: rental.id }, data: { status } });
  await notify({
    userId: isOwner ? rental.renterId : rental.ownerId,
    type: "RENTAL_APPROVED",
    title: `Rental ${status.toLowerCase()}`,
    body: `Your rental for ${rental.product.title} is now ${status.toLowerCase()}.`,
    link: "/rentals",
  });

  res.json(updated);
});
