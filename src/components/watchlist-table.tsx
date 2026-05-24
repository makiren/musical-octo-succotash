"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { X, Star } from "lucide-react";
import { api } from "@/lib/api";
import { useWatchlist } from "@/lib/store/watchlist";
import { useHydrated } from "@/lib/use-hydrated";
import { Sparkline } from "@/components/sparkline";
import { QuoteChange } from "@/components/quote-change";
import { formatPrice } from "@/lib/utils";

export function WatchlistTable({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const symbols = useWatchlist((s) => s.symbols);
  const remove = useWatchlist((s) => s.remove);
  const hydrated = useHydrated();

  const shown = limit ? symbols.slice(0, limit) : symbols;

  const { data } = useQuery({
    queryKey: ["quotes", shown.join(",")],
    queryFn: () => api.quotes(shown),
    enabled: hydrated && shown.length > 0,
    refetchInterval: 20_000,
  });

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-md bg-bg-soft" />;
  }

  if (symbols.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-text-muted">
        <Star className="h-8 w-8" />
        <p>Your watchlist is empty.</p>
        <p>Use the search bar or the star icon to add symbols.</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
          <th className="px-3 py-2 font-medium">Symbol</th>
          {!compact && <th className="px-3 py-2 font-medium">30D</th>}
          <th className="px-3 py-2 text-right font-medium">Price</th>
          <th className="px-3 py-2 text-right font-medium">Change</th>
          <th className="w-8" />
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {shown.map((sym) => {
          const q = data?.[sym];
          return (
            <tr key={sym} className="group transition-colors hover:bg-bg-hover">
              <td className="px-3 py-2.5">
                <Link href={`/chart/${sym}`} className="font-semibold text-text-bright hover:text-accent">
                  {sym}
                </Link>
              </td>
              {!compact && (
                <td className="px-3 py-2.5">
                  <Sparkline symbol={sym} />
                </td>
              )}
              <td className="px-3 py-2.5 text-right tabular-nums">
                {q ? formatPrice(q.current) : "…"}
              </td>
              <td className="px-3 py-2.5 text-right">
                {q ? (
                  <QuoteChange change={q.change} percent={q.percentChange} showAbsolute={!compact} />
                ) : (
                  "…"
                )}
              </td>
              <td className="px-3 py-2.5 text-right">
                <button
                  onClick={() => remove(sym)}
                  className="text-text-muted opacity-0 transition-opacity hover:text-down group-hover:opacity-100"
                  aria-label={`Remove ${sym}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
