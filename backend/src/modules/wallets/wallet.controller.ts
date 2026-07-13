import { Request, Response } from "express";
import { createWalletSchema, updateWalletSchema } from "./wallet.validators.js";
import { getUserId } from "../auth/auth.middleware.js";
import {
  createWallet,
  deleteWallet,
  getOwnedWalletWithBalance,
  listWalletsWithBalance,
  updateWallet,
} from "./wallet.service.js";

export async function list(req: Request, res: Response) {
  const wallets = await listWalletsWithBalance(getUserId(req));
  res.status(200).json(wallets);
}

export async function create(req: Request, res: Response) {
  const parsed = createWalletSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid wallet data" });
  }
  const wallet = await createWallet(getUserId(req), parsed.data);
  res.status(201).json(wallet);
}

export async function get(req: Request, res: Response) {
  const wallet = await getOwnedWalletWithBalance(req.params.id, getUserId(req));
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  res.status(200).json(wallet);
}

export async function update(req: Request, res: Response) {
  const parsed = updateWalletSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid wallet data" });
  }
  const wallet = await updateWallet(req.params.id, getUserId(req), parsed.data);
  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }
  res.status(200).json(wallet);
}

export async function remove(req: Request, res: Response) {
  const result = await deleteWallet(req.params.id, getUserId(req));
  if (result === "not_found") {
    return res.status(404).json({ message: "Wallet not found" });
  }
  if (result === "has_transactions") {
    return res.status(409).json({ message: "Delete this wallet's transactions first" });
  }
  res.status(204).end();
}
