import { Request, Response } from "express";
import { getUserId } from "../auth/auth.middleware.js";
import { getDashboardSummary } from "./dashboard.service.js";

export async function summary(req: Request, res: Response) {
  const data = await getDashboardSummary(getUserId(req));
  res.status(200).json(data);
}
