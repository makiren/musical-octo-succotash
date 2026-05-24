"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EconomicEvent } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const IMPACT_STYLES: Record<EconomicEvent["impact"], string> = {
  high: "bg-down/20 text-down border-down/40",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  low: "bg-text-muted/20 text-text-muted border-border",
};

export function EconomicCalendar() {
  const { data, isLoading } = useQuery({
    queryKey: ["calendar"],
    queryFn: api.calendar,
    staleTime: 10 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-bg-soft" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-text-muted">No upcoming events.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {data.map((e, i) => (
        <li key={i} className="flex items-center gap-3 px-4 py-3">
          <span className={cn("chip w-20 justify-center text-[10px] uppercase", IMPACT_STYLES[e.impact])}>
            {e.impact}
          </span>
          <span className="w-8 text-xs font-semibold text-text-muted">{e.country}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-text">{e.event}</div>
            <div className="text-xs text-text-muted">{formatDateTime(e.time)}</div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-right text-xs tabular-nums">
            <div>
              <div className="text-text-muted">Act</div>
              <div className="text-text">{e.actual ?? "—"}</div>
            </div>
            <div>
              <div className="text-text-muted">Est</div>
              <div className="text-text">{e.estimate ?? "—"}</div>
            </div>
            <div>
              <div className="text-text-muted">Prev</div>
              <div className="text-text">{e.previous ?? "—"}</div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
