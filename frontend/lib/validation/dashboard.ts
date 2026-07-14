import type { Transaction } from "./transaction";

export type CategoryBreakdownEntry = {
  categoryId: string;
  name: string;
  color: string;
  type: "EXPENSE" | "INCOME";
  total: string;
};

export type DashboardSummary = {
  netWorth: string;
  month: {
    income: string;
    expense: string;
    byCategory: CategoryBreakdownEntry[];
  };
  recentTransactions: Transaction[];
};
