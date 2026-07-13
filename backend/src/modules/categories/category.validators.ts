import { z } from "zod";

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

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["EXPENSE", "INCOME"]),
  color: z.enum(categoryColors),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  type: z.enum(["EXPENSE", "INCOME"]).optional(),
  color: z.enum(categoryColors).optional(),
});
