"use client";
import { Star } from "lucide-react";
import { useWatchlist } from "@/lib/store/watchlist";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";

export function WatchButton({ symbol, className }: { symbol: string; className?: string }) {
  const toggle = useWatchlist((s) => s.toggle);
  const symbols = useWatchlist((s) => s.symbols);
  const hydrated = useHydrated();
  const active = hydrated && symbols.includes(symbol.toUpperCase());

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(symbol);
      }}
      className={cn("text-text-muted transition-colors hover:text-amber-400", className)}
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      title={active ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star className={cn("h-4 w-4", active && "fill-amber-400 text-amber-400")} />
    </button>
  );
}
