import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

export type CategoryBreakdownEntry = {
  categoryId: string;
  name: string;
  color: string;
  type: "EXPENSE" | "INCOME";
  total: string;
};

export type MonthlyTrendEntry = { month: string; income: string; expense: string };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// Local calendar date, not new Date(str) (UTC) — keeps range boundaries aligned
// with the calendar day the user actually picked.
function parseLocalDate(s: string) {
  return new Date(`${s}T00:00:00`);
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// end is exclusive throughout this module.
function resolveRange(from?: string, to?: string) {
  if (from && to) {
    return { start: parseLocalDate(from), end: addDays(parseLocalDate(to), 1) };
  }
  const anchor = startOfMonth(new Date());
  return { start: addMonths(anchor, -5), end: addMonths(anchor, 1) };
}

function monthBuckets(start: Date, end: Date): string[] {
  const labels: string[] = [];
  let cursor = startOfMonth(start);
  while (cursor < end) {
    labels.push(monthLabel(cursor));
    cursor = addMonths(cursor, 1);
  }
  return labels;
}

function csvField(value: string) {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function getReportsSummary(userId: string, from?: string, to?: string) {
  const { start, end } = resolveRange(from, to);

  const transactions = await prisma.transaction.findMany({
    where: { userId, occurredAt: { gte: start, lt: end } },
    include: { category: true },
  });

  let income = new Prisma.Decimal(0);
  let expense = new Prisma.Decimal(0);
  const byCategory = new Map<string, CategoryBreakdownEntry & { totalDecimal: Prisma.Decimal }>();
  const trendMap = new Map<string, { income: Prisma.Decimal; expense: Prisma.Decimal }>();
  for (const label of monthBuckets(start, end)) {
    trendMap.set(label, { income: new Prisma.Decimal(0), expense: new Prisma.Decimal(0) });
  }

  for (const transaction of transactions) {
    const isIncome = transaction.category.type === "INCOME";
    if (isIncome) {
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

    const label = monthLabel(transaction.occurredAt);
    const bucket = trendMap.get(label);
    if (bucket) {
      if (isIncome) {
        bucket.income = bucket.income.plus(transaction.amount);
      } else {
        bucket.expense = bucket.expense.plus(transaction.amount);
      }
    }
  }

  const sortedByCategory = [...byCategory.values()]
    .sort((a, b) => b.totalDecimal.comparedTo(a.totalDecimal))
    .map(({ categoryId, name, color, type, total }) => ({ categoryId, name, color, type, total }));

  const trend: MonthlyTrendEntry[] = [...trendMap.entries()].map(([month, totals]) => ({
    month,
    income: totals.income.toFixed(2),
    expense: totals.expense.toFixed(2),
  }));

  const topExpenseCategory = sortedByCategory.find((entry) => entry.type === "EXPENSE") ?? null;
  const averageMonthlyExpense = expense.div(trend.length).toFixed(2);

  const rangeDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  const priorEnd = start;
  const priorStart = addDays(start, -rangeDays);
  const priorAggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      occurredAt: { gte: priorStart, lt: priorEnd },
      category: { type: "EXPENSE" },
    },
    _sum: { amount: true },
  });
  const priorExpense = priorAggregate._sum.amount ?? new Prisma.Decimal(0);
  const percentChangeVsPriorPeriod = priorExpense.isZero()
    ? null
    : expense.minus(priorExpense).div(priorExpense).times(100).toNumber();

  return {
    range: { from: toISODate(start), to: toISODate(addDays(end, -1)) },
    totals: { income: income.toFixed(2), expense: expense.toFixed(2), net: income.minus(expense).toFixed(2) },
    trend,
    byCategory: sortedByCategory,
    insights: {
      topExpenseCategory: topExpenseCategory
        ? {
            categoryId: topExpenseCategory.categoryId,
            name: topExpenseCategory.name,
            color: topExpenseCategory.color,
            total: topExpenseCategory.total,
          }
        : null,
      averageMonthlyExpense,
      percentChangeVsPriorPeriod,
    },
  };
}

export async function getReportsExport(userId: string, from?: string, to?: string) {
  const { start, end } = resolveRange(from, to);

  const transactions = await prisma.transaction.findMany({
    where: { userId, occurredAt: { gte: start, lt: end } },
    orderBy: { occurredAt: "asc" },
    include: { wallet: true, category: true },
  });

  const header = "date,wallet,category,type,amount,note";
  const rows = transactions.map((t) =>
    [
      toISODate(t.occurredAt),
      csvField(t.wallet.name),
      csvField(t.category.name),
      t.category.type,
      t.amount.toFixed(2),
      csvField(t.note ?? ""),
    ].join(",")
  );
  const csv = [header, ...rows].join("\r\n");

  const fromLabel = toISODate(start);
  const toLabel = toISODate(addDays(end, -1));
  return { csv, filename: `transactions-${fromLabel}-to-${toLabel}.csv` };
}
