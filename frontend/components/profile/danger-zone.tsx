"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { deleteAccountFormSchema, type DeleteAccountFormValues } from "@/lib/validation/profile";

export function DangerZone() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountFormSchema),
    defaultValues: { currentPassword: "" },
  });

  async function onSubmit(values: DeleteAccountFormValues) {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;

    setFormError(null);
    const res = await authApi.deleteAccount(values.currentPassword);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.message ?? "Something went wrong. Please try again.");
      return;
    }
    await refresh();
    router.push("/");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 border border-dashed border-destructive p-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-destructive">
        Danger zone
      </p>
      <p className="text-sm text-muted-foreground">
        Deleting your account permanently removes your wallets, categories, transactions, and
        budgets. This cannot be undone.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="deleteCurrentPassword"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Current password
        </Label>
        <Input
          id="deleteCurrentPassword"
          type="password"
          aria-invalid={!!errors.currentPassword}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="font-mono text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}

      <div>
        <Button
          type="submit"
          variant="destructive"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Deleting…" : "Delete account"}
        </Button>
      </div>
    </form>
  );
}
