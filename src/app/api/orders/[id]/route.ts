import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["ACCEPTED", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isSeller = order.sellerId === user.id;
  const isBuyer = order.buyerId === user.id;
  if (!isSeller && !isBuyer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (parsed.data.status !== "CANCELLED" && !isSeller) {
    return NextResponse.json({ error: "Only the seller can update order status." }, { status: 403 });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status: parsed.data.status } });

  if (parsed.data.status === "COMPLETED") {
    await prisma.product.update({ where: { id: order.productId }, data: { status: "SOLD" } });
  }

  await prisma.notification.create({
    data: {
      userId: isSeller ? order.buyerId : order.sellerId,
      type: "ORDER_UPDATE",
      title: "Order status updated",
      body: `Order #${order.code} for ${order.product.title} is now ${parsed.data.status.replace(/_/g, " ").toLowerCase()}.`,
      link: "/orders",
    },
  });

  return NextResponse.json(updated);
}
