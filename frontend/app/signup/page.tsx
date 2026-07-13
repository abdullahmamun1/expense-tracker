import Link from "next/link";
import { ReceiptCard } from "@/components/auth/receipt-card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-mono text-[13rem] font-medium text-foreground/[0.04] sm:text-[16rem]"
      >
        +
      </div>

      <ReceiptCard className="animate-fade-up">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-stamp">
          New Ledger — Entry 001
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
          Open your ledger.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A running record of every dollar, from today onward.
        </p>

        <div className="mt-8">
          <SignupForm />
        </div>

        <div className="mt-8 border-t border-dashed border-border pt-6 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Already keeping books?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </ReceiptCard>
    </div>
  );
}
