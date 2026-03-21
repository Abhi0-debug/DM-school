import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name should be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s-]{8,16}$/, "Enter a valid phone number."),
  message: z.string().min(10, "Message must be at least 10 characters."),
  captchaAnswer: z.coerce.number(),
  captchaExpected: z.coerce.number()
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export const eventSchema = z.object({
  title: z.string().min(3),
  date: z.string().min(8),
  description: z.string().min(10),
  location: z.string().min(2),
  category: z.string().min(2).optional(),
  type: z.enum(["event", "exam"])
});

export const noticeSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(8),
  date: z.string().min(8),
  type: z.enum(["daily", "holiday", "alert"])
});

export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(3),
  category: z.string().min(2)
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1)
});

export const adminPinLoginSchema = z.object({
  pin: z.string().min(4).max(32)
});

export const adminPinChangeSchema = z.object({
  currentPin: z.string().min(4).max(32),
  newPin: z.string().min(4).max(32)
});

export const imageUpdateSchema = z.object({
  alt: z.string().min(3),
  category: z.string().min(2),
  url: z.string().url().optional()
});
