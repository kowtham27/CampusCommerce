import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ACTIVE", "RETURNED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rental = await prisma.rental.findUnique({ where: { id }, include: { product: true } });
  if (!rental) return NextResponse.json({ error: "Rental not found" }, { status: 404 });

  const isOwner = rental.ownerId === user.id;
  const isRenter = rental.renterId === user.id;
  if (!isOwner && !isRenter) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (["APPROVED", "REJECTED", "RETURNED"].includes(parsed.data.status) && !isOwner) {
    return NextResponse.json({ error: "Only the owner can update this rental." }, { status: 403 });
  }

  const updated = await prisma.rental.update({ where: { id }, data: { status: parsed.data.status } });

  await prisma.notification.create({
    data: {
      userId: isOwner ? rental.renterId : rental.ownerId,
      type: "RENTAL_APPROVED",
      title: `Rental ${parsed.data.status.toLowerCase()}`,
      body: `Your rental for ${rental.product.title} is now ${parsed.data.status.toLowerCase()}.`,
      link: "/rentals",
    },
  });

  return NextResponse.json(updated);
}
