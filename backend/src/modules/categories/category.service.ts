import { prisma } from "../../lib/prisma.js";
import type { createCategorySchema, updateCategorySchema } from "./category.validators.js";
import { z } from "zod";

type CreateCategoryInput = z.infer<typeof createCategorySchema>;
type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export function createCategory(userId: string, data: CreateCategoryInput) {
  return prisma.category.create({
    data: { ...data, userId },
  });
}

export function findOwnedCategory(id: string, userId: string) {
  return prisma.category.findFirst({ where: { id, userId } });
}

export function findCategoryByName(userId: string, name: string, excludeId?: string) {
  return prisma.category.findFirst({
    where: {
      userId,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function updateCategory(id: string, userId: string, data: UpdateCategoryInput) {
  const category = await findOwnedCategory(id, userId);
  if (!category) return null;
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string, userId: string) {
  const category = await findOwnedCategory(id, userId);
  if (!category) return "not_found" as const;
  const transactionCount = await prisma.transaction.count({ where: { categoryId: id } });
  if (transactionCount > 0) return "has_transactions" as const;
  await prisma.category.delete({ where: { id } });
  return "deleted" as const;
}
