"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { emailFormSchema, type EmailFormValues } from "@/lib/validation/profile";

export function EmailForm() {
  const { user, refresh } = useAuth();

  if (!user) return null;

  return <EmailFormFields key={user.id} email={user.email} refresh={refresh} />;
}

type EmailFormFieldsProps = { email: string; refresh: () => Promise<void> };

function EmailFormFields({ email: initialEmail, refresh }: EmailFormFieldsProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: initialEmail },
  });

  async function onSubmit(values: EmailFormValues) {
    setFormError(null);
    setSuccess(false);
    const res = await authApi.updateProfile({ email: values.email });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.message ?? "Something went wrong. Please try again.");
      return;
    }
    await refresh();
    setSuccess(true);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 border border-dashed border-border p-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Change email
      </p>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="email"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          aria-invalid={!!errors.email}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("email")}
        />
        {errors.email && (
          <p className="font-mono text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}
      {success && (
        <p className="font-mono text-xs text-muted-foreground">Email updated.</p>
      )}

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : "Save email"}
        </Button>
      </div>
    </form>
  );
}
