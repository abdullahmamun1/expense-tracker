import { Router } from "express";
import { exportCsv, summary } from "./reports.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", summary);
router.get("/export", exportCsv);

export default router;
