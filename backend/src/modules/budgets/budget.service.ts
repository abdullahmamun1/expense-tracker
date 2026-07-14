import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { createBudgetSchema, updateBudgetSchema } from "./budget.validators.js";
import { z } from "zod";

type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

const include = { category: true } as const;

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

async function withComputedFields(
  userId: string,
  budget: Prisma.BudgetGetPayload<{ include: typeof include }>,
) {
  const { start, end } = currentMonthRange();
  const result = await prisma.transaction.aggregate({
    where: { userId, categoryId: budget.categoryId, occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const actualSpent = result._sum.amount ?? new Prisma.Decimal(0);
  const limit = new Prisma.Decimal(budget.monthlyLimit);
  const remaining = limit.minus(actualSpent);
  const percentUsed = limit.isZero() ? 0 : actualSpent.div(limit).times(100).toNumber();

  return {
    ...budget,
    actualSpent: actualSpent.toFixed(2),
    remaining: remaining.toFixed(2),
    percentUsed,
  };
}

export async function listBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include,
  });
  return Promise.all(budgets.map((b) => withComputedFields(userId, b)));
}

export function createBudget(userId: string, data: CreateBudgetInput) {
  return prisma.budget.create({
    data: { userId, categoryId: data.categoryId, monthlyLimit: data.monthlyLimit },
    include,
  });
}

export function findOwnedBudget(id: string, userId: string) {
  return prisma.budget.findFirst({ where: { id, userId }, include });
}

export function findOwnedBudgetByCategory(categoryId: string, userId: string) {
  return prisma.budget.findFirst({ where: { categoryId, userId } });
}

export async function getBudget(id: string, userId: string) {
  const budget = await findOwnedBudget(id, userId);
  if (!budget) return null;
  return withComputedFields(userId, budget);
}

export async function updateBudget(id: string, userId: string, data: UpdateBudgetInput) {
  const budget = await findOwnedBudget(id, userId);
  if (!budget) return null;
  const updated = await prisma.budget.update({ where: { id }, data, include });
  return withComputedFields(userId, updated);
}

export async function deleteBudget(id: string, userId: string) {
  const budget = await findOwnedBudget(id, userId);
  if (!budget) return null;
  await prisma.budget.delete({ where: { id } });
  return budget;
}
