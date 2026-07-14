import { Request, Response } from "express";
import { createBudgetSchema, updateBudgetSchema } from "./budget.validators.js";
import { getUserId } from "../auth/auth.middleware.js";
import { findOwnedCategory } from "../categories/category.service.js";
import {
  createBudget,
  deleteBudget,
  findOwnedBudgetByCategory,
  getBudget,
  listBudgets,
  updateBudget,
} from "./budget.service.js";

export async function list(req: Request, res: Response) {
  const budgets = await listBudgets(getUserId(req));
  res.status(200).json(budgets);
}

export async function create(req: Request, res: Response) {
  const parsed = createBudgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid budget data" });
  }
  const userId = getUserId(req);

  const category = await findOwnedCategory(parsed.data.categoryId, userId);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  if (category.type === "INCOME") {
    return res.status(422).json({ message: "Budgets can only target expense categories" });
  }
  const existing = await findOwnedBudgetByCategory(parsed.data.categoryId, userId);
  if (existing) {
    return res
      .status(409)
      .json({ message: "A budget for this category already exists — edit it instead" });
  }

  const budget = await createBudget(userId, parsed.data);
  res.status(201).json(budget);
}

export async function get(req: Request, res: Response) {
  const budget = await getBudget(req.params.id, getUserId(req));
  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }
  res.status(200).json(budget);
}

export async function update(req: Request, res: Response) {
  const parsed = updateBudgetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid budget data" });
  }
  const budget = await updateBudget(req.params.id, getUserId(req), parsed.data);
  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }
  res.status(200).json(budget);
}

export async function remove(req: Request, res: Response) {
  const budget = await deleteBudget(req.params.id, getUserId(req));
  if (!budget) {
    return res.status(404).json({ message: "Budget not found" });
  }
  res.status(204).end();
}
