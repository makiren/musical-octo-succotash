"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Resolution } from "@/lib/types";
import { api } from "@/lib/api";
import { AdvancedChart, type IndicatorConfig } from "./advanced-chart";
import { ChartToolbar } from "./chart-toolbar";
import { KeyStats } from "./key-stats";
import { WatchButton } from "@/components/watch-button";
import { AddAlertButton } from "@/components/alert-dialog";
import { QuoteChange } from "@/components/quote-change";
import { NewsList } from "@/components/news-list";
import { formatPrice, formatRelative } from "@/lib/utils";

const DEFAULT_CONFIG: IndicatorConfig = {
  sma: [50],
  ema: [],
  bollinger: false,
  volume: true,
  rsi: true,
  macd: false,
};

type Tab = "stats" | "news";

export function ChartWorkspace({ symbol }: { symbol: string }) {
  const [resolution, setResolution] = useState<Resolution>("D");
  const [config, setConfig] = useState<IndicatorConfig>(DEFAULT_CONFIG);
  const [tab, setTab] = useState<Tab>("stats");

  const { data: quote } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => api.quote(symbol),
    refetchInterval: 20_000,
  });

  const {
    data: candles,
    isLoading: candlesLoading,
    isError: candlesError,
  } = useQuery({
    queryKey: ["candles", symbol, resolution],
    queryFn: () => api.candles(symbol, resolution, 400),
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", symbol],
    queryFn: () => api.profile(symbol),
    staleTime: 5 * 60_000,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <WatchButton symbol={symbol} className="text-lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-bright">{symbol}</h1>
              <span className="truncate text-sm text-text-muted">{profile?.profile.name}</span>
            </div>
            {quote ? (
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums">{formatPrice(quote.current)}</span>
                <QuoteChange change={quote.change} percent={quote.percentChange} />
                <span className="text-xs text-text-muted">{formatRelative(quote.timestamp)}</span>
              </div>
            ) : (
              <div className="mt-1 h-7 w-40 animate-pulse rounded bg-bg-soft" />
            )}
          </div>
        </div>
        <AddAlertButton symbol={symbol} currentPrice={quote?.current} />
      </div>

      {/* Chart */}
      <div className="card overflow-hidden">
        <ChartToolbar
          resolution={resolution}
          onResolution={setResolution}
          config={config}
          onConfig={setConfig}
        />
        <div className="h-[560px] w-full">
          {candlesLoading ? (
            <div className="flex h-full items-center justify-center text-text-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : candlesError || !candles || candles.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              No chart data available for this symbol / timeframe.
            </div>
          ) : (
            <AdvancedChart candles={candles} config={config} />
          )}
        </div>
      </div>

      {/* Day range stats */}
      {quote && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Open" value={formatPrice(quote.open)} />
          <MiniStat label="Prev Close" value={formatPrice(quote.previousClose)} />
          <MiniStat label="Day High" value={formatPrice(quote.high)} />
          <MiniStat label="Day Low" value={formatPrice(quote.low)} />
        </div>
      )}

      {/* Tabs: stats / news */}
      <div className="card">
        <div className="flex border-b border-border">
          <TabButton active={tab === "stats"} onClick={() => setTab("stats")}>
            Key Statistics
          </TabButton>
          <TabButton active={tab === "news"} onClick={() => setTab("news")}>
            News
          </TabButton>
        </div>
        <div className="p-4">
          {tab === "stats" ? <KeyStats symbol={symbol} /> : <NewsList symbol={symbol} limit={12} />}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-3 py-2">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent text-text-bright"
          : "border-transparent text-text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
