import "server-only";
import { prisma } from "@/lib/prisma";

export async function findOrCreateConversation(
  userAId: string,
  userBId: string,
  productId?: string
) {
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
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
    include: {
      participantA: true,
      participantB: true,
      product: { include: { images: { orderBy: { position: "asc" } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return Promise.all(
    conversations.map(async (c) => {
      const other = c.participantAId === userId ? c.participantB : c.participantA;
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, read: false },
      });
      return { ...c, other, lastMessage: c.messages[0] ?? null, unreadCount };
    })
  );
}

export async function getConversationWithMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participantA: true,
      participantB: true,
      product: { include: { images: { orderBy: { position: "asc" } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return null;
  if (conversation.participantAId !== userId && conversation.participantBId !== userId) return null;

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, read: false },
    data: { read: true },
  });

  const other = conversation.participantAId === userId ? conversation.participantB : conversation.participantA;
  return { ...conversation, other };
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const [message] = await prisma.$transaction([
    prisma.message.create({ data: { conversationId, senderId, body } }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (conversation) {
    const recipientId =
      conversation.participantAId === senderId ? conversation.participantBId : conversation.participantAId;
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: "New message",
        body: `${sender?.fullName ?? "Someone"} sent you a message.`,
        link: `/messages/${conversationId}`,
      },
    });
  }

  return message;
}
