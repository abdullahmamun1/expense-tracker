import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  tone?: "income" | "expense";
  unit?: "currency" | "none";
};

export function StatCard({ label, value, tone, unit = "currency" }: StatCardProps) {
  return (
    <Card className="rounded-none border border-border bg-card/60 shadow-none ring-0">
      <CardContent>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-2 font-serif text-3xl tracking-tight",
            tone === "income" && "text-primary",
            tone === "expense" && "text-destructive"
          )}
        >
          {unit === "none" ? value : `$${value}`}
        </p>
      </CardContent>
    </Card>
  );
}
