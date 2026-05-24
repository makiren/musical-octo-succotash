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
import { UNIVERSE, UNIVERSE_MAP, searchUniverse, type UniverseEntry } from "./universe";
import { currencyForSymbol, isJpSymbol } from "@/lib/symbols";

// Deterministic PRNG (mulberry32) so a given symbol always yields the same
// series — keeps charts stable across refetches while still looking organic.
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function entryFor(symbol: string): UniverseEntry {
  return (
    UNIVERSE_MAP.get(symbol) ?? {
      symbol,
      name: `${symbol} Holdings`,
      sector: "Technology",
      basePrice: 100 + (hashString(symbol) % 400),
      marketCap: 20000 + (hashString(symbol) % 500000),
      pe: 15 + (hashString(symbol) % 40),
      dividendYield: (hashString(symbol) % 5) / 1.5,
      beta: 0.6 + (hashString(symbol) % 150) / 100,
    }
  );
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

export function mockCandles(symbol: string, resolution: Resolution, count = 300): Candle[] {
  const entry = entryFor(symbol);
  const rand = mulberry32(hashString(symbol + resolution));
  const step = RESOLUTION_SECONDS[resolution];
  const now = Math.floor(Date.now() / 1000);
  // Align to step boundary.
  const end = now - (now % step);

  // Annualised vol scaled to the bar size.
  const barVol = 0.02 * Math.sqrt(step / 86400) + 0.004;
  let price = entry.basePrice * (0.7 + rand() * 0.2);
  // Gentle drift so the series trends rather than purely mean-reverts.
  const drift = (rand() - 0.45) * barVol * 0.15;

  const candles: Candle[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const time = end - i * step;
    const shock = (rand() - 0.5) * 2 * barVol;
    const open = price;
    const close = Math.max(0.5, open * (1 + drift + shock));
    const wick = Math.abs(shock) * open * (0.6 + rand());
    const high = Math.max(open, close) + wick * rand();
    const low = Math.min(open, close) - wick * rand();
    // marketCap is in $M, so marketCap/basePrice ≈ shares outstanding in
    // millions; turn ~0.1–0.4% daily turnover into an absolute share count.
    const sharesOutstanding = (entry.marketCap / entry.basePrice) * 1_000_000;
    const volume = Math.round(sharesOutstanding * (0.001 + rand() * 0.003));
    candles.push({
      time,
      open: round2(open),
      high: round2(high),
      low: round2(Math.max(0.4, low)),
      close: round2(close),
      volume,
    });
    price = close;
  }
  return candles;
}

export function mockQuote(symbol: string): Quote {
  const candles = mockCandles(symbol, "D", 2);
  const today = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? today;
  const previousClose = prev.close;
  const current = today.close;
  const change = round2(current - previousClose);
  return {
    symbol,
    current,
    change,
    percentChange: round2((change / previousClose) * 100),
    high: today.high,
    low: today.low,
    open: today.open,
    previousClose,
    timestamp: today.time,
    currency: currencyForSymbol(symbol),
  };
}

export function mockProfile(symbol: string): CompanyProfile {
  const entry = entryFor(symbol);
  const jp = isJpSymbol(symbol);
  return {
    symbol,
    name: entry.name,
    country: jp ? "JP" : "US",
    currency: entry.currency ?? (jp ? "JPY" : "USD"),
    exchange: jp ? "Tokyo" : "NASDAQ/NYSE",
    industry: entry.sector,
    logo: "",
    marketCap: entry.marketCap,
    shareOutstanding: Math.round((entry.marketCap * 1_000_000) / entry.basePrice / 1_000_000),
    weburl: `https://www.google.com/search?q=${encodeURIComponent(entry.name)}`,
    ipo: "1990-01-01",
  };
}

export function mockFinancials(symbol: string): BasicFinancials {
  const entry = entryFor(symbol);
  const rand = mulberry32(hashString(symbol + "fin"));
  return {
    symbol,
    peRatio: entry.pe,
    pbRatio: round2(2 + rand() * 12),
    psRatio: round2(1 + rand() * 14),
    dividendYield: entry.dividendYield,
    beta: entry.beta,
    week52High: round2(entry.basePrice * (1.05 + rand() * 0.35)),
    week52Low: round2(entry.basePrice * (0.55 + rand() * 0.25)),
    marketCap: entry.marketCap,
    eps: entry.pe ? round2(entry.basePrice / entry.pe) : null,
    roe: round2(8 + rand() * 40),
    netMargin: round2(5 + rand() * 35),
    revenueGrowth: round2(-5 + rand() * 45),
  };
}

const HEADLINES = [
  "{name} beats quarterly estimates as demand accelerates",
  "Analysts raise price target on {name} citing margin expansion",
  "{name} unveils new product line ahead of schedule",
  "Regulators open review into {name} market practices",
  "{name} announces buyback program worth billions",
  "Supply chain easing lifts outlook for {name}",
  "{name} CFO signals confidence in full-year guidance",
  "Institutional investors increase stake in {name}",
];

export function mockCompanyNews(symbol: string, count = 12): NewsItem[] {
  const entry = entryFor(symbol);
  const rand = mulberry32(hashString(symbol + "news"));
  const now = Math.floor(Date.now() / 1000);
  const sources = ["Reuters", "Bloomberg", "CNBC", "MarketWatch", "Barron's", "WSJ"];
  return Array.from({ length: count }).map((_, i) => {
    const headline = HEADLINES[Math.floor(rand() * HEADLINES.length)].replace("{name}", entry.name);
    return {
      id: hashString(symbol + i),
      category: "company",
      datetime: now - i * 3600 * (3 + Math.floor(rand() * 9)),
      headline,
      image: "",
      source: sources[Math.floor(rand() * sources.length)],
      summary: `${entry.name} (${symbol}) — ${headline}. Market participants weigh the implications for the broader ${entry.sector} sector.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(headline)}`,
      related: symbol,
    };
  });
}

export function mockMarketNews(count = 20): NewsItem[] {
  const picks = UNIVERSE.slice(0, count).map((u) => u.symbol);
  return picks
    .flatMap((s) => mockCompanyNews(s, 2))
    .sort((a, b) => b.datetime - a.datetime)
    .slice(0, count)
    .map((n) => ({ ...n, category: "general" }));
}

export function mockSearch(query: string): SymbolSearchResult[] {
  return searchUniverse(query);
}

export function mockScreenerRows(): ScreenerRow[] {
  return UNIVERSE.map((u) => {
    const q = mockQuote(u.symbol);
    const fin = mockFinancials(u.symbol);
    return {
      symbol: u.symbol,
      name: u.name,
      sector: u.sector,
      price: q.current,
      percentChange: q.percentChange,
      marketCap: u.marketCap,
      peRatio: u.pe,
      dividendYield: u.dividendYield,
      volume: Math.round((u.marketCap / u.basePrice) * 12000),
      beta: u.beta,
      week52High: fin.week52High ?? q.high,
      week52Low: fin.week52Low ?? q.low,
    };
  });
}

const EVENTS = [
  { event: "Initial Jobless Claims", impact: "medium" as const, unit: "K" },
  { event: "CPI (YoY)", impact: "high" as const, unit: "%" },
  { event: "Fed Interest Rate Decision", impact: "high" as const, unit: "%" },
  { event: "Nonfarm Payrolls", impact: "high" as const, unit: "K" },
  { event: "Retail Sales (MoM)", impact: "medium" as const, unit: "%" },
  { event: "ISM Manufacturing PMI", impact: "medium" as const, unit: "" },
  { event: "GDP Growth Rate (QoQ)", impact: "high" as const, unit: "%" },
  { event: "Consumer Confidence", impact: "low" as const, unit: "" },
  { event: "Crude Oil Inventories", impact: "low" as const, unit: "M" },
];

export function mockEconomicCalendar(): EconomicEvent[] {
  const rand = mulberry32(hashString("calendar" + new Date().toDateString()));
  const now = Date.now();
  const countries = ["US", "EU", "GB", "JP", "CN"];
  return Array.from({ length: 18 }).map((_, i) => {
    const ev = EVENTS[Math.floor(rand() * EVENTS.length)];
    const offsetDays = Math.floor(rand() * 7) - 1;
    const past = offsetDays < 0;
    const base = 50 + rand() * 200;
    return {
      time: Math.floor((now + offsetDays * 86400000 + rand() * 8 * 3600000) / 1000),
      country: countries[Math.floor(rand() * countries.length)],
      event: ev.event,
      impact: ev.impact,
      actual: past ? round2(base + (rand() - 0.5) * 10).toString() : null,
      estimate: round2(base).toString(),
      previous: round2(base - (rand() - 0.5) * 8).toString(),
      unit: ev.unit,
    };
  }).sort((a, b) => a.time - b.time);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
