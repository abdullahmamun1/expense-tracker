"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

const navLinkClass = "font-mono text-xs uppercase tracking-[0.14em] hover:text-primary";

const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallets", label: "Wallets" },
  { href: "/categories", label: "Categories" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
];

export function SiteHeader() {
  const { user, status, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary font-mono text-sm text-primary">
            ¢
          </span>
          <span className="font-serif text-lg tracking-tight">ExpenseTracker</span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          <Link href="/about" className={navLinkClass}>
            About
          </Link>

          {status === "loading" ? null : status === "authenticated" ? (
            <div className="flex items-center gap-4">
              {authenticatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClass}>
                  {link.label}
                </Link>
              ))}
              <span className="hidden font-mono text-xs uppercase tracking-wide text-muted-foreground xl:inline">
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
            <div className="flex items-center gap-4">
              <Link href="/login" className={navLinkClass}>
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

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex size-9 items-center justify-center border border-border lg:hidden"
        >
          {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-dashed border-border px-4 py-5 sm:px-6 lg:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/about" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              About
            </Link>

            {status === "authenticated" ? (
              <>
                {authenticatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-fit rounded-none font-mono text-xs uppercase tracking-[0.14em]"
                >
                  Log out
                </Button>
              </>
            ) : status === "unauthenticated" ? (
              <>
                <Link href="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Button
                  size="sm"
                  nativeButton={false}
                  onClick={() => setMenuOpen(false)}
                  className="w-fit rounded-none font-mono text-xs uppercase tracking-[0.14em]"
                  render={<Link href="/signup" />}
                >
                  Sign up
                </Button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
