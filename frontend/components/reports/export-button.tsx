"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";

type ExportButtonProps = {
  from: string;
  to: string;
  disabled?: boolean;
};

export function ExportButton({ from, to, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await reportsApi.exportCsv(from, to);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-${from}-to-${to}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="h-10 rounded-none px-5 font-mono text-xs uppercase tracking-[0.14em]"
    >
      {isExporting ? "Exporting…" : "Export CSV"}
    </Button>
  );
}
