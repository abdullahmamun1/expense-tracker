import { z } from "zod";

export const categoryTypes = ["EXPENSE", "INCOME"] as const;

export const categoryTypeLabels: Record<(typeof categoryTypes)[number], string> = {
  EXPENSE: "Expense",
  INCOME: "Income",
};

export const categoryColors = [
  "#1e6b47",
  "#a8432a",
  "#c98a2c",
  "#3b6ea5",
  "#7a4fa0",
  "#2f8f8f",
  "#b23b5e",
  "#5c5c5c",
] as const;

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(categoryTypes),
  color: z.enum(categoryColors),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: (typeof categoryTypes)[number];
  color: (typeof categoryColors)[number];
  createdAt: string;
};
