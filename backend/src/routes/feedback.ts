import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError, authUser, parse } from "../lib/http.js";
import { reportSchema, reviewSchema } from "../lib/validation.js";
import { requireUser } from "../middleware/auth.js";
import { notify } from "../services/notificationService.js";

/** User-generated trust signals: reviews of other students and abuse reports. */
export const feedbackRouter = Router();

feedbackRouter.post("/reviews", requireUser, async (req, res) => {
  const user = authUser(req);
  const data = parse(reviewSchema, req.body, "Invalid input");
  if (data.subjectId === user.id) throw new HttpError(400, "You can't review yourself.");

  const review = await prisma.review.create({ data: { ...data, authorId: user.id } });
  await notify({
    userId: data.subjectId,
    type: "REVIEW_RECEIVED",
    title: "You received a new review",
    body: `${user.fullName} left you a ${data.overallRating}-star review.`,
    link: `/profile/${data.subjectId}`,
  });

  res.status(201).json(review);
});

feedbackRouter.post("/reports", requireUser, async (req, res) => {
  const data = parse(reportSchema, req.body, "Invalid input");
  const report = await prisma.report.create({ data: { ...data, reportedById: authUser(req).id } });
  res.status(201).json(report);
});
