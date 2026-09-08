import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { exchangeRequestSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = exchangeRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isExchangeable || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "This item isn't open to exchange." }, { status: 404 });
  }
  if (product.sellerId === user.id) {
    return NextResponse.json({ error: "You can't exchange with your own listing." }, { status: 400 });
  }

  const exchange = await prisma.exchange.create({
    data: {
      productId: product.id,
      requesterId: user.id,
      ownerId: product.sellerId,
      offeredItem: parsed.data.offeredItem,
      message: parsed.data.message,
    },
  });

  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      type: "EXCHANGE_REQUEST",
      title: "New exchange request",
      body: `${user.fullName} wants to exchange "${parsed.data.offeredItem}" for ${product.title}.`,
      link: "/exchange",
    },
  });

  return NextResponse.json(exchange);
}
