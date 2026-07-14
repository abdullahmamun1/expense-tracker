import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/validation/transaction";

type RecentTransactionsProps = {
  transactions: Transaction[];
  onViewAll: () => void;
};

export function RecentTransactions({ transactions, onViewAll }: RecentTransactionsProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Recent transactions
        </p>
        <button
          type="button"
          onClick={onViewAll}
          className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
        >
          View all →
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
          No transactions yet.
        </p>
      ) : (
        <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
          {transactions.map((transaction) => {
            const isIncome = transaction.category.type === "INCOME";
            const date = new Date(transaction.occurredAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={transaction.id}
                className="flex flex-wrap items-start justify-between gap-4 py-5"
              >
                <div>
                  <h3 className="flex items-center gap-2 font-serif text-lg tracking-tight">
                    <span
                      className="inline-block size-3 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    {transaction.category.name}
                    {transaction.note ? (
                      <span className="font-sans text-sm text-muted-foreground">
                        — {transaction.note}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {date} — {transaction.wallet.name}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-mono text-base",
                    isIncome ? "text-primary" : "text-destructive"
                  )}
                >
                  {isIncome ? "+" : "-"}${transaction.amount}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
