import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 007 — Dashboard
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Your dashboard.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              Net worth, this month&apos;s spending, and your most recent activity at a glance.
            </p>

            <div className="mt-12">
              <DashboardSummary />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
