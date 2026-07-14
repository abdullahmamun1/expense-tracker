"use client";

import { useCallback, useEffect, useState } from "react";
import { reportsApi } from "@/lib/api";
import { toLocalISODate } from "@/lib/utils";
import type { ReportPreset, ReportRangeMode, ReportsSummary } from "@/lib/validation/reports";
import { ReportFilters } from "./report-filters";
import { TrendChart } from "./trend-chart";
import { CategoryBreakdownRange } from "./category-breakdown-range";
import { InsightsSummary } from "./insights-summary";
import { ExportButton } from "./export-button";

type Status = "loading" | "ready" | "error" | "invalid";

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

function presetRange(preset: ReportPreset): { from: string; to: string } {
  const now = new Date();
  if (preset === "YTD") {
    return { from: toLocalISODate(new Date(now.getFullYear(), 0, 1)), to: toLocalISODate(now) };
  }
  const months = { "3M": 3, "6M": 6, "12M": 12 }[preset];
  const from = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  return { from: toLocalISODate(from), to: toLocalISODate(endOfCurrentMonth()) };
}

export function ReportsPanel() {
  const initial = presetRange("6M");
  const [mode, setMode] = useState<ReportRangeMode>("6M");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    if (to < from) {
      setStatus("invalid");
      return;
    }
    setStatus("loading");
    const res = await reportsApi.summary(from, to);
    if (res.ok) {
      setSummary(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, [from, to]);

  useEffect(() => {
    // Syncing with the backend whenever the selected range changes, not deriving
    // state from props/state — see the identical note in lib/auth-context.tsx for
    // why this is exempt from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  function handlePresetChange(preset: ReportPreset) {
    const range = presetRange(preset);
    setMode(preset);
    setFrom(range.from);
    setTo(range.to);
  }

  function handleCustomRangeChange(range: { from: string; to: string }) {
    setMode("custom");
    setFrom(range.from);
    setTo(range.to);
  }

  const isEmpty = summary ? summary.byCategory.length === 0 : false;

  return (
    <div className="w-full">
      <ReportFilters
        mode={mode}
        from={from}
        to={to}
        onPresetChange={handlePresetChange}
        onCustomRangeChange={handleCustomRangeChange}
      />

      <div className="mt-8">
        {status === "loading" && (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
            Loading…
          </p>
        )}

        {status === "error" && (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
            Couldn&apos;t load reports.
          </p>
        )}

        {status === "invalid" && (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
            &quot;To&quot; date can&apos;t be before &quot;from&quot; date.
          </p>
        )}

        {status === "ready" && summary && (
          <div className="flex flex-col gap-12">
            <div className="flex justify-end">
              <ExportButton from={from} to={to} disabled={isEmpty} />
            </div>

            <InsightsSummary totals={summary.totals} insights={summary.insights} />

            {isEmpty ? (
              <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
                No transactions in this range.
              </p>
            ) : (
              <>
                <TrendChart trend={summary.trend} />

                <CategoryBreakdownRange
                  byCategory={summary.byCategory}
                  rangeLabel={`${summary.range.from} to ${summary.range.to}`}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
