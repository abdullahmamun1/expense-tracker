import Link from "next/link";
import { ReceiptCard } from "@/components/auth/receipt-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none font-mono text-[13rem] font-medium text-foreground/[0.04] sm:text-[16rem]"
      >
        =
      </div>

      <ReceiptCard className="animate-fade-up">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-stamp">
          Returning Ledger — Sign In
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Pick up your books right where you left them.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <div className="mt-8 border-t border-dashed border-border pt-6 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Open a ledger
          </Link>
        </div>
      </ReceiptCard>
    </div>
  );
}
