"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type UTCTimestamp,
  type LogicalRange,
} from "lightweight-charts";
import type { Candle } from "@/lib/types";
import { bollinger, ema, macd, rsi, sma, type LinePoint } from "@/lib/indicators";

export interface IndicatorConfig {
  sma: number[];
  ema: number[];
  bollinger: boolean;
  volume: boolean;
  rsi: boolean;
  macd: boolean;
}

const MA_COLORS = ["#2962ff", "#ff9800", "#ab47bc", "#26c6da", "#ec407a"];

const CHART_BASE = {
  layout: {
    background: { type: ColorType.Solid, color: "#131722" },
    textColor: "#9aa0aa",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  grid: {
    vertLines: { color: "#1e2330" },
    horzLines: { color: "#1e2330" },
  },
  rightPriceScale: { borderColor: "#262b39" },
  timeScale: { borderColor: "#262b39", timeVisible: true, secondsVisible: false },
} as const;

function toLine(points: LinePoint[]) {
  return points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }));
}

export function AdvancedChart({
  candles,
  config,
}: {
  candles: Candle[];
  config: IndicatorConfig;
}) {
  const priceRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!priceRef.current || candles.length === 0) return;

    const charts: IChartApi[] = [];
    const cleanups: Array<() => void> = [];

    // ---- Main price chart -------------------------------------------------
    const priceChart = createChart(priceRef.current, {
      ...CHART_BASE,
      autoSize: true,
      crosshair: { mode: CrosshairMode.Normal },
    });
    charts.push(priceChart);

    const candleSeries = priceChart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    if (config.volume) {
      const volSeries = priceChart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volSeries.setData(
        candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? "rgba(38,166,154,0.5)" : "rgba(239,83,80,0.5)",
        })),
      );
    }

    config.sma.forEach((period, i) => {
      const s = priceChart.addLineSeries({
        color: MA_COLORS[i % MA_COLORS.length],
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      s.setData(toLine(sma(candles, period)));
    });

    config.ema.forEach((period, i) => {
      const s = priceChart.addLineSeries({
        color: MA_COLORS[(i + 2) % MA_COLORS.length],
        lineWidth: 2,
        lineStyle: LineStyle.Dotted,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      s.setData(toLine(ema(candles, period)));
    });

    if (config.bollinger) {
      const bb = bollinger(candles, 20, 2);
      const upper = priceChart.addLineSeries({
        color: "rgba(120,123,134,0.9)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const lower = priceChart.addLineSeries({
        color: "rgba(120,123,134,0.9)",
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      const mid = priceChart.addLineSeries({
        color: "rgba(120,123,134,0.5)",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      upper.setData(toLine(bb.upper));
      lower.setData(toLine(bb.lower));
      mid.setData(toLine(bb.middle));
    }

    priceChart.timeScale().fitContent();

    // ---- RSI sub-chart ----------------------------------------------------
    if (config.rsi && rsiRef.current) {
      const rsiChart = createChart(rsiRef.current, { ...CHART_BASE, autoSize: true });
      charts.push(rsiChart);
      const rsiSeries = rsiChart.addLineSeries({
        color: "#ab47bc",
        lineWidth: 2,
        priceLineVisible: false,
      });
      rsiSeries.setData(toLine(rsi(candles, 14)));
      // 70 / 30 guide lines.
      for (const level of [70, 30]) {
        rsiSeries.createPriceLine({
          price: level,
          color: "#3a4255",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: String(level),
        });
      }
      rsiChart.priceScale("right").applyOptions({ autoScale: false });
      rsiSeries.applyOptions({ autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }) });
    }

    // ---- MACD sub-chart ---------------------------------------------------
    if (config.macd && macdRef.current) {
      const macdChart = createChart(macdRef.current, { ...CHART_BASE, autoSize: true });
      charts.push(macdChart);
      const m = macd(candles);
      const hist = macdChart.addHistogramSeries({ priceLineVisible: false });
      hist.setData(
        m.histogram.map((p) => ({
          time: p.time as UTCTimestamp,
          value: p.value,
          color: p.value >= 0 ? "rgba(38,166,154,0.6)" : "rgba(239,83,80,0.6)",
        })),
      );
      const macdLine = macdChart.addLineSeries({ color: "#2962ff", lineWidth: 2, priceLineVisible: false });
      const signalLine = macdChart.addLineSeries({ color: "#ff9800", lineWidth: 2, priceLineVisible: false });
      macdLine.setData(toLine(m.macd));
      signalLine.setData(toLine(m.signal));
    }

    // ---- Sync visible range + crosshair across all panes ------------------
    let syncing = false;
    const sync = (source: IChartApi) => (range: LogicalRange | null) => {
      if (syncing || !range) return;
      syncing = true;
      for (const c of charts) {
        if (c !== source) c.timeScale().setVisibleLogicalRange(range);
      }
      syncing = false;
    };
    for (const c of charts) {
      const handler = sync(c);
      c.timeScale().subscribeVisibleLogicalRangeChange(handler);
      cleanups.push(() => c.timeScale().unsubscribeVisibleLogicalRangeChange(handler));
    }

    return () => {
      for (const fn of cleanups) fn();
      for (const c of charts) c.remove();
    };
  }, [candles, config]);

  return (
    <div className="flex h-full flex-col gap-px">
      <div ref={priceRef} className="min-h-0 flex-1" />
      {config.rsi && (
        <div className="relative h-28 shrink-0">
          <span className="absolute left-2 top-1 z-10 text-xs font-medium text-text-muted">
            RSI (14)
          </span>
          <div ref={rsiRef} className="h-full" />
        </div>
      )}
      {config.macd && (
        <div className="relative h-28 shrink-0">
          <span className="absolute left-2 top-1 z-10 text-xs font-medium text-text-muted">
            MACD (12, 26, 9)
          </span>
          <div ref={macdRef} className="h-full" />
        </div>
      )}
    </div>
  );
}
