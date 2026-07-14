import { Router } from "express";
import { list, create, get, update, remove } from "./budget.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", create);
router.get("/:id", get);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
