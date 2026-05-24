"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MarketState {
  label: string;
  open: boolean;
  time: string;
}

function computeMarketState(): MarketState {
  // Render the US session status in Eastern Time.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday");
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const time = `${get("hour")}:${get("minute")} ET`;
  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const mins = hour * 60 + minute;
  const regularOpen = isWeekday && mins >= 9 * 60 + 30 && mins < 16 * 60;
  const preMarket = isWeekday && mins >= 4 * 60 && mins < 9 * 60 + 30;
  const afterHours = isWeekday && mins >= 16 * 60 && mins < 20 * 60;
  let label = "Closed";
  if (regularOpen) label = "Open";
  else if (preMarket) label = "Pre-market";
  else if (afterHours) label = "After hours";
  return { label, open: regularOpen, time };
}

export function MarketClock() {
  const [state, setState] = useState<MarketState | null>(null);

  useEffect(() => {
    const tick = () => setState(computeMarketState());
    tick();
    const id = setInterval(tick, 1000 * 20);
    return () => clearInterval(id);
  }, []);

  if (!state) return null;

  return (
    <div className="hidden items-center gap-2 text-sm sm:flex">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          state.open ? "bg-up" : state.label === "Closed" ? "bg-text-muted" : "bg-amber-400",
        )}
      />
      <span className="text-text-muted">{state.label}</span>
      <span className="font-mono text-text">{state.time}</span>
    </div>
  );
}
