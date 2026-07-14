import { z } from "zod";

const monthlyLimitSchema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount");

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1),
  monthlyLimit: monthlyLimitSchema,
});

export const updateBudgetSchema = z.object({
  monthlyLimit: monthlyLimitSchema,
});
