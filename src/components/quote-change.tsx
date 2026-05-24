"use client";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent, formatPrice } from "@/lib/utils";

export function QuoteChange({
  change,
  percent,
  showAbsolute = true,
  className,
}: {
  change: number;
  percent: number;
  showAbsolute?: boolean;
  className?: string;
}) {
  const up = change > 0;
  const flat = change === 0;
  const color = flat ? "text-text-muted" : up ? "text-up" : "text-down";
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium tabular-nums", color, className)}>
      {!flat && <Icon className="h-3.5 w-3.5" />}
      {showAbsolute && <span>{up ? "+" : ""}{formatPrice(change)}</span>}
      <span>({formatPercent(percent)})</span>
    </span>
  );
}
