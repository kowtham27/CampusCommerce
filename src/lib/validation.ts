import { z } from "zod";
import { ALLOWED_EMAIL_DOMAIN } from "@/lib/constants";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .refine((v) => v.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      message: `Use your college email (@${ALLOWED_EMAIL_DOMAIN})`,
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
  department: z.string().trim().min(1, "Select your department"),
  year: z.string().trim().min(1, "Select your year"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().length(6, "Enter the 6-digit code"),
});

export const onboardingSchema = z.object({
  department: z.string().min(1),
  year: z.string().min(1),
  hostelBlock: z.string().min(1),
  interests: z.array(z.string()).min(1, "Pick at least one interest"),
});

export const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  categoryId: z.string().min(1),
  condition: z.enum(["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"]),
  originalPrice: z.number().int().positive().optional(),
  price: z.number().int().nonnegative(),
  images: z.array(z.string()).min(1, "Add at least one photo").max(6),
  locationId: z.string().min(1),
  isSellable: z.boolean(),
  isRentable: z.boolean(),
  rentDaily: z.number().int().positive().optional(),
  rentWeekly: z.number().int().positive().optional(),
  rentMonthly: z.number().int().positive().optional(),
  rentDeposit: z.number().int().nonnegative().optional(),
  isExchangeable: z.boolean(),
  exchangeWants: z.array(z.string()).optional(),
  brand: z.string().optional(),
  ageMonths: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export const offerSchema = z.object({
  productId: z.string().min(1),
  amount: z.number().int().positive(),
  message: z.string().max(300).optional(),
});

export const messageSchema = z.object({
  conversationId: z.string().optional(),
  productId: z.string().optional(),
  recipientId: z.string().optional(),
  body: z.string().trim().min(1).max(2000),
});

export const reviewSchema = z.object({
  subjectId: z.string().min(1),
  transactionId: z.string().optional(),
  overallRating: z.number().int().min(1).max(5),
  conditionRating: z.number().int().min(1).max(5),
  communicationRating: z.number().int().min(1).max(5),
  transactionRating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reportSchema = z.object({
  productId: z.string().optional(),
  reportedUserId: z.string().optional(),
  reason: z.enum([
    "FAKE_PRODUCT",
    "SCAM",
    "WRONG_DESCRIPTION",
    "INAPPROPRIATE_CONTENT",
    "SUSPICIOUS_SELLER",
    "OTHER",
  ]),
  details: z.string().max(1000).optional(),
});

export const rentalRequestSchema = z.object({
  productId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

export const exchangeRequestSchema = z.object({
  productId: z.string().min(1),
  offeredItem: z.string().trim().min(2).max(200),
  message: z.string().max(500).optional(),
});
