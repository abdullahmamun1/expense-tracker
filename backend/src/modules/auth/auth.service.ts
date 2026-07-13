import { Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

export type PublicUser = { id: string; email: string };

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: string, password: string): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  return prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  });
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function findPublicUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
}

export function establishSession(req: Request, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}
