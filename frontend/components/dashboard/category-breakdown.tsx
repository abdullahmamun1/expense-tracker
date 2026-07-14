import type { CategoryBreakdownEntry } from "@/lib/validation/dashboard";

type CategoryBreakdownProps = {
  byCategory: CategoryBreakdownEntry[];
};

function BreakdownGroup({
  title,
  entries,
}: {
  title: string;
  entries: CategoryBreakdownEntry[];
}) {
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map((entry) => Number(entry.total)));

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.categoryId}>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 font-serif text-base tracking-tight">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="font-mono text-sm text-muted-foreground">${entry.total}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full bg-border/60">
              <div
                className="h-full"
                style={{
                  width: `${max > 0 ? (Number(entry.total) / max) * 100 : 0}%`,
                  backgroundColor: entry.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryBreakdown({ byCategory }: CategoryBreakdownProps) {
  if (byCategory.length === 0) {
    return (
      <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
        No spending recorded this month yet.
      </p>
    );
  }

  const expenses = byCategory.filter((entry) => entry.type === "EXPENSE");
  const income = byCategory.filter((entry) => entry.type === "INCOME");

  return (
    <div className="flex flex-col gap-8">
      <BreakdownGroup title="Expenses this month" entries={expenses} />
      <BreakdownGroup title="Income this month" entries={income} />
    </div>
  );
}
