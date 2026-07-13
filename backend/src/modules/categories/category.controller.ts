import { Request, Response } from "express";
import { createCategorySchema, updateCategorySchema } from "./category.validators.js";
import { getUserId } from "../auth/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  findCategoryByName,
  findOwnedCategory,
  listCategories,
  updateCategory,
} from "./category.service.js";

export async function list(req: Request, res: Response) {
  const categories = await listCategories(getUserId(req));
  res.status(200).json(categories);
}

export async function create(req: Request, res: Response) {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid category data" });
  }
  const userId = getUserId(req);
  const existing = await findCategoryByName(userId, parsed.data.name);
  if (existing) {
    return res.status(409).json({ message: "A category with this name already exists" });
  }
  const category = await createCategory(userId, parsed.data);
  res.status(201).json(category);
}

export async function get(req: Request, res: Response) {
  const category = await findOwnedCategory(req.params.id, getUserId(req));
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
}

export async function update(req: Request, res: Response) {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid category data" });
  }
  const userId = getUserId(req);
  if (parsed.data.name) {
    const existing = await findCategoryByName(userId, parsed.data.name, req.params.id);
    if (existing) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
  }
  const category = await updateCategory(req.params.id, userId, parsed.data);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.status(200).json(category);
}

export async function remove(req: Request, res: Response) {
  const result = await deleteCategory(req.params.id, getUserId(req));
  if (result === "not_found") {
    return res.status(404).json({ message: "Category not found" });
  }
  if (result === "has_transactions") {
    return res.status(409).json({ message: "Delete this category's transactions first" });
  }
  res.status(204).end();
}
