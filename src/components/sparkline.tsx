"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function Sparkline({
  symbol,
  width = 96,
  height = 32,
  className,
}: {
  symbol: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const { data } = useQuery({
    queryKey: ["spark", symbol],
    queryFn: () => api.candles(symbol, "D", 30),
    staleTime: 5 * 60_000,
  });

  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={cn("rounded bg-bg-soft", className)} />;
  }

  const closes = data.map((c) => c.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const stepX = width / (closes.length - 1);
  const points = closes.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const rising = closes[closes.length - 1] >= closes[0];
  const stroke = rising ? "#26a69a" : "#ef5350";

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
