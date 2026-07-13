import { Request, Response } from "express";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionListQuerySchema,
  suggestCategoryQuerySchema,
} from "./transaction.validators.js";
import { getUserId } from "../auth/auth.middleware.js";
import { findOwnedWallet } from "../wallets/wallet.service.js";
import { findOwnedCategory } from "../categories/category.service.js";
import {
  createTransaction,
  deleteTransaction,
  findOwnedTransaction,
  listTransactions,
  updateTransaction,
  suggestCategory,
} from "./transaction.service.js";

export async function list(req: Request, res: Response) {
  const parsed = transactionListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid filter parameters" });
  }
  const transactions = await listTransactions(getUserId(req), parsed.data);
  res.status(200).json(transactions);
}

export async function suggest(req: Request, res: Response) {
  const parsed = suggestCategoryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }
  const categoryId = await suggestCategory(getUserId(req), parsed.data.note);
  res.status(200).json({ categoryId });
}

export async function create(req: Request, res: Response) {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid transaction data" });
  }
  const userId = getUserId(req);
  const [wallet, category] = await Promise.all([
    findOwnedWallet(parsed.data.walletId, userId),
    findOwnedCategory(parsed.data.categoryId, userId),
  ]);
  if (!wallet || !category) {
    return res.status(404).json({ message: "Wallet or category not found" });
  }
  const transaction = await createTransaction(userId, parsed.data);
  res.status(201).json(transaction);
}

export async function get(req: Request, res: Response) {
  const transaction = await findOwnedTransaction(req.params.id, getUserId(req));
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.status(200).json(transaction);
}

export async function update(req: Request, res: Response) {
  const parsed = updateTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid transaction data" });
  }
  const userId = getUserId(req);

  if (parsed.data.walletId) {
    const wallet = await findOwnedWallet(parsed.data.walletId, userId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
  }
  if (parsed.data.categoryId) {
    const category = await findOwnedCategory(parsed.data.categoryId, userId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
  }

  const transaction = await updateTransaction(req.params.id, userId, parsed.data);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.status(200).json(transaction);
}

export async function remove(req: Request, res: Response) {
  const transaction = await deleteTransaction(req.params.id, getUserId(req));
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.status(204).end();
}
