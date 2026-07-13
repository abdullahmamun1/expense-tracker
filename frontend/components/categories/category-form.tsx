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
import { categoriesApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  categoryFormSchema,
  categoryTypes,
  categoryTypeLabels,
  categoryColors,
  type CategoryFormValues,
  type Category,
} from "@/lib/validation/category";

type CategoryFormProps = {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const isEdit = !!category;
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? { name: category.name, type: category.type, color: category.color }
      : { name: "", type: "EXPENSE", color: categoryColors[0] },
  });

  async function onSubmit(values: CategoryFormValues) {
    setFormError(null);
    const res = isEdit
      ? await categoriesApi.update(category.id, values)
      : await categoriesApi.create(values);
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
                {categoryTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {categoryTypeLabels[type]}
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
        <Label className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
          Color
        </Label>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2 pt-1">
              {categoryColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => field.onChange(color)}
                  aria-label={color}
                  aria-pressed={field.value === color}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform",
                    field.value === color
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        />
        {errors.color && (
          <p className="font-mono text-xs text-destructive">{errors.color.message}</p>
        )}
      </div>

      {formError && <p className="font-mono text-xs text-destructive">{formError}</p>}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.16em]"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add category"}
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
