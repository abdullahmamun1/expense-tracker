"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { transactionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn, toLocalISODate } from "@/lib/utils";
import { TransactionForm } from "./transaction-form";
import { TransactionCard } from "./transaction-card";
import type { Transaction } from "@/lib/validation/transaction";
import type { Wallet } from "@/lib/validation/wallet";
import type { Category } from "@/lib/validation/category";

type TransactionCalendarProps = {
  wallets: Wallet[];
  categories: Category[];
  walletFilter?: string;
  categoryFilter?: string;
};

type Status = "loading" | "ready" | "error";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildGridDays(monthCursor: Date) {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  const totalCells = Math.ceil((firstOfMonth.getDay() + lastOfMonth.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return {
      date,
      dateStr: toLocalISODate(date),
      inMonth: date.getMonth() === month,
    };
  });
}

export function TransactionCalendar({
  wallets,
  categories,
  walletFilter,
  categoryFilter,
}: TransactionCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const gridDays = useMemo(() => buildGridDays(monthCursor), [monthCursor]);
  const rangeFrom = toLocalISODate(gridDays[0].date);
  const rangeTo = toLocalISODate(gridDays[gridDays.length - 1].date);

  const refresh = useCallback(async () => {
    setStatus("loading");
    const res = await transactionsApi.list({
      walletId: walletFilter,
      categoryId: categoryFilter,
      from: rangeFrom,
      to: rangeTo,
    });
    if (res.ok) {
      setTransactions(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, [rangeFrom, rangeTo, walletFilter, categoryFilter]);

  useEffect(() => {
    // Syncing with the backend whenever the visible month or filters change —
    // see the identical note in lib/auth-context.tsx for why this is exempt
    // from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const byDate = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const day = transaction.occurredAt.slice(0, 10);
    const existing = byDate.get(day);
    if (existing) {
      existing.push(transaction);
    } else {
      byDate.set(day, [transaction]);
    }
  }

  const todayStr = toLocalISODate(new Date());
  const selectedTransactions = selectedDate ? (byDate.get(selectedDate) ?? []) : [];
  const canCreate = wallets.length > 0 && categories.length > 0;

  function changeMonth(delta: number) {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSelectedDate(null);
    setShowCreateForm(false);
    setEditingTransaction(null);
  }

  function selectDay(dateStr: string) {
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
    setShowCreateForm(false);
    setEditingTransaction(null);
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm("Delete this transaction? This cannot be undone.")) return;
    const res = await transactionsApi.remove(transaction.id);
    if (res.ok) {
      await refresh();
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(-1)}
            className="rounded-none px-2"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-40 text-center font-serif text-xl tracking-tight">
            {monthCursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth(1)}
            className="rounded-none px-2"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            setSelectedDate(todayStr);
          }}
          className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
        >
          Today
        </Button>
      </div>

      {status === "loading" && transactions.length === 0 ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Loading…
        </p>
      ) : status === "error" ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
          Couldn&apos;t load transactions.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-px border border-border bg-border">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="bg-background py-2 text-center font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground"
              >
                {weekday}
              </div>
            ))}
            {gridDays.map((cell) => {
              const dayTransactions = byDate.get(cell.dateStr) ?? [];
              const net = dayTransactions.reduce((sum, tx) => {
                const amount = Number(tx.amount);
                return sum + (tx.category.type === "INCOME" ? amount : -amount);
              }, 0);
              const isSelected = selectedDate === cell.dateStr;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => selectDay(cell.dateStr)}
                  className={cn(
                    "flex min-h-20 flex-col gap-1 bg-background p-1.5 text-left transition-colors hover:bg-accent/40 sm:min-h-24 sm:p-2",
                    !cell.inMonth && "opacity-40",
                    isSelected && "ring-2 ring-inset ring-primary"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-xs",
                      isToday
                        ? "flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {cell.date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dayTransactions.slice(0, 4).map((tx) => (
                      <span
                        key={tx.id}
                        className="size-1.5 rounded-full"
                        style={{ backgroundColor: tx.category.color }}
                      />
                    ))}
                    {dayTransactions.length > 4 && (
                      <span className="font-mono text-[0.6rem] text-muted-foreground">
                        +{dayTransactions.length - 4}
                      </span>
                    )}
                  </div>
                  {dayTransactions.length > 0 && (
                    <span
                      className={cn(
                        "mt-auto font-mono text-[0.65rem]",
                        net >= 0 ? "text-primary" : "text-destructive"
                      )}
                    >
                      {net >= 0 ? "+" : "-"}${Math.abs(net).toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-8 border-t border-dashed border-border pt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {!showCreateForm && canCreate && (
                  <Button
                    size="sm"
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
                  >
                    + Add transaction
                  </Button>
                )}
              </div>

              {showCreateForm && (
                <div className="mb-6">
                  <TransactionForm
                    wallets={wallets}
                    categories={categories}
                    defaultDate={selectedDate}
                    onSuccess={() => {
                      setShowCreateForm(false);
                      refresh();
                    }}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              )}

              {selectedTransactions.length === 0 && !showCreateForm ? (
                <p className="border-y border-dashed border-border py-8 text-center font-serif text-base text-muted-foreground">
                  No transactions on this day.
                </p>
              ) : (
                <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
                  {selectedTransactions.map((transaction, index) =>
                    editingTransaction?.id === transaction.id ? (
                      <div key={transaction.id} className="py-7">
                        <TransactionForm
                          wallets={wallets}
                          categories={categories}
                          transaction={transaction}
                          onSuccess={() => {
                            setEditingTransaction(null);
                            refresh();
                          }}
                          onCancel={() => setEditingTransaction(null)}
                        />
                      </div>
                    ) : (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        index={index}
                        onEdit={() => setEditingTransaction(transaction)}
                        onDelete={() => handleDelete(transaction)}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
