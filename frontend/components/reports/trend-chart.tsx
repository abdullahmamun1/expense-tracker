import type { MonthlyTrendEntry } from "@/lib/validation/reports";

type TrendChartProps = {
  trend: MonthlyTrendEntry[];
};

function monthLabel(month: string) {
  const [year, monthNum] = month.split("-").map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function TrendChart({ trend }: TrendChartProps) {
  const max = Math.max(1, ...trend.flatMap((entry) => [Number(entry.income), Number(entry.expense)]));

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Income vs. expense by month
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {trend.map((entry) => (
          <div key={entry.month}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-serif text-base tracking-tight">{monthLabel(entry.month)}</span>
              <span className="font-mono text-sm text-muted-foreground">
                <span className="text-primary">+${entry.income}</span>{" "}
                <span className="text-destructive">-${entry.expense}</span>
              </span>
            </div>
            <div className="mt-1.5 flex flex-col gap-1">
              <div className="h-1.5 w-full bg-border/60">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(Number(entry.income) / max) * 100}%` }}
                />
              </div>
              <div className="h-1.5 w-full bg-border/60">
                <div
                  className="h-full bg-destructive"
                  style={{ width: `${(Number(entry.expense) / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
