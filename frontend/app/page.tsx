import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroCta } from "@/components/hero-cta";

const lineItems = [
  {
    no: "01",
    title: "Track every expense",
    description: "Log purchases in seconds and see exactly where your money goes.",
  },
  {
    no: "02",
    title: "Set smart budgets",
    description: "Create monthly budgets per category and get warned before you overspend.",
  },
  {
    no: "03",
    title: "Visualize your spending",
    description: "Clear charts break down spending by category, month, and trend over time.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center">
        <section className="relative flex w-full flex-col items-center overflow-hidden px-6 py-28 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center font-mono text-[6.5rem] font-medium leading-none text-foreground/[0.045] sm:text-[9rem]"
          >
            $0.00 → $∞
          </div>

          <p
            className="animate-fade-up font-mono text-xs uppercase tracking-[0.22em] text-stamp"
            style={{ animationDelay: "0ms" }}
          >
            Ledger No. 001 — Personal Finance
          </p>
          <h1
            className="animate-fade-up mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Know where your money goes.
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-lg text-lg leading-8 text-muted-foreground"
            style={{ animationDelay: "180ms" }}
          >
            ExpenseTracker helps you log spending, set budgets, and see your habits
            at a glance — no spreadsheets required.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "270ms" }}
          >
            <HeroCta />
            <a
              href="#features"
              className="flex h-12 items-center justify-center px-6 font-mono text-sm uppercase tracking-[0.12em] text-foreground/80 underline decoration-border decoration-1 underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
            >
              Learn more
            </a>
          </div>
        </section>

        <section
          id="features"
          className="w-full border-t border-border bg-card/60"
        >
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="mb-10 text-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Itemized — What&apos;s included
            </p>
            <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
              {lineItems.map((item) => (
                <div
                  key={item.no}
                  className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-7 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-mono text-sm text-stamp">{item.no}</span>
                  <div>
                    <h3 className="font-serif text-xl tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-base leading-7 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
