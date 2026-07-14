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
import { budgetsApi } from "@/lib/api";
import { budgetFormSchema, type BudgetFormValues, type Budget } from "@/lib/validation/budget";
import type { Category } from "@/lib/validation/category";

type BudgetFormProps = {
  budget?: Budget;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
};

export function BudgetForm({ budget, categories, onSuccess, onCancel }: BudgetFormProps) {
  const isEdit = !!budget;
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget
      ? { categoryId: budget.categoryId, monthlyLimit: budget.monthlyLimit }
      : { categoryId: categories[0]?.id ?? "", monthlyLimit: "" },
  });

  async function onSubmit(values: BudgetFormValues) {
    setFormError(null);
    const res = isEdit
      ? await budgetsApi.update(budget.id, { monthlyLimit: values.monthlyLimit })
      : await budgetsApi.create(values);
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
          Category
        </Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              items={Object.fromEntries(categories.map((category) => [category.id, category.name]))}
              value={field.value}
              onValueChange={field.onChange}
              disabled={isEdit}
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
          htmlFor="monthlyLimit"
          className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
        >
          Monthly limit
        </Label>
        <Input
          id="monthlyLimit"
          aria-invalid={!!errors.monthlyLimit}
          className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          {...register("monthlyLimit")}
        />
        {errors.monthlyLimit && (
          <p className="font-mono text-xs text-destructive">{errors.monthlyLimit.message}</p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add budget"}
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
