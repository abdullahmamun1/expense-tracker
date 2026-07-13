"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const { user, status, logout } = useAuth();

  return (
    <header className="w-full border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary font-mono text-sm text-primary">
            ¢
          </span>
          <span className="font-serif text-lg tracking-tight">ExpenseTracker</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/about"
            className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
          >
            About
          </Link>

          {status === "loading" ? null : status === "authenticated" ? (
            <div className="flex items-center gap-4">
              <Link
                href="/wallets"
                className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
              >
                Wallets
              </Link>
              <Link
                href="/categories"
                className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
              >
                Categories
              </Link>
              <Link
                href="/transactions"
                className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
              >
                Transactions
              </Link>
              <span className="hidden font-mono text-xs uppercase tracking-wide text-muted-foreground sm:inline">
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="font-mono text-xs uppercase tracking-[0.14em] hover:text-primary"
              >
                Log in
              </Link>
              <Button
                size="sm"
                nativeButton={false}
                className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
                render={<Link href="/signup" />}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
