import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { listWalletsWithBalance } from "../wallets/wallet.service.js";

const recentTransactionsInclude = { wallet: true, category: true } as const;

type CategoryBreakdownEntry = {
  categoryId: string;
  name: string;
  color: string;
  type: "EXPENSE" | "INCOME";
  total: string;
};

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function getDashboardSummary(userId: string) {
  const { start, end } = currentMonthRange();

  const [wallets, monthTransactions, recentTransactions] = await Promise.all([
    listWalletsWithBalance(userId),
    prisma.transaction.findMany({
      where: { userId, occurredAt: { gte: start, lt: end } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      take: 5,
      include: recentTransactionsInclude,
    }),
  ]);

  const netWorth = wallets
    .reduce((sum, wallet) => sum.plus(wallet.currentBalance), new Prisma.Decimal(0))
    .toFixed(2);

  let income = new Prisma.Decimal(0);
  let expense = new Prisma.Decimal(0);
  const byCategory = new Map<string, CategoryBreakdownEntry & { totalDecimal: Prisma.Decimal }>();

  for (const transaction of monthTransactions) {
    if (transaction.category.type === "INCOME") {
      income = income.plus(transaction.amount);
    } else {
      expense = expense.plus(transaction.amount);
    }

    const existing = byCategory.get(transaction.categoryId);
    const totalDecimal = (existing?.totalDecimal ?? new Prisma.Decimal(0)).plus(transaction.amount);
    byCategory.set(transaction.categoryId, {
      categoryId: transaction.categoryId,
      name: transaction.category.name,
      color: transaction.category.color,
      type: transaction.category.type,
      total: totalDecimal.toFixed(2),
      totalDecimal,
    });
  }

  const sortedByCategory = [...byCategory.values()]
    .sort((a, b) => b.totalDecimal.comparedTo(a.totalDecimal))
    .map(({ categoryId, name, color, type, total }) => ({ categoryId, name, color, type, total }));

  return {
    netWorth,
    month: {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      byCategory: sortedByCategory,
    },
    recentTransactions,
  };
}
