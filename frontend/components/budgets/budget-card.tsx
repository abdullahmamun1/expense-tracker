"use client";

import { Button } from "@/components/ui/button";
import type { Budget } from "@/lib/validation/budget";

type BudgetCardProps = {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
};

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const pct = Math.min(budget.percentUsed, 100);
  const overBudget = Number(budget.actualSpent) >= Number(budget.monthlyLimit);

  return (
    <div className="group flex flex-col gap-3 border border-dashed border-border p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 font-serif text-lg tracking-tight">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: budget.category.color }}
          />
          {budget.category.name}
        </span>
        <span className="font-mono text-sm text-muted-foreground">${budget.monthlyLimit}</span>
      </div>

      <div className="h-1.5 w-full bg-border/60">
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            backgroundColor: overBudget ? "var(--destructive)" : budget.category.color,
          }}
        />
      </div>

      <p
        className={
          overBudget
            ? "font-mono text-xs text-destructive"
            : "font-mono text-xs text-muted-foreground"
        }
      >
        ${budget.actualSpent} spent — ${budget.remaining} remaining
      </p>

      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="rounded-none font-mono text-xs uppercase tracking-[0.14em] text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
