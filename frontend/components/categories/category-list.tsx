"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import { CategoryCard } from "./category-card";
import type { Category } from "@/lib/validation/category";

type Status = "loading" | "ready" | "error";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const refresh = useCallback(async () => {
    const res = await categoriesApi.list();
    if (res.ok) {
      setCategories(await res.json());
      setStatus("ready");
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Syncing with the backend on mount, not deriving state from props/state —
    // see the identical note in lib/auth-context.tsx for why this is exempt
    // from react-hooks/set-state-in-effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`)) return;
    const res = await categoriesApi.remove(category.id);
    if (res.ok) {
      await refresh();
    }
  }

  if (status === "loading") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="py-10 text-center font-mono text-xs uppercase tracking-wide text-destructive">
        Couldn&apos;t load categories.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Itemized — Your categories
        </p>
        {!showCreateForm && (
          <Button
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="rounded-none font-mono text-xs uppercase tracking-[0.14em]"
          >
            + Add category
          </Button>
        )}
      </div>

      {showCreateForm && (
        <div className="mb-8">
          <CategoryForm
            onSuccess={() => {
              setShowCreateForm(false);
              refresh();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {categories.length === 0 && !showCreateForm ? (
        <p className="border-y border-dashed border-border py-14 text-center font-serif text-lg text-muted-foreground">
          No categories yet. Add your first one to start tagging transactions.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          <CategorySection
            title="Income"
            categories={categories.filter((category) => category.type === "INCOME")}
            editingCategory={editingCategory}
            onEdit={setEditingCategory}
            onEditDone={() => {
              setEditingCategory(null);
              refresh();
            }}
            onEditCancel={() => setEditingCategory(null)}
            onDelete={handleDelete}
          />
          <CategorySection
            title="Expense"
            categories={categories.filter((category) => category.type === "EXPENSE")}
            editingCategory={editingCategory}
            onEdit={setEditingCategory}
            onEditDone={() => {
              setEditingCategory(null);
              refresh();
            }}
            onEditCancel={() => setEditingCategory(null)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}

type CategorySectionProps = {
  title: string;
  categories: Category[];
  editingCategory: Category | null;
  onEdit: (category: Category) => void;
  onEditDone: () => void;
  onEditCancel: () => void;
  onDelete: (category: Category) => void;
};

function CategorySection({
  title,
  categories,
  editingCategory,
  onEdit,
  onEditDone,
  onEditCancel,
  onDelete,
}: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <div>
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) =>
          editingCategory?.id === category.id ? (
            <div key={category.id} className="col-span-full">
              <CategoryForm category={category} onSuccess={onEditDone} onCancel={onEditCancel} />
            </div>
          ) : (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => onEdit(category)}
              onDelete={() => onDelete(category)}
            />
          )
        )}
      </div>
    </div>
  );
}
