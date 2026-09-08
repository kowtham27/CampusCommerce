import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().regex(/^[0-9]{10}$/).optional().or(z.literal("")),
  department: z.string().trim().optional(),
  year: z.string().trim().optional(),
  bio: z.string().trim().max(300).optional(),
});

export async function PATCH(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...parsed.data,
      phone: parsed.data.phone || undefined,
    },
  });

  return NextResponse.json({ id: updated.id });
}
