"use client";
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
} from "./types";

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  quote: (symbol: string) => getJSON<Quote>(`/api/quote?symbol=${encodeURIComponent(symbol)}`),
  quotes: (symbols: string[]) =>
    symbols.length
      ? getJSON<Record<string, Quote>>(`/api/quotes?symbols=${encodeURIComponent(symbols.join(","))}`)
      : Promise.resolve({} as Record<string, Quote>),
  candles: (symbol: string, resolution: Resolution, count = 300) =>
    getJSON<Candle[]>(
      `/api/candles?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&count=${count}`,
    ),
  search: (q: string) => getJSON<SymbolSearchResult[]>(`/api/search?q=${encodeURIComponent(q)}`),
  profile: (symbol: string) =>
    getJSON<{ profile: CompanyProfile; financials: BasicFinancials }>(
      `/api/profile?symbol=${encodeURIComponent(symbol)}`,
    ),
  news: (symbol?: string) =>
    getJSON<NewsItem[]>(symbol ? `/api/news?symbol=${encodeURIComponent(symbol)}` : `/api/news`),
  screener: () => getJSON<ScreenerRow[]>(`/api/screener`),
  calendar: () => getJSON<EconomicEvent[]>(`/api/calendar`),
  meta: () => getJSON<{ mock: boolean }>(`/api/meta`),
};
