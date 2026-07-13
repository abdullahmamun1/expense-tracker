import { cn } from "@/lib/utils";

export function ReceiptCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("receipt-shadow w-full max-w-sm", className)}>
      <div className="receipt-edge bg-card px-8 pt-10 pb-16 text-card-foreground">
        {children}
      </div>
    </div>
  );
}
