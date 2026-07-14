"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { personalInfoFormSchema, type PersonalInfoFormValues } from "@/lib/validation/profile";

function toDateInputValue(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function PersonalInfoForm() {
  const { user, refresh } = useAuth();

  if (!user) return null;

  return <PersonalInfoFormFields key={user.id} user={user} refresh={refresh} />;
}

type PersonalInfoFormFieldsProps = {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  refresh: () => Promise<void>;
};

function PersonalInfoFormFields({ user, refresh }: PersonalInfoFormFieldsProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoFormSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      dateOfBirth: toDateInputValue(user.dateOfBirth),
      bio: user.bio ?? "",
    },
  });

  async function onSubmit(values: PersonalInfoFormValues) {
    setFormError(null);
    setSuccess(false);
    const res = await authApi.updateProfile(values);
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
        Personal information
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="firstName"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            First name
          </Label>
          <Input
            id="firstName"
            aria-invalid={!!errors.firstName}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="font-mono text-xs text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="lastName"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            Last name
          </Label>
          <Input
            id="lastName"
            aria-invalid={!!errors.lastName}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="font-mono text-xs text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="phone"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            aria-invalid={!!errors.phone}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="font-mono text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="dateOfBirth"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            Date of birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            aria-invalid={!!errors.dateOfBirth}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
            {...register("dateOfBirth")}
          />
          {errors.dateOfBirth && (
            <p className="font-mono text-xs text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="address"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Address
        </Label>
        <Input
          id="address"
          aria-invalid={!!errors.address}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("address")}
        />
        {errors.address && (
          <p className="font-mono text-xs text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="bio"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Bio
        </Label>
        <Textarea
          id="bio"
          rows={4}
          aria-invalid={!!errors.bio}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("bio")}
        />
        {errors.bio && <p className="font-mono text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}
      {success && <p className="font-mono text-xs text-muted-foreground">Profile updated.</p>}

      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : "Save details"}
        </Button>
      </div>
    </form>
  );
}
