import { prisma } from "../lib/prisma.js";
import { PUBLIC_USER_SELECT } from "../lib/users.js";
import { notify } from "./notificationService.js";

const CONVERSATION_INCLUDE = {
  participantA: { select: PUBLIC_USER_SELECT },
  participantB: { select: PUBLIC_USER_SELECT },
  product: { include: { images: { orderBy: { position: "asc" as const } } } },
};

export async function findOrCreateConversation(userAId: string, userBId: string, productId?: string) {
  const [participantAId, participantBId] = [userAId, userBId].sort();

  const existing = await prisma.conversation.findFirst({
    where: { participantAId, participantBId, productId: productId ?? null },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { participantAId, participantBId, productId: productId ?? null },
  });
}

export async function getConversationsForUser(userId: string) {
  const [conversations, unread] = await Promise.all([
    prisma.conversation.findMany({
      where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
      include: { ...CONVERSATION_INCLUDE, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { lastMessageAt: "desc" },
    }),
    prisma.message.groupBy({
      by: ["conversationId"],
      where: {
        read: false,
        senderId: { not: userId },
        conversation: { OR: [{ participantAId: userId }, { participantBId: userId }] },
      },
      _count: { _all: true },
    }),
  ]);

  const unreadByConversation = new Map(unread.map((u) => [u.conversationId, u._count._all]));

  return conversations.map(({ messages, participantA, participantB, ...c }) => ({
    ...c,
    other: c.participantAId === userId ? participantB : participantA,
    lastMessage: messages[0] ?? null,
    unreadCount: unreadByConversation.get(c.id) ?? 0,
  }));
}

/** Loads a conversation the user participates in and marks incoming messages read. */
export async function getConversationWithMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { ...CONVERSATION_INCLUDE, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return null;
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) return null;

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, read: false },
    data: { read: true },
  });

  const { participantA, participantB, ...rest } = conversation;
  return { ...rest, other: conversation.participantAId === userId ? participantB : participantA };
}

export async function sendMessage(
  conversation: { id: string; participantAId: string; participantBId: string },
  sender: { id: string; fullName: string },
  body: string
) {
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId: conversation.id, senderId: sender.id, body } }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  await notify({
    userId: conversation.participantAId === sender.id ? conversation.participantBId : conversation.participantAId,
    type: "NEW_MESSAGE",
    title: "New message",
    body: `${sender.fullName} sent you a message.`,
    link: `/messages/${conversation.id}`,
  });

  return message;
}
