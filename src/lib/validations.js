import { z } from "zod";

export const createFundraiserSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(5000),
  targetAmount: z.number().positive("Target amount must be greater than zero"),
  category: z.enum(["Education", "Healthcare", "Animal Welfare", "Environment", "Disaster Relief", "Child Welfare"]),
  coverImage: z.string().min(1, "Cover image is required"),
  isUrgent: z.boolean().optional().default(false),
  urgentReason: z.string().max(200).optional().default(""),
  deadline: z.string().or(z.date()).optional().nullable(),
  documents: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      fileData: z.string(),
    })
  ).optional().default([]),
});

export const updateFundraiserSchema = createFundraiserSchema;

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  bio: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  image: z.string().optional(),
});

export const createOrderSchema = z.object({
  fundraiserId: z.string().min(1, "Fundraiser ID is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  message: z.string().max(500).optional().default(""),
  anonymous: z.boolean().optional().default(false),
});

export const createUpdateSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(5000),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  fundraiserId: z.string().min(1),
  amount: z.number().positive(),
  message: z.string().max(500).optional().default(""),
  anonymous: z.boolean().optional().default(false),
});

export const createDonationSchema = z.object({
  fundraiser: z.string().min(1),
  amount: z.number().positive(),
  message: z.string().max(500).optional().default(""),
  anonymous: z.boolean().optional().default(false),
  paymentId: z.string().min(1),
  status: z.enum(["Success", "Pending", "Failed"]).optional().default("Success"),
});

export const cloudinarySignSchema = z.object({
  paramsToSign: z.record(z.unknown()),
});

// Helper to validate and return parsed data or error response
export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.errors[0];
    return {
      success: false,
      error: firstError?.message || "Invalid input",
      details: result.error.errors,
    };
  }
  return { success: true, data: result.data };
}
