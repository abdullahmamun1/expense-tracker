import { z } from "zod";

export const emailFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

export const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export const deleteAccountFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});

export type DeleteAccountFormValues = z.infer<typeof deleteAccountFormSchema>;

export const personalInfoFormSchema = z.object({
  firstName: z.string().max(100, "Must be 100 characters or fewer").optional().or(z.literal("")),
  lastName: z.string().max(100, "Must be 100 characters or fewer").optional().or(z.literal("")),
  phone: z
    .string()
    .max(30, "Must be 30 characters or fewer")
    .regex(/^[0-9+\-\s()]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().max(300, "Must be 300 characters or fewer").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Must be 500 characters or fewer").optional().or(z.literal("")),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoFormSchema>;

export type UserProfile = {
  id: string;
  email: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  bio: string | null;
};
