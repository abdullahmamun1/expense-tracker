import { Request, Response } from "express";
import { signupSchema, loginSchema, updateProfileSchema, deleteAccountSchema } from "./auth.validators.js";
import {
  createUser,
  deleteUser,
  establishSession,
  findPublicUserById,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  updateUserProfileFields,
  verifyPassword,
} from "./auth.service.js";
import { getUserId } from "./auth.middleware.js";
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

export async function updateMe(req: Request, res: Response) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid profile data" });
  }
  const userId = getUserId(req);
  const { email, newPassword, currentPassword, firstName, lastName, phone, address, dateOfBirth, bio } =
    parsed.data;

  if (email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ message: "Email is already registered" });
    }
  }

  if (newPassword) {
    const user = await findUserById(userId);
    if (!user || !(await verifyPassword(currentPassword!, user.passwordHash))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
  }

  const hasProfileFieldUpdate =
    email !== undefined ||
    firstName !== undefined ||
    lastName !== undefined ||
    phone !== undefined ||
    address !== undefined ||
    dateOfBirth !== undefined ||
    bio !== undefined;

  if (hasProfileFieldUpdate) {
    await updateUserProfileFields(userId, { email, firstName, lastName, phone, address, dateOfBirth, bio });
  }
  if (newPassword) await updateUserPassword(userId, newPassword);

  res.status(200).json(await findPublicUserById(userId));
}

export async function deleteMe(req: Request, res: Response) {
  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request" });
  }
  const userId = getUserId(req);
  const user = await findUserById(userId);
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  await deleteUser(userId);

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(204).end();
  });
}
