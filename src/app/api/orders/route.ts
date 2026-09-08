import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({ productId: z.string().min(1) });

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || product.status !== "ACTIVE" || !product.isSellable) {
    return NextResponse.json({ error: "This listing is no longer available." }, { status: 404 });
  }
  if (product.sellerId === user.id) {
    return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      code: `CC${Math.floor(1000 + Math.random() * 9000)}`,
      productId: product.id,
      buyerId: user.id,
      sellerId: product.sellerId,
      price: product.price,
    },
  });

  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      type: "ORDER_UPDATE",
      title: "New order placed",
      body: `${user.fullName} placed an order for ${product.title}.`,
      link: "/orders",
    },
  });

  return NextResponse.json(order);
}
