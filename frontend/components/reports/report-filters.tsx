import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportPreset, ReportRangeMode } from "@/lib/validation/reports";

type ReportFiltersProps = {
  mode: ReportRangeMode;
  from: string;
  to: string;
  onPresetChange: (preset: ReportPreset) => void;
  onCustomRangeChange: (range: { from: string; to: string }) => void;
};

const presets: ReportPreset[] = ["3M", "6M", "12M", "YTD"];

export function ReportFilters({
  mode,
  from,
  to,
  onPresetChange,
  onCustomRangeChange,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-6 border-b border-dashed border-border pb-6">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset}
            variant={mode === preset ? "default" : "outline"}
            onClick={() => onPresetChange(preset)}
            aria-current={mode === preset ? "true" : undefined}
            className="h-10 rounded-none px-4 font-mono text-xs uppercase tracking-[0.14em]"
          >
            {preset}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="reports-from"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            From
          </Label>
          <Input
            id="reports-from"
            type="date"
            value={from}
            onChange={(event) => onCustomRangeChange({ from: event.target.value, to })}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="reports-to"
            className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground"
          >
            To
          </Label>
          <Input
            id="reports-to"
            type="date"
            value={to}
            onChange={(event) => onCustomRangeChange({ from, to: event.target.value })}
            className="rounded-none border-0 border-b border-border bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
