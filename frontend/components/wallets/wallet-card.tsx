"use client";

import { Button } from "@/components/ui/button";
import { walletTypeLabels, type Wallet } from "@/lib/validation/wallet";

type WalletCardProps = {
  wallet: Wallet;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
};

export function WalletCard({ wallet, index, onEdit, onDelete }: WalletCardProps) {
  const startingBalance = Number(wallet.startingBalance).toFixed(2);
  const currentBalance = wallet.currentBalance ?? startingBalance;
  const hasTransactions = currentBalance !== startingBalance;

  return (
    <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-5 gap-y-3 py-7 sm:grid-cols-[3rem_1fr]">
      <span className="font-mono text-sm text-stamp">{String(index + 1).padStart(2, "0")}</span>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl tracking-tight">{wallet.name}</h3>
          <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {walletTypeLabels[wallet.type]} — ${currentBalance}
          </p>
          {hasTransactions && (
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground/70">
              Started at ${startingBalance}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="rounded-none font-mono text-xs uppercase tracking-[0.14em] text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
