"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
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
import { transactionsApi } from "@/lib/api";
import {
  transactionFormSchema,
  type TransactionFormValues,
  type Transaction,
} from "@/lib/validation/transaction";
import { walletLabel, type Wallet } from "@/lib/validation/wallet";
import type { Category } from "@/lib/validation/category";
import { toLocalISODate } from "@/lib/utils";

type TransactionFormProps = {
  wallets: Wallet[];
  categories: Category[];
  transaction?: Transaction;
  defaultDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function TransactionForm({
  wallets,
  categories,
  transaction,
  defaultDate,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEdit = !!transaction;
  const [formError, setFormError] = useState<string | null>(null);
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string | null>(null);
  const categoryTouchedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          walletId: transaction.walletId,
          categoryId: transaction.categoryId,
          amount: transaction.amount,
          occurredAt: transaction.occurredAt.slice(0, 10),
          note: transaction.note ?? "",
        }
      : {
          walletId: wallets[0]?.id ?? "",
          categoryId: categories[0]?.id ?? "",
          amount: "",
          occurredAt: defaultDate ?? toLocalISODate(new Date()),
          note: "",
        },
  });

  const noteField = register("note");
  const categoryIdValue = useWatch({ control, name: "categoryId" });
  const suggestedCategory = suggestedCategoryId
    ? (categories.find((category) => category.id === suggestedCategoryId) ?? null)
    : null;

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  function handleNoteChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const editModeBlocked = isEdit && categoryIdValue !== "";
    if (categoryTouchedRef.current || editModeBlocked) return;

    const note = event.target.value.trim();
    if (!note) {
      setSuggestedCategoryId(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const requestId = ++requestIdRef.current;
      transactionsApi
        .suggestCategory(note)
        .then((res) => (res.ok ? res.json() : Promise.resolve(null)))
        .then((body: { categoryId: string | null } | null) => {
          if (requestId !== requestIdRef.current) return;
          if (categoryTouchedRef.current) return;
          setSuggestedCategoryId(body?.categoryId ?? null);
        })
        .catch(() => {});
    }, 400);
  }

  async function onSubmit(values: TransactionFormValues) {
    setFormError(null);
    const res = isEdit
      ? await transactionsApi.update(transaction.id, values)
      : await transactionsApi.create(values);
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
        <Label className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          Wallet
        </Label>
        <Controller
          control={control}
          name="walletId"
          render={({ field }) => (
            <Select
              items={Object.fromEntries(wallets.map((wallet) => [wallet.id, walletLabel(wallet)]))}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full rounded-none border-0 border-b border-border bg-transparent px-0">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {walletLabel(wallet)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.walletId && (
          <p className="font-mono text-xs text-destructive">{errors.walletId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
            Category
          </Label>
          {isEdit && categoryIdValue !== "" && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="rounded-none font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
              onClick={() => {
                categoryTouchedRef.current = false;
                setSuggestedCategoryId(null);
                setValue("categoryId", "", { shouldDirty: true });
              }}
            >
              Clear category
            </Button>
          )}
        </div>

        {suggestedCategory && (
          <div className="flex items-center justify-between gap-2 border border-dashed border-border bg-muted/40 px-3 py-1.5">
            <p className="font-mono text-xs text-muted-foreground">
              Suggested: <span className="text-foreground">{suggestedCategory.name}</span>
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="rounded-none font-mono text-[0.65rem] uppercase tracking-[0.16em]"
                onClick={() => {
                  setValue("categoryId", suggestedCategory.id, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  categoryTouchedRef.current = true;
                  setSuggestedCategoryId(null);
                }}
              >
                Use
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Dismiss suggestion"
                className="rounded-none"
                onClick={() => setSuggestedCategoryId(null)}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              items={Object.fromEntries(categories.map((category) => [category.id, category.name]))}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                categoryTouchedRef.current = true;
                setSuggestedCategoryId(null);
              }}
            >
              <SelectTrigger className="w-full rounded-none border-0 border-b border-border bg-transparent px-0">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="font-mono text-xs text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="amount"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Amount
        </Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          aria-invalid={!!errors.amount}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="font-mono text-xs text-destructive">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="occurredAt"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Date
        </Label>
        <Input
          id="occurredAt"
          type="date"
          aria-invalid={!!errors.occurredAt}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("occurredAt")}
        />
        {errors.occurredAt && (
          <p className="font-mono text-xs text-destructive">{errors.occurredAt.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="note"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Note (optional)
        </Label>
        <Input
          id="note"
          aria-invalid={!!errors.note}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...noteField}
          onChange={(event) => {
            noteField.onChange(event);
            handleNoteChange(event);
          }}
        />
        {errors.note && <p className="font-mono text-xs text-destructive">{errors.note.message}</p>}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add transaction"}
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
