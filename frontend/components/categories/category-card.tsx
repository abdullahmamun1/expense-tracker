"use client";

import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryTypeLabels, type Category } from "@/lib/validation/category";

type CategoryCardProps = {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="group flex flex-col items-center gap-3 border border-dashed border-border p-6 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${category.color}1a` }}
      >
        <Tag className="size-6" style={{ color: category.color }} />
      </span>
      <div>
        <h3 className="font-serif text-lg tracking-tight">{category.name}</h3>
        <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
          {categoryTypeLabels[category.type]}
        </p>
      </div>
      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="rounded-none font-mono text-xs uppercase tracking-[0.14em] text-destructive hover:text-destructive"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
