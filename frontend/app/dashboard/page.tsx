import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-10">
          <div className="mx-auto max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 007 — Dashboard
            </p>
            <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
              Your dashboard.
            </h1>
            <p className="mt-2 max-w-lg text-base leading-7 text-muted-foreground">
              Everything in one place — switch tabs to manage wallets, categories,
              transactions, and budgets without leaving this screen.
            </p>

            <div className="mt-8">
              <DashboardTabs />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
