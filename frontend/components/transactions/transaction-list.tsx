"use client";

import { useCallback, useEffect, useState } from "react";
import { transactionsApi, walletsApi, categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionForm } from "./transaction-form";
import { TransactionCard } from "./transaction-card";
import { TransactionCalendar } from "./transaction-calendar";
import type { Transaction } from "@/lib/validation/transaction";
import { walletLabel, type Wallet } from "@/lib/validation/wallet";
import type { Category } from "@/lib/validation/category";

type Status = "loading" | "ready" | "error";
type View = "list" | "calendar";

const ALL = "all";

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [walletFilter, setWalletFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [view, setView] = useState<View>("list");

  const refresh = useCallback(
    async (filters?: { walletId?: string; categoryId?: string }) => {
      const [txRes, walletsRes, categoriesRes] = await Promise.all([
        transactionsApi.list(filters),
        walletsApi.list(),
        categoriesApi.list(),
      ]);
      if (txRes.ok && walletsRes.ok && categoriesRes.ok) {
        setTransactions(await txRes.json());
        setWallets(await walletsRes.json());
        setCategories(await categoriesRes.json());
        setStatus("ready");
      } else {
        setStatus("error");
      }
    },
    [],
  );

  useEffect(() => {
    // Syncing with the backend on mount, not deriving state from props/state —
    // see the identical note in lib/auth-context.tsx for why this is exempt
    // from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function applyFilters(
    nextWalletFilter: string,
    nextCategoryFilter: string,
  ) {
    setStatus("loading");
    const res = await transactionsApi.list({
      walletId: nextWalletFilter === ALL ? undefined : nextWalletFilter,
      categoryId: nextCategoryFilter === ALL ? undefined : nextCategoryFilter,
    });
    if (res.ok) {
      setTransactions(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }

  function handleWalletFilterChange(value: string | null) {
    const next = value ?? ALL;
    setWalletFilter(next);
    applyFilters(next, categoryFilter);
  }

  function handleCategoryFilterChange(value: string | null) {
    const next = value ?? ALL;
    setCategoryFilter(next);
    applyFilters(walletFilter, next);
  }

  async function refreshList() {
    await applyFilters(walletFilter, categoryFilter);
  }

  async function handleDelete(transaction: Transaction) {
    if (!window.confirm("Delete this transaction? This cannot be undone."))
      return;
    const res = await transactionsApi.remove(transaction.id);
    if (res.ok) {
      await refreshList();
    }
  }

  if (status === "loading") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
        Couldn&apos;t load transactions.
      </p>
    );
  }

  const canCreate = wallets.length > 0 && categories.length > 0;

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Itemized — Your transactions
        </p>
        <div className="flex items-center gap-3">
          <div className="flex border border-border">
            <button
              type="button"
              onClick={() => {
                setView("list");
                refreshList();
              }}
              className={cn(
                "px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em]",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em]",
                view === "calendar"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Calendar
            </button>
          </div>
          {view === "list" && !showCreateForm && canCreate && (
            <Button
              size="sm"
              onClick={() => setShowCreateForm(true)}
              className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
            >
              + Add transaction
            </Button>
          )}
        </div>
      </div>

      {!canCreate && !showCreateForm && (
        <p className="mb-8 border-y border-dashed border-border py-6 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Add a wallet and a category before logging transactions.
        </p>
      )}

      {canCreate && (
        <div className="mb-8 flex flex-wrap gap-4">
          <Select
            items={{
              [ALL]: "All wallets",
              ...Object.fromEntries(wallets.map((w) => [w.id, walletLabel(w)])),
            }}
            value={walletFilter}
            onValueChange={handleWalletFilterChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All wallets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All wallets</SelectItem>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {walletLabel(wallet)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={{
              [ALL]: "All categories",
              ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
            }}
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {view === "calendar" ? (
        <TransactionCalendar
          wallets={wallets}
          categories={categories}
          walletFilter={walletFilter === ALL ? undefined : walletFilter}
          categoryFilter={categoryFilter === ALL ? undefined : categoryFilter}
        />
      ) : (
        <>
          {showCreateForm && (
            <div className="mb-8">
              <TransactionForm
                wallets={wallets}
                categories={categories}
                onSuccess={() => {
                  setShowCreateForm(false);
                  refreshList();
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          {transactions.length === 0 && !showCreateForm ? (
            <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
              No transactions yet. Log your first one to start the ledger.
            </p>
          ) : (
            <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
              {transactions.map((transaction, index) =>
                editingTransaction?.id === transaction.id ? (
                  <div key={transaction.id} className="py-7">
                    <TransactionForm
                      wallets={wallets}
                      categories={categories}
                      transaction={transaction}
                      onSuccess={() => {
                        setEditingTransaction(null);
                        refreshList();
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
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
