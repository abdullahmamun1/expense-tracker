import { z } from "zod";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount");

export const createWalletSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]),
  startingBalance: amountSchema,
});

export const updateWalletSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z.enum(["CASH", "BANK", "CREDIT_CARD", "OTHER"]).optional(),
  startingBalance: amountSchema.optional(),
});
