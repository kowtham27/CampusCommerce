import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.subjectId === user.id) {
    return NextResponse.json({ error: "You can't review yourself." }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      authorId: user.id,
      subjectId: parsed.data.subjectId,
      transactionId: parsed.data.transactionId,
      overallRating: parsed.data.overallRating,
      conditionRating: parsed.data.conditionRating,
      communicationRating: parsed.data.communicationRating,
      transactionRating: parsed.data.transactionRating,
      comment: parsed.data.comment,
    },
  });

  await prisma.notification.create({
    data: {
      userId: parsed.data.subjectId,
      type: "REVIEW_RECEIVED",
      title: "You received a new review",
      body: `${user.fullName} left you a ${parsed.data.overallRating}-star review.`,
      link: `/profile/${parsed.data.subjectId}`,
    },
  });

  return NextResponse.json(review);
}
