import { Request, Response } from "express";
import { signupSchema, loginSchema } from "./auth.validators.js";
import {
  createUser,
  establishSession,
  findPublicUserById,
  findUserByEmail,
  verifyPassword,
} from "./auth.service.js";
import { SESSION_COOKIE_NAME } from "../../config/session.js";

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const { email, password } = parsed.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = await createUser(email, password);
  await establishSession(req, user.id);
  res.status(201).json(user);
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  const { email, password } = parsed.data;

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  await establishSession(req, user.id);
  res.status(200).json({ id: user.id, email: user.email });
}

export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(204).end();
  });
}

export async function me(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await findPublicUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json(user);
}
