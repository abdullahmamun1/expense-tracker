"use client";

import { useCallback, useEffect, useState } from "react";
import { walletsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { WalletForm } from "./wallet-form";
import { WalletCard } from "./wallet-card";
import type { Wallet } from "@/lib/validation/wallet";

type Status = "loading" | "ready" | "error";

export function WalletList() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const refresh = useCallback(async () => {
    const res = await walletsApi.list();
    if (res.ok) {
      setWallets(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Syncing with the backend on mount, not deriving state from props/state —
    // see the identical note in lib/auth-context.tsx for why this is exempt
    // from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleDelete(wallet: Wallet) {
    if (!window.confirm(`Delete "${wallet.name}"? This cannot be undone.`)) return;
    const res = await walletsApi.remove(wallet.id);
    if (res.ok) {
      await refresh();
    }
  }

  if (status === "loading") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
        Couldn&apos;t load wallets.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Itemized — Your wallets
        </p>
        {!showCreateForm && (
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
          >
            + Add wallet
          </Button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <WalletForm
            onSuccess={() => {
              setShowCreateForm(false);
              refresh();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {wallets.length === 0 && !showCreateForm ? (
        <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
          No wallets yet. Add your first one to start tracking.
        </p>
      ) : (
        <div className="divide-y divide-dashed divide-border border-y border-dashed border-border">
          {wallets.map((wallet, index) =>
            editingWallet?.id === wallet.id ? (
              <div key={wallet.id} className="py-7">
                <WalletForm
                  wallet={wallet}
                  onSuccess={() => {
                    setEditingWallet(null);
                    refresh();
                  }}
                  onCancel={() => setEditingWallet(null)}
                />
              </div>
            ) : (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                index={index}
                onEdit={() => setEditingWallet(wallet)}
                onDelete={() => handleDelete(wallet)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
