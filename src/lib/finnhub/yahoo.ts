import "server-only";
import type { Candle, CompanyProfile, Quote, Resolution } from "@/lib/types";
import { UNIVERSE_MAP } from "./universe";

// Yahoo Finance's public chart endpoint (the same one the `yfinance` library
// uses). It needs no API key but does want a browser-like User-Agent. Prices
// are delayed, not real-time, but cover Japanese (Tokyo, ".T") equities that
// Finnhub's free tier and Stooq's US-only feed don't.
const CHART = "https://query1.finance.yahoo.com/v8/finance/chart";

const INTERVAL: Record<Resolution, string> = {
  "1": "1m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "60m",
  D: "1d",
  W: "1wk",
  M: "1mo",
};

// Intraday history is range-limited by Yahoo, so pick a range wide enough to
// satisfy the requested bar count without over-asking.
const RANGE: Record<Resolution, string> = {
  "1": "5d",
  "5": "1mo",
  "15": "1mo",
  "30": "1mo",
  "60": "3mo",
  D: "2y",
  W: "5y",
  M: "10y",
};

interface YahooMeta {
  currency?: string;
  longName?: string;
  shortName?: string;
  fullExchangeName?: string;
  exchangeName?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketTime?: number;
}

interface YahooResult {
  meta?: YahooMeta;
  timestamp?: number[];
  indicators?: { quote?: Array<{ open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }> };
}

function num(v: number | null | undefined, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function fetchChart(
  symbol: string,
  interval: string,
  range: string,
  revalidate: number,
): Promise<YahooResult | null> {
  const url = `${CHART}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { chart?: { result?: YahooResult[] | null } };
    return json?.chart?.result?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function fetchYahooCandles(
  symbol: string,
  resolution: Resolution,
  count: number,
): Promise<Candle[] | null> {
  const r = await fetchChart(symbol, INTERVAL[resolution], RANGE[resolution], 300);
  const ts = r?.timestamp;
  const q = r?.indicators?.quote?.[0];
  if (!ts || !q || !q.close) return null;
  const out: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const close = q.close[i];
    if (close == null || !Number.isFinite(close)) continue;
    out.push({
      time: ts[i],
      open: num(q.open?.[i], close),
      high: num(q.high?.[i], close),
      low: num(q.low?.[i], close),
      close,
      volume: num(q.volume?.[i], 0),
    });
  }
  if (out.length === 0) return null;
  return out.slice(-count);
}

export async function fetchYahooQuote(symbol: string): Promise<Quote | null> {
  // A short range keeps meta.chartPreviousClose as the prior *day's* close so
  // the daily change is computed correctly (a wide range would point years back).
  const r = await fetchChart(symbol, "1d", "5d", 15);
  if (!r) return null;
  const m = r.meta ?? {};
  const q = r.indicators?.quote?.[0];
  let last = -1;
  if (q?.close) {
    for (let i = q.close.length - 1; i >= 0; i--) {
      if (q.close[i] != null) {
        last = i;
        break;
      }
    }
  }
  const lastClose = last >= 0 ? (q!.close![last] as number) : undefined;
  const current = m.regularMarketPrice ?? lastClose;
  if (current == null) return null;
  const previousClose =
    m.chartPreviousClose ?? m.previousClose ?? (last > 0 ? (q!.close![last - 1] as number) : current);
  const change = current - previousClose;
  return {
    symbol,
    current,
    change: round2(change),
    percentChange: previousClose ? round2((change / previousClose) * 100) : 0,
    high: m.regularMarketDayHigh ?? (last >= 0 ? num(q!.high?.[last], current) : current),
    low: m.regularMarketDayLow ?? (last >= 0 ? num(q!.low?.[last], current) : current),
    open: last >= 0 ? num(q!.open?.[last], current) : current,
    previousClose: round2(previousClose),
    timestamp: m.regularMarketTime ?? Math.floor(Date.now() / 1000),
    currency: m.currency ?? "JPY",
  };
}

export async function fetchYahooProfile(symbol: string): Promise<CompanyProfile | null> {
  const r = await fetchChart(symbol, "1d", "5d", 3600);
  if (!r) return null;
  const m = r.meta ?? {};
  const entry = UNIVERSE_MAP.get(symbol);
  return {
    symbol,
    name: m.longName ?? m.shortName ?? entry?.name ?? symbol,
    country: "JP",
    currency: m.currency ?? "JPY",
    exchange: m.fullExchangeName ?? m.exchangeName ?? "Tokyo",
    industry: entry?.sector ?? "—",
    logo: "",
    marketCap: entry?.marketCap ?? 0,
    shareOutstanding: 0,
    weburl: `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`,
    ipo: "",
  };
}
