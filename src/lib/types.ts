export interface Quote {
  symbol: string;
  current: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Resolution = "1" | "5" | "15" | "30" | "60" | "D" | "W" | "M";

export interface SymbolSearchResult {
  symbol: string;
  description: string;
  type: string;
  exchange?: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  country: string;
  currency: string;
  exchange: string;
  industry: string;
  logo: string;
  marketCap: number;
  shareOutstanding: number;
  weburl: string;
  ipo: string;
}

export interface NewsItem {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  source: string;
  summary: string;
  url: string;
  related: string;
}

export interface BasicFinancials {
  symbol: string;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  dividendYield: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
  marketCap: number | null;
  eps: number | null;
  roe: number | null;
  netMargin: number | null;
  revenueGrowth: number | null;
}

export interface ScreenerRow {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  percentChange: number;
  marketCap: number; // in millions
  peRatio: number | null;
  dividendYield: number | null;
  volume: number;
  beta: number | null;
  week52High: number;
  week52Low: number;
}

export interface EconomicEvent {
  time: number;
  country: string;
  event: string;
  impact: "low" | "medium" | "high";
  actual: string | null;
  estimate: string | null;
  previous: string | null;
  unit: string;
}

export interface DataSourceMeta {
  /** true when responses are generated mock data (no API key configured) */
  mock: boolean;
}
