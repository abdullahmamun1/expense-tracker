"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import type { DashboardSummary as DashboardSummaryData } from "@/lib/validation/dashboard";
import { StatCard } from "./stat-card";
import { CategoryBreakdown } from "./category-breakdown";
import { RecentTransactions } from "./recent-transactions";

type Status = "loading" | "ready" | "error";

export function DashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    const res = await dashboardApi.summary();
    if (res.ok) {
      setSummary(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Syncing with the backend on mount, not deriving state from props/state —
    // see the identical note in lib/auth-context.tsx for why this is exempt
    // from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  if (status === "loading") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (status === "error" || !summary) {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
        Couldn&apos;t load the dashboard.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Net worth" value={summary.netWorth} />
        <StatCard label="Income this month" value={summary.month.income} tone="income" />
        <StatCard label="Expense this month" value={summary.month.expense} tone="expense" />
      </div>

      <div className="mt-12">
        <CategoryBreakdown byCategory={summary.month.byCategory} />
      </div>

      <div className="mt-12">
        <RecentTransactions transactions={summary.recentTransactions} />
      </div>
    </div>
  );
}
