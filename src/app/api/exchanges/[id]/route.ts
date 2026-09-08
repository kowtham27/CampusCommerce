import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({ status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const exchange = await prisma.exchange.findUnique({ where: { id }, include: { product: true } });
  if (!exchange) return NextResponse.json({ error: "Exchange not found" }, { status: 404 });

  const isOwner = exchange.ownerId === user.id;
  const isRequester = exchange.requesterId === user.id;
  if (!isOwner && !isRequester) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (["ACCEPTED", "REJECTED"].includes(parsed.data.status) && !isOwner) {
    return NextResponse.json({ error: "Only the listing owner can respond." }, { status: 403 });
  }

  const updated = await prisma.exchange.update({ where: { id }, data: { status: parsed.data.status } });

  await prisma.notification.create({
    data: {
      userId: isOwner ? exchange.requesterId : exchange.ownerId,
      type: "EXCHANGE_ACCEPTED",
      title: `Exchange ${parsed.data.status.toLowerCase()}`,
      body: `Your exchange request for ${exchange.product.title} is now ${parsed.data.status.toLowerCase()}.`,
      link: "/exchange",
    },
  });

  return NextResponse.json(updated);
}
