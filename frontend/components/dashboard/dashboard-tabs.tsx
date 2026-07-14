"use client";

import { useState } from "react";
import { LayoutGrid, Wallet, Tag, Receipt, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSummary } from "./dashboard-summary";
import { WalletList } from "@/components/wallets/wallet-list";
import { CategoryList } from "@/components/categories/category-list";
import { TransactionList } from "@/components/transactions/transaction-list";
import { BudgetList } from "@/components/budgets/budget-list";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "wallets", label: "Wallets", icon: Wallet },
  { key: "categories", label: "Categories", icon: Tag },
  { key: "transactions", label: "Transactions", icon: Receipt },
  { key: "budgets", label: "Budgets", icon: PiggyBank },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function DashboardTabs() {
  const [active, setActive] = useState<TabKey>("overview");
  const [autoOpenTransactionForm, setAutoOpenTransactionForm] = useState(false);

  function goToTransactions(autoOpenCreate: boolean) {
    setActive("transactions");
    setAutoOpenTransactionForm(autoOpenCreate);
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 border-b border-dashed border-border pb-5">
        {tabs.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={active === key ? "default" : "outline"}
            onClick={() => (key === "transactions" ? goToTransactions(false) : setActive(key))}
            aria-current={active === key ? "page" : undefined}
            className="h-10 gap-1.5 rounded-none px-4 font-mono text-xs uppercase tracking-[0.14em]"
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      <div className="mt-8">
        {active === "overview" && (
          <DashboardSummary
            onViewAllTransactions={() => goToTransactions(false)}
            onAddTransaction={() => goToTransactions(true)}
          />
        )}
        {active === "wallets" && <WalletList />}
        {active === "categories" && <CategoryList />}
        {active === "transactions" && (
          <TransactionList
            autoOpenCreate={autoOpenTransactionForm}
            onAutoOpenHandled={() => setAutoOpenTransactionForm(false)}
          />
        )}
        {active === "budgets" && (
          <BudgetList onNavigateToCategories={() => setActive("categories")} />
        )}
      </div>
    </div>
  );
}
