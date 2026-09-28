import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { requireUser } from "../middleware/auth.js";
import {
  findOrCreateConversation,
  getConversationWithMessages,
  getConversationsForUser,
  sendMessage,
} from "../services/messagingService.js";

export const conversationsRouter = Router();
conversationsRouter.use(requireUser);

const startSchema = z.object({
  recipientId: z.string().min(1),
  productId: z.string().optional(),
});
const messageSchema = z.object({ body: z.string().trim().min(1).max(2000) });

conversationsRouter.get("/", async (req, res) => {
  res.json(await getConversationsForUser(authUser(req).id));
});

conversationsRouter.get("/:id", async (req, res) => {
  const conversation = await getConversationWithMessages(req.params.id, authUser(req).id);
  if (!conversation) throw new HttpError(404, "Conversation not found");
  res.json(conversation);
});

conversationsRouter.post("/", async (req, res) => {
  const user = authUser(req);
  const { recipientId, productId } = parse(startSchema, req.body, "Invalid input");
  if (recipientId === user.id) throw new HttpError(400, "You can't message yourself.");

  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) throw new HttpError(404, "User not found");

  res.json(await findOrCreateConversation(user.id, recipientId, productId));
});

conversationsRouter.post("/:id/messages", async (req, res) => {
  const user = authUser(req);
  const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
  if (!conversation || (conversation.participantAId !== user.id && conversation.participantBId !== user.id)) {
    throw new HttpError(404, "Conversation not found");
  }

  const { body } = parse(messageSchema, req.body, "Message can't be empty");
  res.json(await sendMessage(conversation, user, body));
});
