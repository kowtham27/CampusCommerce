import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  action: z.enum(["accept", "reject", "counter"]),
  counterAmount: z.number().int().positive().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const offer = await prisma.offer.findUnique({ where: { id }, include: { product: true } });
  if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (offer.sellerId !== user.id) {
    return NextResponse.json({ error: "You can't act on this offer." }, { status: 403 });
  }

  if (parsed.data.action === "accept") {
    const updated = await prisma.offer.update({ where: { id }, data: { status: "ACCEPTED" } });
    const order = await prisma.order.create({
      data: {
        code: `CC${Math.floor(1000 + Math.random() * 9000)}`,
        productId: offer.productId,
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        price: offer.amount,
      },
    });
    await prisma.notification.create({
      data: {
        userId: offer.buyerId,
        type: "OFFER_ACCEPTED",
        title: "Your offer was accepted",
        body: `Your offer on ${offer.product.title} was accepted. Order #${order.code} created.`,
        link: "/orders",
      },
    });
    return NextResponse.json({ offer: updated, order });
  }

  if (parsed.data.action === "reject") {
    const updated = await prisma.offer.update({ where: { id }, data: { status: "REJECTED" } });
    await prisma.notification.create({
      data: {
        userId: offer.buyerId,
        type: "OFFER_REJECTED",
        title: "Your offer was declined",
        body: `Your offer on ${offer.product.title} was declined.`,
      },
    });
    return NextResponse.json({ offer: updated });
  }

  if (!parsed.data.counterAmount) {
    return NextResponse.json({ error: "Enter a counter amount." }, { status: 400 });
  }
  const updated = await prisma.offer.update({
    where: { id },
    data: { status: "COUNTERED", amount: parsed.data.counterAmount },
  });
  await prisma.notification.create({
    data: {
      userId: offer.buyerId,
      type: "OFFER_COUNTERED",
      title: "Seller countered your offer",
      body: `New price for ${offer.product.title}: ₹${parsed.data.counterAmount}.`,
      link: "/offers",
    },
  });
  return NextResponse.json({ offer: updated });
}
