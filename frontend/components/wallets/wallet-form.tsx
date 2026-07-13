"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { walletsApi } from "@/lib/api";
import {
  walletFormSchema,
  walletTypes,
  walletTypeLabels,
  type WalletFormValues,
  type Wallet,
} from "@/lib/validation/wallet";

type WalletFormProps = {
  wallet?: Wallet;
  onSuccess: () => void;
  onCancel: () => void;
};

export function WalletForm({ wallet, onSuccess, onCancel }: WalletFormProps) {
  const isEdit = !!wallet;
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: wallet
      ? { name: wallet.name, type: wallet.type, startingBalance: wallet.startingBalance }
      : { name: "", type: "CASH", startingBalance: "" },
  });

  async function onSubmit(values: WalletFormValues) {
    setFormError(null);
    const res = isEdit
      ? await walletsApi.update(wallet.id, values)
      : await walletsApi.create(values);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setFormError(body?.message ?? "Something went wrong. Please try again.");
      return;
    }
    onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 border border-dashed border-border p-6"
    >
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="name"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Name
        </Label>
        <Input
          id="name"
          aria-invalid={!!errors.name}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("name")}
        />
        {errors.name && (
          <p className="font-mono text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          Type
        </Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full rounded-none border-0 border-b border-border bg-transparent px-0">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {walletTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && (
          <p className="font-mono text-xs text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="startingBalance"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Starting balance
        </Label>
        <Input
          id="startingBalance"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={!!errors.startingBalance}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("startingBalance")}
        />
        {errors.startingBalance && (
          <p className="font-mono text-xs text-destructive">
            {errors.startingBalance.message}
          </p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add wallet"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
