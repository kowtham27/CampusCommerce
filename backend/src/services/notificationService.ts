import type { NotificationType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  await prisma.notification.create({ data: input });
}
