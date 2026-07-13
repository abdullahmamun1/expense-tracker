import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const values = [
  {
    no: "01",
    title: "Radical clarity",
    description: "Every number is traceable back to a real purchase — no black boxes, no vague categories.",
  },
  {
    no: "02",
    title: "No hidden fees",
    description: "The tool that watches your spending shouldn't quietly add to it. What you see is what it costs.",
  },
  {
    no: "03",
    title: "Built for real habits",
    description: "Budgets that bend with an irregular income and a messy week, not spreadsheets that judge you.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center">
        <section className="relative flex w-full flex-col items-center overflow-hidden px-6 py-28 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 w-full -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-mono text-[6.5rem] font-medium leading-none text-foreground/[0.045] sm:text-[9rem]"
          >
            No. 2026
          </div>

          <p
            className="animate-fade-up font-mono text-xs uppercase tracking-[0.22em] text-stamp"
            style={{ animationDelay: "0ms" }}
          >
            Ledger No. 002 — About
          </p>
          <h1
            className="animate-fade-up mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl"
            style={{ animationDelay: "90ms" }}
          >
            Every dollar, accounted for.
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-lg text-lg leading-8 text-muted-foreground"
            style={{ animationDelay: "180ms" }}
          >
            ExpenseTracker started as a plain paper ledger and a bad habit of losing receipts.
            We built the tool we wished we had.
          </p>
        </section>

        <section className="w-full border-t border-border bg-card/60">
          <div className="mx-auto max-w-2xl px-6 py-20">
            <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Our story
            </p>
            <div className="space-y-5 font-serif text-lg leading-8 text-foreground/90">
              <p>
                Most expense trackers ask you to change how you spend. We think that&apos;s
                backwards — the habit worth building isn&apos;t discipline, it&apos;s visibility.
                Once you can actually see where the money goes, the rest tends to follow on its
                own.
              </p>
              <p>
                So we went back to the oldest tool for the job: the ledger. One line per entry,
                balanced to the cent, with nothing hidden in a dashboard you have to learn to
                read. ExpenseTracker is that idea, rebuilt for a phone in your pocket instead of
                a notebook in a drawer.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <p className="mb-10 text-center font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Itemized — What we stand for
            </p>
            <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
              {values.map((value) => (
                <div
                  key={value.no}
                  className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-1 py-7 sm:grid-cols-[3rem_1fr]"
                >
                  <span className="font-mono text-sm text-stamp">{value.no}</span>
                  <div>
                    <h3 className="font-serif text-xl tracking-tight">{value.title}</h3>
                    <p className="mt-1.5 text-base leading-7 text-muted-foreground">
                      {value.description}
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
