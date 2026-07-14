import { StatCard } from "@/components/dashboard/stat-card";
import type { ReportsInsights, ReportsSummary } from "@/lib/validation/reports";

type InsightsSummaryProps = {
  totals: ReportsSummary["totals"];
  insights: ReportsInsights;
};

function formatPercentChange(pct: number | null) {
  if (pct === null) return "N/A";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export function InsightsSummary({ totals, insights }: InsightsSummaryProps) {
  const { topExpenseCategory } = insights;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total income" value={totals.income} tone="income" />
      <StatCard label="Total expense" value={totals.expense} tone="expense" />
      <StatCard label="Net" value={totals.net} />
      <StatCard
        label={topExpenseCategory ? `Top expense — ${topExpenseCategory.name}` : "Top expense category"}
        value={topExpenseCategory?.total ?? "0.00"}
        tone="expense"
      />
      <StatCard label="Avg. monthly expense" value={insights.averageMonthlyExpense} tone="expense" />
      <StatCard
        label="Vs. prior period"
        value={formatPercentChange(insights.percentChangeVsPriorPeriod)}
        unit="none"
      />
    </div>
  );
}
