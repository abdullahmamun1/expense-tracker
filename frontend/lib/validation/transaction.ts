import { z } from "zod";
import type { Category } from "@/lib/validation/category";

const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount (e.g. 100 or 100.50)");

export const transactionFormSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: amountSchema,
  occurredAt: z.string().min(1, "Date is required"),
  note: z.string().max(280).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type Transaction = {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  amount: string;
  note: string | null;
  occurredAt: string;
  createdAt: string;
  wallet: { id: string; name: string };
  category: { id: string; name: string; type: Category["type"]; color: string };
};
