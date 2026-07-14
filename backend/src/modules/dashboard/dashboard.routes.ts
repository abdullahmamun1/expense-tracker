import { Router } from "express";
import { summary } from "./dashboard.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", summary);

export default router;
