import "server-only";
import type {
  BasicFinancials,
  Candle,
  CompanyProfile,
  EconomicEvent,
  NewsItem,
  Quote,
  Resolution,
  ScreenerRow,
  SymbolSearchResult,
} from "@/lib/types";
import {
  mockCandles,
  mockCompanyNews,
  mockEconomicCalendar,
  mockFinancials,
  mockMarketNews,
  mockProfile,
  mockQuote,
  mockScreenerRows,
  mockSearch,
} from "./mock";
import { fetchStooqCandles, stooqSupports } from "./stooq";
import { fetchYahooCandles, fetchYahooProfile, fetchYahooQuote } from "./yahoo";
import { searchUniverse } from "./universe";
import { isJpSymbol, normalizeSymbol } from "@/lib/symbols";

const BASE = "https://finnhub.io/api/v1";
const KEY = process.env.FINNHUB_API_KEY?.trim();

export function isMockMode(): boolean {
  return !KEY;
}

async function fh<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set("token", KEY!);
  const res = await fetch(url, { next: { revalidate: 15 } });
  if (!res.ok) {
    throw new Error(`Finnhub ${path} failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

const RESOLUTION_SECONDS: Record<Resolution, number> = {
  "1": 60,
  "5": 300,
  "15": 900,
  "30": 1800,
  "60": 3600,
  D: 86400,
  W: 604800,
  M: 2592000,
};

export async function getQuote(symbol: string): Promise<Quote> {
  symbol = normalizeSymbol(symbol);
  // Japanese stocks: Yahoo (delayed, no key); fall back to mock if unreachable.
  if (isJpSymbol(symbol)) {
    return (await fetchYahooQuote(symbol)) ?? mockQuote(symbol);
  }
  if (isMockMode()) return mockQuote(symbol);
  const raw = await fh<{
    c: number;
    d: number;
    dp: number;
    h: number;
    l: number;
    o: number;
    pc: number;
    t: number;
  }>("/quote", { symbol });
  return {
    symbol,
    current: raw.c,
    change: raw.d,
    percentChange: raw.dp,
    high: raw.h,
    low: raw.l,
    open: raw.o,
    previousClose: raw.pc,
    timestamp: raw.t,
    currency: "USD",
  };
}

// Finnhub's /stock/candle endpoint is premium-only; free keys get a 403. This
// throws on any non-ok response so callers can fall back to another source.
async function fetchFinnhubCandles(
  symbol: string,
  resolution: Resolution,
  count: number,
): Promise<Candle[]> {
  const step = RESOLUTION_SECONDS[resolution];
  const to = Math.floor(Date.now() / 1000);
  const from = to - step * count;
  const raw = await fh<{
    s: string;
    t: number[];
    o: number[];
    h: number[];
    l: number[];
    c: number[];
    v: number[];
  }>("/stock/candle", { symbol, resolution, from, to });
  if (raw.s !== "ok" || !raw.t) return [];
  return raw.t.map((t, i) => ({
    time: t,
    open: raw.o[i],
    high: raw.h[i],
    low: raw.l[i],
    close: raw.c[i],
    volume: raw.v[i],
  }));
}

/**
 * Candle sourcing, in priority order:
 *  - Daily/weekly/monthly: Stooq (free real EOD history, no key required).
 *  - Intraday: Finnhub (premium) when a key is configured.
 *  - Anything that fails or is unavailable falls back to deterministic mock
 *    data, so the chart always renders something instead of erroring.
 */
export async function getCandles(
  symbol: string,
  resolution: Resolution,
  count = 300,
): Promise<Candle[]> {
  symbol = normalizeSymbol(symbol);
  // Japanese stocks: Yahoo covers all resolutions (delayed); fall back to mock.
  if (isJpSymbol(symbol)) {
    const y = await fetchYahooCandles(symbol, resolution, count);
    if (y && y.length) return y;
    return mockCandles(symbol, resolution, count);
  }
  if (stooqSupports(resolution)) {
    const stooq = await fetchStooqCandles(symbol, resolution, count);
    if (stooq && stooq.length) return stooq;
    if (!isMockMode()) {
      try {
        const fh = await fetchFinnhubCandles(symbol, resolution, count);
        if (fh.length) return fh;
      } catch {
        /* premium-gated or unavailable — fall through to mock */
      }
    }
  } else if (!isMockMode()) {
    try {
      const fh = await fetchFinnhubCandles(symbol, resolution, count);
      if (fh.length) return fh;
    } catch {
      /* fall through to mock */
    }
  }
  return mockCandles(symbol, resolution, count);
}

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  if (isMockMode()) return mockSearch(query);
  // Surface Japanese names from our universe even on the live (Finnhub) path,
  // since the free /search endpoint doesn't reliably return Tokyo listings.
  const jp = searchUniverse(query).filter((r) => r.exchange === "Tokyo");
  const raw = await fh<{ result: Array<{ symbol: string; description: string; type: string }> }>(
    "/search",
    { q: query },
  );
  const live = (raw.result ?? []).map((r) => ({
    symbol: r.symbol,
    description: r.description,
    type: r.type,
  }));
  return [...jp, ...live].slice(0, 12);
}

export async function getProfile(symbol: string): Promise<CompanyProfile> {
  symbol = normalizeSymbol(symbol);
  if (isJpSymbol(symbol)) {
    return (await fetchYahooProfile(symbol)) ?? mockProfile(symbol);
  }
  if (isMockMode()) return mockProfile(symbol);
  const raw = await fh<{
    name: string;
    country: string;
    currency: string;
    exchange: string;
    finnhubIndustry: string;
    logo: string;
    marketCapitalization: number;
    shareOutstanding: number;
    weburl: string;
    ipo: string;
  }>("/stock/profile2", { symbol });
  return {
    symbol,
    name: raw.name,
    country: raw.country,
    currency: raw.currency,
    exchange: raw.exchange,
    industry: raw.finnhubIndustry,
    logo: raw.logo,
    marketCap: raw.marketCapitalization,
    shareOutstanding: raw.shareOutstanding,
    weburl: raw.weburl,
    ipo: raw.ipo,
  };
}

export async function getFinancials(symbol: string): Promise<BasicFinancials> {
  symbol = normalizeSymbol(symbol);
  // Yahoo's chart feed doesn't carry fundamentals, so JP names use the
  // universe-anchored mock figures (price/chart remain real via Yahoo).
  if (isJpSymbol(symbol)) return mockFinancials(symbol);
  if (isMockMode()) return mockFinancials(symbol);
  const raw = await fh<{ metric: Record<string, number | null> }>("/stock/metric", {
    symbol,
    metric: "all",
  });
  const m = raw.metric ?? {};
  return {
    symbol,
    peRatio: m.peTTM ?? m.peBasicExclExtraTTM ?? null,
    pbRatio: m.pbQuarterly ?? null,
    psRatio: m.psTTM ?? null,
    dividendYield: m.dividendYieldIndicatedAnnual ?? null,
    beta: m.beta ?? null,
    week52High: m["52WeekHigh"] ?? null,
    week52Low: m["52WeekLow"] ?? null,
    marketCap: m.marketCapitalization ?? null,
    eps: m.epsTTM ?? null,
    roe: m.roeTTM ?? null,
    netMargin: m.netProfitMarginTTM ?? null,
    revenueGrowth: m.revenueGrowthTTMYoy ?? null,
  };
}

export async function getCompanyNews(symbol: string): Promise<NewsItem[]> {
  if (isMockMode()) return mockCompanyNews(symbol);
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const raw = await fh<NewsItem[]>("/company-news", { symbol, from, to });
  return (raw ?? []).slice(0, 20);
}

export async function getMarketNews(): Promise<NewsItem[]> {
  if (isMockMode()) return mockMarketNews();
  const raw = await fh<NewsItem[]>("/news", { category: "general" });
  return (raw ?? []).slice(0, 30);
}

export async function getEconomicCalendar(): Promise<EconomicEvent[]> {
  if (isMockMode()) return mockEconomicCalendar();
  // The economic-calendar endpoint requires a premium plan; mirror its shape
  // with mock data when the live call is unavailable so the page still works.
  try {
    const raw = await fh<{
      economicCalendar: Array<{
        time: string;
        country: string;
        event: string;
        impact: string;
        actual: number | null;
        estimate: number | null;
        prev: number | null;
        unit: string;
      }>;
    }>("/calendar/economic", {});
    const events = raw.economicCalendar ?? [];
    if (!events.length) return mockEconomicCalendar();
    return events.map((e) => ({
      time: Math.floor(new Date(e.time).getTime() / 1000),
      country: e.country,
      event: e.event,
      impact: (["low", "medium", "high"].includes(e.impact) ? e.impact : "low") as EconomicEvent["impact"],
      actual: e.actual?.toString() ?? null,
      estimate: e.estimate?.toString() ?? null,
      previous: e.prev?.toString() ?? null,
      unit: e.unit,
    }));
  } catch {
    return mockEconomicCalendar();
  }
}

// The screener composes per-symbol live calls (quote + metrics). For the live
// path we fan out across the universe; in mock mode it is fully synthetic.
export async function getScreenerRows(): Promise<ScreenerRow[]> {
  if (isMockMode()) return mockScreenerRows();
  const { UNIVERSE } = await import("./universe");
  const rows = await Promise.all(
    UNIVERSE.map(async (u) => {
      try {
        const [q, fin] = await Promise.all([getQuote(u.symbol), getFinancials(u.symbol)]);
        return {
          symbol: u.symbol,
          name: u.name,
          sector: u.sector,
          price: q.current,
          percentChange: q.percentChange,
          marketCap: fin.marketCap ?? u.marketCap,
          peRatio: fin.peRatio ?? u.pe,
          dividendYield: fin.dividendYield ?? u.dividendYield,
          volume: 0,
          beta: fin.beta ?? u.beta,
          week52High: fin.week52High ?? q.high,
          week52Low: fin.week52Low ?? q.low,
        } satisfies ScreenerRow;
      } catch {
        return null;
      }
    }),
  );
  return rows.filter((r): r is ScreenerRow => r !== null);
}
