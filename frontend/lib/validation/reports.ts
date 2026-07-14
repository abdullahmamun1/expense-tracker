import type { CategoryBreakdownEntry } from "./dashboard";

export type MonthlyTrendEntry = { month: string; income: string; expense: string };

export type TopExpenseCategory = {
  categoryId: string;
  name: string;
  color: string;
  total: string;
};

export type ReportsInsights = {
  topExpenseCategory: TopExpenseCategory | null;
  averageMonthlyExpense: string;
  percentChangeVsPriorPeriod: number | null;
};

export type ReportsSummary = {
  range: { from: string; to: string };
  totals: { income: string; expense: string; net: string };
  trend: MonthlyTrendEntry[];
  byCategory: CategoryBreakdownEntry[];
  insights: ReportsInsights;
};

export type ReportPreset = "3M" | "6M" | "12M" | "YTD";
export type ReportRangeMode = ReportPreset | "custom";
