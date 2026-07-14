"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { budgetsApi, categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BudgetForm } from "./budget-form";
import { BudgetCard } from "./budget-card";
import type { Budget } from "@/lib/validation/budget";
import type { Category } from "@/lib/validation/category";

type Status = "loading" | "ready" | "error";

export function BudgetList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const refresh = useCallback(async () => {
    const [budgetsRes, categoriesRes] = await Promise.all([
      budgetsApi.list(),
      categoriesApi.list(),
    ]);
    if (budgetsRes.ok && categoriesRes.ok) {
      setBudgets(await budgetsRes.json());
      const categories: Category[] = await categoriesRes.json();
      setExpenseCategories(categories.filter((category) => category.type === "EXPENSE"));
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

  async function handleDelete(budget: Budget) {
    if (!window.confirm(`Delete the budget for "${budget.category.name}"? This cannot be undone.`))
      return;
    const res = await budgetsApi.remove(budget.id);
    if (res.ok) {
      await refresh();
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
        Couldn&apos;t load budgets.
      </p>
    );
  }

  if (expenseCategories.length === 0) {
    return (
      <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
        You need an expense category before you can set a budget.{" "}
        <Link href="/categories" className="text-primary underline">
          Create one first
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Itemized — Your budgets
        </p>
        {!showCreateForm && (
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
          >
            + Add budget
          </Button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <BudgetForm
            categories={expenseCategories}
            onSuccess={() => {
              setShowCreateForm(false);
              refresh();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {budgets.length === 0 && !showCreateForm ? (
        <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
          No budgets yet. Set a monthly limit on one of your expense categories.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {budgets.map((budget) =>
            editingBudget?.id === budget.id ? (
              <div key={budget.id} className="col-span-full">
                <BudgetForm
                  budget={budget}
                  categories={expenseCategories}
                  onSuccess={() => {
                    setEditingBudget(null);
                    refresh();
                  }}
                  onCancel={() => setEditingBudget(null)}
                />
              </div>
            ) : (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => setEditingBudget(budget)}
                onDelete={() => handleDelete(budget)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
