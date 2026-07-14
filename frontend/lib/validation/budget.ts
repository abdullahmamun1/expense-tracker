import { z } from "zod";

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  monthlyLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export type Budget = {
  id: string;
  userId: string;
  categoryId: string;
  monthlyLimit: string;
  createdAt: string;
  actualSpent: string;
  remaining: string;
  percentUsed: number;
  category: {
    id: string;
    name: string;
    color: string;
    type: "EXPENSE" | "INCOME";
  };
};
