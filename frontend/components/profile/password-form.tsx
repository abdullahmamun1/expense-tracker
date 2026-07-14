"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { passwordFormSchema, type PasswordFormValues } from "@/lib/validation/profile";

export function PasswordForm() {
  const { refresh } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: PasswordFormValues) {
    setFormError(null);
    setSuccess(false);
    const res = await authApi.updateProfile({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.message ?? "Something went wrong. Please try again.");
      return;
    }
    reset();
    await refresh();
    setSuccess(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 border border-dashed border-border p-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Change password
      </p>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="currentPassword"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Current password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          aria-invalid={!!errors.currentPassword}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="font-mono text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="newPassword"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          New password
        </Label>
        <Input
          id="newPassword"
          type="password"
          aria-invalid={!!errors.newPassword}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("newPassword")}
        />
        {errors.newPassword && (
          <p className="font-mono text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="confirmPassword"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          aria-invalid={!!errors.confirmPassword}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="font-mono text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}
      {success && (
        <p className="font-mono text-xs text-muted-foreground">Password updated.</p>
      )}

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : "Save password"}
        </Button>
      </div>
    </form>
  );
}
