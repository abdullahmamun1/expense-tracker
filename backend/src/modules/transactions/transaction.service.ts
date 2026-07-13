import { prisma } from "../../lib/prisma.js";
import type {
  createTransactionSchema,
  updateTransactionSchema,
  transactionListQuerySchema,
} from "./transaction.validators.js";
import { z } from "zod";
import { findOwnedCategory } from "../categories/category.service.js";

type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
type ListFilters = z.infer<typeof transactionListQuerySchema>;

const include = { wallet: true, category: true } as const;

export function listTransactions(userId: string, filters: ListFilters) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(filters.walletId ? { walletId: filters.walletId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.from || filters.to
        ? {
            occurredAt: {
              ...(filters.from ? { gte: new Date(filters.from) } : {}),
              ...(filters.to ? { lte: new Date(filters.to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { occurredAt: "desc" },
    include,
  });
}

export function createTransaction(userId: string, data: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      userId,
      walletId: data.walletId,
      categoryId: data.categoryId,
      amount: data.amount,
      note: data.note,
      occurredAt: new Date(data.occurredAt),
    },
    include,
  });
}

export function findOwnedTransaction(id: string, userId: string) {
  return prisma.transaction.findFirst({ where: { id, userId }, include });
}

export async function updateTransaction(id: string, userId: string, data: UpdateTransactionInput) {
  const transaction = await findOwnedTransaction(id, userId);
  if (!transaction) return null;
  const { occurredAt, ...rest } = data;
  return prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      ...(occurredAt ? { occurredAt: new Date(occurredAt) } : {}),
    },
    include,
  });
}

export async function deleteTransaction(id: string, userId: string) {
  const transaction = await findOwnedTransaction(id, userId);
  if (!transaction) return null;
  await prisma.transaction.delete({ where: { id } });
  return transaction;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

export async function suggestCategory(userId: string, note: string): Promise<string | null> {
  const queryTokens = new Set(tokenize(note));
  if (queryTokens.size === 0) return null;

  const transactions = await prisma.transaction.findMany({
    where: { userId, note: { not: null } },
    select: { note: true, categoryId: true },
  });

  const scores = new Map<string, number>();
  for (const transaction of transactions) {
    if (!transaction.note) continue;
    const noteTokens = new Set(tokenize(transaction.note));
    let matchCount = 0;
    for (const token of queryTokens) {
      if (noteTokens.has(token)) matchCount++;
    }
    if (matchCount > 0) {
      scores.set(transaction.categoryId, (scores.get(transaction.categoryId) ?? 0) + matchCount);
    }
  }
  if (scores.size === 0) return null;

  let bestCategoryId: string | null = null;
  let bestScore = -1;
  let tie = false;
  for (const [categoryId, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestCategoryId = categoryId;
      tie = false;
    } else if (score === bestScore) {
      tie = true;
    }
  }
  if (tie || !bestCategoryId) return null;

  const category = await findOwnedCategory(bestCategoryId, userId);
  return category ? bestCategoryId : null;
}
