import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rentalRequestSchema } from "@/lib/validation";

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = rentalRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isRentable || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "This item isn't available for rent." }, { status: 404 });
  }
  if (product.sellerId === user.id) {
    return NextResponse.json({ error: "You can't rent your own listing." }, { status: 400 });
  }

  const startDate = new Date(parsed.data.startDate);
  const endDate = new Date(parsed.data.endDate);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    return NextResponse.json({ error: "Choose a valid date range." }, { status: 400 });
  }

  const days = daysBetween(startDate, endDate);
  const dailyRate = product.rentDaily ?? 0;
  const weeklyRate = product.rentWeekly ?? dailyRate * 7;
  const weeks = Math.floor(days / 7);
  const remainderDays = days % 7;
  const totalPrice = weeks * weeklyRate + remainderDays * dailyRate;

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

  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      type: "RENTAL_REQUEST",
      title: "New rental request",
      body: `${user.fullName} requested to rent ${product.title}.`,
      link: "/rentals",
    },
  });

  return NextResponse.json(rental);
}
