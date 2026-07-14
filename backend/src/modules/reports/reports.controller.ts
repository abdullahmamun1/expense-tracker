import { Request, Response } from "express";
import { reportsQuerySchema } from "./reports.validators.js";
import { getUserId } from "../auth/auth.middleware.js";
import { getReportsExport, getReportsSummary } from "./reports.service.js";

type ParsedRange =
  | { ok: true; from?: string; to?: string }
  | { ok: false; status: 400 | 422; message: string };

function parseRangeQuery(req: Request): ParsedRange {
  const parsed = reportsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return { ok: false, status: 400, message: "Invalid query parameters" };
  }
  const { from, to } = parsed.data;
  if (from && to && to < from) {
    return { ok: false, status: 422, message: "'to' must not be before 'from'" };
  }
  return { ok: true, from, to };
}

export async function summary(req: Request, res: Response) {
  const range = parseRangeQuery(req);
  if (!range.ok) {
    return res.status(range.status).json({ message: range.message });
  }
  const data = await getReportsSummary(getUserId(req), range.from, range.to);
  res.status(200).json(data);
}

export async function exportCsv(req: Request, res: Response) {
  const range = parseRangeQuery(req);
  if (!range.ok) {
    return res.status(range.status).json({ message: range.message });
  }
  const { csv, filename } = await getReportsExport(getUserId(req), range.from, range.to);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}
