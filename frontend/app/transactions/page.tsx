import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 005 — Transactions
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Your transactions.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              Every entry logged against a wallet and a category, most recent first.
            </p>

            <div className="mt-12">
              <TransactionList />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
