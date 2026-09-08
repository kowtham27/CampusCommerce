import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendMessage } from "@/services/messagingService";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const message = await sendMessage(id, user.id, parsed.data.body);
  return NextResponse.json(message);
}
