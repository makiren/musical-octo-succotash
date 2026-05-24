"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import { formatPercent, formatPrice } from "@/lib/utils";

export function Movers() {
  const { data, isLoading } = useQuery({
    queryKey: ["screener"],
    queryFn: api.screener,
    staleTime: 60_000,
  });

  const stocks = (data ?? []).filter((r) => r.sector !== "Index ETF");
  const gainers = [...stocks].sort((a, b) => b.percentChange - a.percentChange).slice(0, 5);
  const losers = [...stocks].sort((a, b) => a.percentChange - b.percentChange).slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <MoverCard title="Top Gainers" icon={<TrendingUp className="h-4 w-4 text-up" />} rows={gainers} loading={isLoading} />
      <MoverCard title="Top Losers" icon={<TrendingDown className="h-4 w-4 text-down" />} rows={losers} loading={isLoading} />
    </div>
  );
}

function MoverCard({
  title,
  icon,
  rows,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<{ symbol: string; name: string; price: number; percentChange: number }>;
  loading: boolean;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold text-text-bright">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-bg-soft/40" />
            ))
          : rows.map((r) => (
              <Link
                key={r.symbol}
                href={`/chart/${r.symbol}`}
                className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-bg-hover"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-bright">{r.symbol}</div>
                  <div className="truncate text-xs text-text-muted">{r.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm tabular-nums">{formatPrice(r.price)}</div>
                  <div className={`text-xs font-medium tabular-nums ${r.percentChange >= 0 ? "text-up" : "text-down"}`}>
                    {formatPercent(r.percentChange)}
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
}
