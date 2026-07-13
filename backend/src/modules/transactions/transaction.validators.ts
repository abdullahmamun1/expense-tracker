import { z } from "zod";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount");

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

export const createTransactionSchema = z.object({
  walletId: z.string().min(1),
  categoryId: z.string().min(1),
  amount: amountSchema,
  occurredAt: dateSchema,
  note: z.string().max(280).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionListQuerySchema = z.object({
  walletId: z.string().optional(),
  categoryId: z.string().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});
