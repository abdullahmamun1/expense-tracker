"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/validation/transaction";

type TransactionCardProps = {
  transaction: Transaction;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function TransactionCard({ transaction, index, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.category.type === "INCOME";
  const date = new Date(transaction.occurredAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 py-7 sm:grid-cols-[3rem_1fr]">
      <span className="font-mono text-sm text-stamp">{String(index + 1).padStart(2, "0")}</span>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-xl tracking-tight">
            <span
              className="inline-block size-3 rounded-full"
              style={{ backgroundColor: transaction.category.color }}
            />
            {transaction.category.name}
            {transaction.note ? (
              <span className="font-sans text-base text-muted-foreground">
                — {transaction.note}
              </span>
            ) : null}
          </h3>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {date} — {transaction.wallet.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "font-mono text-lg",
              isIncome ? "text-primary" : "text-destructive"
            )}
          >
            {isIncome ? "+" : "-"}${transaction.amount}
          </span>
          <div className="flex gap-2">
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
      </div>
    </div>
  );
}
