import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CategoryList } from "@/components/categories/category-list";

export default function CategoriesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center">
        <section className="w-full px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-stamp">
              Ledger No. 004 — Categories
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Your categories.
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
              How you tag every expense and income entry once you start logging transactions.
            </p>

            <div className="mt-12">
              <CategoryList />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
