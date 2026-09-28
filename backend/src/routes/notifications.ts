import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authUser } from "../lib/http.js";
import { requireUser } from "../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireUser);

notificationsRouter.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: authUser(req).id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
});

notificationsRouter.post("/read-all", async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: authUser(req).id, read: false }, data: { read: true } });
  res.json({ ok: true });
});

notificationsRouter.post("/:id/read", async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: authUser(req).id },
    data: { read: true },
  });
  res.json({ ok: true });
});
