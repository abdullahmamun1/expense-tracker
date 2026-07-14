import { Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

export type PublicUser = {
  id: string;
  email: string;
  createdAt: Date;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: Date | null;
  bio: string | null;
};

const publicUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  dateOfBirth: true,
  bio: true,
} as const;

export type ProfileFieldsInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  bio?: string;
};

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(email: string, password: string): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  return prisma.user.create({
    data: { email, passwordHash },
    select: publicUserSelect,
  });
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function findPublicUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
}

export async function updateUserProfileFields(id: string, fields: ProfileFieldsInput): Promise<void> {
  const { email, firstName, lastName, phone, address, dateOfBirth, bio } = fields;
  await prisma.user.update({
    where: { id },
    data: {
      ...(email !== undefined ? { email } : {}),
      ...(firstName !== undefined ? { firstName: firstName || null } : {}),
      ...(lastName !== undefined ? { lastName: lastName || null } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(address !== undefined ? { address: address || null } : {}),
      ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
      ...(bio !== undefined ? { bio: bio || null } : {}),
    },
  });
}

export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
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
