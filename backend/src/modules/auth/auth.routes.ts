import { Router } from "express";
import { signup, login, logout, me, updateMe, deleteMe } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);
router.delete("/me", requireAuth, deleteMe);

export default router;
