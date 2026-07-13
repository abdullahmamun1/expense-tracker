import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WalletList } from "@/components/wallets/wallet-list";

export default function WalletsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 003 — Wallets
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Your wallets.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              Every account and cash pile you track spending against.
            </p>

            <div className="mt-12">
              <WalletList />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
