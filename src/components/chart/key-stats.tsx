"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCompact, formatMarketCap, formatNumber, formatPercent, formatPrice } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-soft py-2 text-sm last:border-0">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium tabular-nums text-text">{value}</span>
    </div>
  );
}

export function KeyStats({ symbol }: { symbol: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile", symbol],
    queryFn: () => api.profile(symbol),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-md bg-bg-soft" />;
  }
  if (!data) return <p className="text-sm text-text-muted">No data.</p>;

  const f = data.financials;
  const cur = data.profile.currency;
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6">
        <Stat label="Market Cap" value={formatMarketCap(f.marketCap)} />
        <Stat label="P/E (TTM)" value={formatNumber(f.peRatio)} />
        <Stat label="EPS (TTM)" value={f.eps !== null ? formatPrice(f.eps, cur) : "—"} />
        <Stat label="P/B" value={formatNumber(f.pbRatio)} />
        <Stat label="P/S" value={formatNumber(f.psRatio)} />
        <Stat label="Beta" value={formatNumber(f.beta)} />
        <Stat label="Div Yield" value={f.dividendYield !== null ? formatPercent(f.dividendYield) : "—"} />
        <Stat label="ROE" value={f.roe !== null ? formatPercent(f.roe) : "—"} />
        <Stat label="Net Margin" value={f.netMargin !== null ? formatPercent(f.netMargin) : "—"} />
        <Stat label="Rev Growth" value={f.revenueGrowth !== null ? formatPercent(f.revenueGrowth) : "—"} />
        <Stat label="52W High" value={formatPrice(f.week52High, cur)} />
        <Stat label="52W Low" value={formatPrice(f.week52Low, cur)} />
      </div>
      <div className="mt-3 border-t border-border pt-3 text-xs text-text-muted">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>{data.profile.exchange}</span>
          <span>{data.profile.industry}</span>
          <span>{data.profile.currency}</span>
          {data.profile.shareOutstanding > 0 && (
            <span>{formatCompact(data.profile.shareOutstanding * 1_000_000)} shares</span>
          )}
        </div>
      </div>
    </div>
  );
}
