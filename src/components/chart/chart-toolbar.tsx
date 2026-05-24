"use client";
import type { Resolution } from "@/lib/types";
import type { IndicatorConfig } from "./advanced-chart";
import { cn } from "@/lib/utils";

const TIMEFRAMES: Array<{ label: string; value: Resolution }> = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "1H", value: "60" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
  { label: "1M", value: "M" },
];

const MA_TOGGLES: Array<{ label: string; kind: "sma" | "ema"; period: number }> = [
  { label: "SMA 20", kind: "sma", period: 20 },
  { label: "SMA 50", kind: "sma", period: 50 },
  { label: "SMA 200", kind: "sma", period: 200 },
  { label: "EMA 12", kind: "ema", period: 12 },
  { label: "EMA 26", kind: "ema", period: 26 },
];

function Toggle({
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
      className={cn(
        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
        active ? "bg-accent text-white" : "text-text-muted hover:bg-bg-hover hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

export function ChartToolbar({
  resolution,
  onResolution,
  config,
  onConfig,
}: {
  resolution: Resolution;
  onResolution: (r: Resolution) => void;
  config: IndicatorConfig;
  onConfig: (c: IndicatorConfig) => void;
}) {
  function toggleMA(kind: "sma" | "ema", period: number) {
    const list = config[kind];
    const next = list.includes(period) ? list.filter((p) => p !== period) : [...list, period];
    onConfig({ ...config, [kind]: next });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-3 py-2">
      <div className="flex items-center gap-0.5 rounded-md bg-bg-soft p-0.5">
        {TIMEFRAMES.map((tf) => (
          <Toggle key={tf.value} active={resolution === tf.value} onClick={() => onResolution(tf.value)}>
            {tf.label}
          </Toggle>
        ))}
      </div>

      <div className="h-5 w-px bg-border" />

      <div className="flex flex-wrap items-center gap-1">
        {MA_TOGGLES.map((m) => (
          <Toggle
            key={m.label}
            active={config[m.kind].includes(m.period)}
            onClick={() => toggleMA(m.kind, m.period)}
          >
            {m.label}
          </Toggle>
        ))}
        <Toggle active={config.bollinger} onClick={() => onConfig({ ...config, bollinger: !config.bollinger })}>
          BB
        </Toggle>
      </div>

      <div className="h-5 w-px bg-border" />

      <div className="flex items-center gap-1">
        <Toggle active={config.volume} onClick={() => onConfig({ ...config, volume: !config.volume })}>
          Vol
        </Toggle>
        <Toggle active={config.rsi} onClick={() => onConfig({ ...config, rsi: !config.rsi })}>
          RSI
        </Toggle>
        <Toggle active={config.macd} onClick={() => onConfig({ ...config, macd: !config.macd })}>
          MACD
        </Toggle>
      </div>
    </div>
  );
}
