import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({ action: z.enum(["verify", "suspend", "restore"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin().catch(() => null);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const data =
    parsed.data.action === "verify"
      ? { emailVerified: true }
      : parsed.data.action === "suspend"
        ? { status: "SUSPENDED" as const }
        : { status: "ACTIVE" as const };

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id, status: updated.status, emailVerified: updated.emailVerified });
}
