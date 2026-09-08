import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  notifyMessages: z.boolean().optional(),
  notifyOffers: z.boolean().optional(),
  notifyOrders: z.boolean().optional(),
  notifyRecs: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
  contactVisible: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  return NextResponse.json({ ok: true });
}
