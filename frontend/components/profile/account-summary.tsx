"use client";

import { useAuth } from "@/lib/auth-context";

export function AccountSummary() {
  const { user } = useAuth();

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col items-center gap-2 border border-dashed border-border p-6 text-center">
      <h2 className="font-serif text-2xl tracking-tight">{fullName || user.email}</h2>
      {fullName && (
        <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
      )}
      <p className="font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
        Member since {memberSince}
      </p>
    </div>
  );
}
