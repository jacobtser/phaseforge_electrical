import { z } from "zod";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^[+()\-.\s\d]{7,20}$/;

export const submissionTypes = ["appointment", "order", "quote", "contact"] as const;
export const serviceCategories = ["residential", "commercial", "power", "specialty", "other"] as const;
export const urgencyLevels = ["emergency", "this-week", "flexible"] as const;

export const submissionSchema = z
  .object({
    type: z.enum(submissionTypes).default("appointment"),
    name: z.string().trim().min(2, "Please enter your full name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Enter a valid email address.")
      .regex(emailRe, "Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(phoneRe, "Enter a valid phone number.")
      .refine(
        (v) => v.replace(/\D/g, "").length >= 7,
        "Enter a valid phone number.",
      )
      .transform((v) => v.replace(/\s+/g, " ").trim()),
    serviceCategory: z.enum(serviceCategories).default("other"),
    service: z.string().trim().max(120).optional().or(z.literal("")),
    propertyType: z.string().trim().max(60).optional().or(z.literal("")),
    address: z.string().trim().max(160).optional().or(z.literal("")),
    city: z.string().trim().max(80).optional().or(z.literal("")),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    preferredDate: z.string().trim().max(30).optional().or(z.literal("")),
    preferredTime: z.string().trim().max(30).optional().or(z.literal("")),
    urgency: z.enum(urgencyLevels).default("flexible"),
    budget: z.string().trim().max(60).optional().or(z.literal("")),
    details: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(2000),
    photos: z.array(z.string()).max(5).nullable().optional(),
    referral: z.string().trim().max(80).optional().or(z.literal("")),
    consent: z.boolean().refine((v) => v === true, "Please accept so we can contact you."),
    // basic anti-spam honeypot: must be empty
    company: z.string().max(0).optional().or(z.literal("")),
  })
  .refine(
    (data) => data.type !== "appointment" || Boolean(data.preferredDate),
    { message: "Please choose a preferred date.", path: ["preferredDate"] },
  )
  .refine(
    (data) => data.type === "contact" || Boolean(data.referral),
    { message: "Please tell us how you heard about us.", path: ["referral"] },
  );

export type SubmissionInput = z.input<typeof submissionSchema>;
export type SubmissionData = z.output<typeof submissionSchema>;

export const checkoutFulfilmentOptions = [
  "delivery-accra",
  "delivery-nationwide",
  "pickup",
] as const;

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        qty: z.number().int().min(1).max(999),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(50, "Too many different items in one order."),
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your full name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Enter a valid email address.")
      .regex(emailRe, "Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .regex(phoneRe, "Enter a valid phone number.")
      .refine(
        (v) => v.replace(/\D/g, "").length >= 7,
        "Enter a valid phone number.",
      )
      .transform((v) => v.replace(/\s+/g, " ").trim()),
    location: z.string().trim().max(160).optional().or(z.literal("")),
  }),
  fulfilment: z.enum(checkoutFulfilmentOptions),
});

export type CheckoutData = z.output<typeof checkoutSchema>;

export const assistantRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1, "Message cannot be empty.").max(1200),
      }),
    )
    .min(1)
    .max(16)
    .refine(
      (messages) => messages[messages.length - 1]?.role === "user",
      "The last message must be from the customer.",
    ),
  page: z.string().trim().max(200).optional(),
});

export type AssistantRequest = z.output<typeof assistantRequestSchema>;

type Issue = { path: readonly (string | number | symbol)[]; message: string };

export function firstError(issues: readonly Issue[]) {
  return issues[0]?.message ?? "Something went wrong. Please check the form.";
}

export function fieldErrors(issues: readonly Issue[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
