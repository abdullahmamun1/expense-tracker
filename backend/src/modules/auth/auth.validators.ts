import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    email: z.string().email().optional(),
    newPassword: z.string().min(8).optional(),
    currentPassword: z.string().optional(),
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    phone: z
      .string()
      .max(30)
      .regex(/^[0-9+\-\s()]*$/, "Invalid phone number")
      .optional(),
    address: z.string().max(300).optional(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .optional(),
    bio: z.string().max(500).optional(),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.newPassword !== undefined ||
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.phone !== undefined ||
      data.address !== undefined ||
      data.dateOfBirth !== undefined ||
      data.bio !== undefined,
    { message: "No changes provided" }
  )
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "currentPassword is required to change password",
    path: ["currentPassword"],
  });

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1),
});
