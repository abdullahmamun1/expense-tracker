import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { createWalletSchema, updateWalletSchema } from "./wallet.validators.js";
import { z } from "zod";

type CreateWalletInput = z.infer<typeof createWalletSchema>;
type UpdateWalletInput = z.infer<typeof updateWalletSchema>;

export function listWallets(userId: string) {
  return prisma.wallet.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

// Net effect of transactions on each wallet: income adds, expense subtracts,
// direction is derived from the joined category's type (never stored on the row).
async function getWalletNetDeltas(userId: string, walletIds: string[]) {
  const net = new Map<string, Prisma.Decimal>();
  if (walletIds.length === 0) return net;

  const [income, expense] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["walletId"],
      where: { userId, walletId: { in: walletIds }, category: { type: "INCOME" } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["walletId"],
      where: { userId, walletId: { in: walletIds }, category: { type: "EXPENSE" } },
      _sum: { amount: true },
    }),
  ]);

  for (const row of income) {
    net.set(row.walletId, row._sum.amount ?? new Prisma.Decimal(0));
  }
  for (const row of expense) {
    const current = net.get(row.walletId) ?? new Prisma.Decimal(0);
    net.set(row.walletId, current.minus(row._sum.amount ?? 0));
  }
  return net;
}

function withCurrentBalance<T extends { id: string; startingBalance: Prisma.Decimal }>(
  wallet: T,
  net: Map<string, Prisma.Decimal>
) {
  return {
    ...wallet,
    currentBalance: wallet.startingBalance.plus(net.get(wallet.id) ?? new Prisma.Decimal(0)).toFixed(2),
  };
}

export async function listWalletsWithBalance(userId: string) {
  const wallets = await listWallets(userId);
  const net = await getWalletNetDeltas(
    userId,
    wallets.map((wallet) => wallet.id)
  );
  return wallets.map((wallet) => withCurrentBalance(wallet, net));
}

export async function getOwnedWalletWithBalance(id: string, userId: string) {
  const wallet = await findOwnedWallet(id, userId);
  if (!wallet) return null;
  const net = await getWalletNetDeltas(userId, [wallet.id]);
  return withCurrentBalance(wallet, net);
}

export function createWallet(userId: string, data: CreateWalletInput) {
  return prisma.wallet.create({
    data: { ...data, userId },
  });
}

export function findOwnedWallet(id: string, userId: string) {
  return prisma.wallet.findFirst({ where: { id, userId } });
}

export async function updateWallet(id: string, userId: string, data: UpdateWalletInput) {
  const wallet = await findOwnedWallet(id, userId);
  if (!wallet) return null;
  return prisma.wallet.update({ where: { id }, data });
}

export async function deleteWallet(id: string, userId: string) {
  const wallet = await findOwnedWallet(id, userId);
  if (!wallet) return "not_found" as const;
  const transactionCount = await prisma.transaction.count({ where: { walletId: id } });
  if (transactionCount > 0) return "has_transactions" as const;
  await prisma.wallet.delete({ where: { id } });
  return "deleted" as const;
}
