"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function HeroCta() {
  const { user, status } = useAuth();

  if (status === "authenticated") {
    return (
      <Link
        href="/dashboard"
        className="flex h-12 items-center justify-center px-2 font-mono text-sm text-muted-foreground underline decoration-border decoration-1 underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
      >
        Logged in as {user?.email} — go to your dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/signup"
      className="group relative flex h-12 items-center justify-center rounded-none border-2 border-primary bg-primary px-7 font-mono text-sm uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5 hover:rotate-[-0.5deg] active:translate-y-0 active:rotate-0"
    >
      Start tracking — free
    </Link>
  );
}
