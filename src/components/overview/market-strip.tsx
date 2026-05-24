"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { INDEX_SYMBOLS, UNIVERSE_MAP } from "@/lib/finnhub/universe";
import { formatPrice } from "@/lib/utils";
import { QuoteChange } from "@/components/quote-change";

export function MarketStrip() {
  const { data } = useQuery({
    queryKey: ["quotes", INDEX_SYMBOLS.join(",")],
    queryFn: () => api.quotes(INDEX_SYMBOLS),
    refetchInterval: 30_000,
  });

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {INDEX_SYMBOLS.map((sym) => {
        const q = data?.[sym];
        const name = UNIVERSE_MAP.get(sym)?.name ?? sym;
        return (
          <Link key={sym} href={`/chart/${sym}`} className="card p-3 transition-colors hover:bg-bg-hover">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-bright">{sym}</span>
            </div>
            <p className="truncate text-xs text-text-muted">{name}</p>
            {q ? (
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-semibold tabular-nums">{formatPrice(q.current)}</span>
                <QuoteChange change={q.change} percent={q.percentChange} showAbsolute={false} />
              </div>
            ) : (
              <div className="mt-2 h-7 animate-pulse rounded bg-bg-soft" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
