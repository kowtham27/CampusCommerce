import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { offerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = offerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "This listing is no longer available." }, { status: 404 });
  }
  if (product.sellerId === user.id) {
    return NextResponse.json({ error: "You can't make an offer on your own listing." }, { status: 400 });
  }

  const offer = await prisma.offer.create({
    data: {
      productId: product.id,
      buyerId: user.id,
      sellerId: product.sellerId,
      amount: parsed.data.amount,
      message: parsed.data.message,
    },
  });

  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      type: "OFFER_RECEIVED",
      title: "New offer received",
      body: `${user.fullName} offered ₹${parsed.data.amount} on ${product.title}.`,
      link: `/offers`,
    },
  });

  return NextResponse.json(offer);
}
