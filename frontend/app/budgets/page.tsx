import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BudgetList } from "@/components/budgets/budget-list";

export default function BudgetsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 008 — Budgets
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Your budgets.</h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              Set a monthly limit on an expense category and track how much of it you&apos;ve
              used this month.
            </p>

            <div className="mt-12">
              <BudgetList />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
