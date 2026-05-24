// A small but representative universe used for the screener, search and mock
// data. Base prices are rough anchors; mock quotes jitter around them.
export interface UniverseEntry {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  marketCap: number; // millions USD
  pe: number | null;
  dividendYield: number | null; // percent
  beta: number | null;
}

export const INDEX_SYMBOLS = ["SPY", "QQQ", "DIA", "IWM"];

export const UNIVERSE: UniverseEntry[] = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", sector: "Index ETF", basePrice: 585, marketCap: 560000, pe: null, dividendYield: 1.21, beta: 1.0 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "Index ETF", basePrice: 505, marketCap: 320000, pe: null, dividendYield: 0.57, beta: 1.1 },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", sector: "Index ETF", basePrice: 445, marketCap: 38000, pe: null, dividendYield: 1.65, beta: 0.95 },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", sector: "Index ETF", basePrice: 232, marketCap: 68000, pe: null, dividendYield: 1.2, beta: 1.18 },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", basePrice: 229, marketCap: 3500000, pe: 35.1, dividendYield: 0.43, beta: 1.25 },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", basePrice: 430, marketCap: 3200000, pe: 36.7, dividendYield: 0.72, beta: 0.93 },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", basePrice: 138, marketCap: 3400000, pe: 64.2, dividendYield: 0.02, beta: 1.66 },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services", basePrice: 178, marketCap: 2150000, pe: 24.4, dividendYield: 0.45, beta: 1.03 },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical", basePrice: 205, marketCap: 2140000, pe: 45.9, dividendYield: null, beta: 1.15 },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Communication Services", basePrice: 585, marketCap: 1480000, pe: 28.3, dividendYield: 0.34, beta: 1.21 },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical", basePrice: 352, marketCap: 1130000, pe: 91.5, dividendYield: null, beta: 2.31 },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financial Services", basePrice: 467, marketCap: 1000000, pe: 13.2, dividendYield: null, beta: 0.87 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services", basePrice: 248, marketCap: 700000, pe: 13.0, dividendYield: 2.0, beta: 1.1 },
  { symbol: "V", name: "Visa Inc.", sector: "Financial Services", basePrice: 312, marketCap: 600000, pe: 31.5, dividendYield: 0.74, beta: 0.96 },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", basePrice: 153, marketCap: 369000, pe: 23.1, dividendYield: 3.25, beta: 0.52 },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", basePrice: 92, marketCap: 740000, pe: 39.1, dividendYield: 0.91, beta: 0.49 },
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", basePrice: 119, marketCap: 525000, pe: 14.3, dividendYield: 3.32, beta: 0.85 },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Defensive", basePrice: 169, marketCap: 398000, pe: 27.8, dividendYield: 2.38, beta: 0.41 },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financial Services", basePrice: 528, marketCap: 485000, pe: 38.4, dividendYield: 0.55, beta: 1.05 },
  { symbol: "HD", name: "The Home Depot Inc.", sector: "Consumer Cyclical", basePrice: 405, marketCap: 402000, pe: 27.2, dividendYield: 2.22, beta: 1.02 },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive", basePrice: 63, marketCap: 271000, pe: 25.6, dividendYield: 3.07, beta: 0.59 },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Defensive", basePrice: 158, marketCap: 217000, pe: 22.0, dividendYield: 3.41, beta: 0.55 },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", sector: "Technology", basePrice: 138, marketCap: 224000, pe: 122.0, dividendYield: null, beta: 1.69 },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services", basePrice: 905, marketCap: 388000, pe: 49.8, dividendYield: null, beta: 1.28 },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology", basePrice: 24, marketCap: 103000, pe: null, dividendYield: 1.65, beta: 1.07 },
  { symbol: "BAC", name: "Bank of America Corp.", sector: "Financial Services", basePrice: 46, marketCap: 350000, pe: 16.1, dividendYield: 2.27, beta: 1.32 },
  { symbol: "DIS", name: "The Walt Disney Company", sector: "Communication Services", basePrice: 112, marketCap: 203000, pe: 38.5, dividendYield: 0.8, beta: 1.4 },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy", basePrice: 161, marketCap: 290000, pe: 16.7, dividendYield: 4.05, beta: 1.11 },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", basePrice: 178, marketCap: 314000, pe: 62.1, dividendYield: 3.49, beta: 0.6 },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology", basePrice: 330, marketCap: 317000, pe: 54.2, dividendYield: 0.48, beta: 1.29 },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology", basePrice: 188, marketCap: 519000, pe: 43.0, dividendYield: 0.85, beta: 1.0 },
  { symbol: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Defensive", basePrice: 965, marketCap: 428000, pe: 55.3, dividendYield: 0.48, beta: 0.79 },
  { symbol: "MRK", name: "Merck & Co. Inc.", sector: "Healthcare", basePrice: 100, marketCap: 254000, pe: 21.3, dividendYield: 3.16, beta: 0.39 },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", basePrice: 25, marketCap: 144000, pe: 27.8, dividendYield: 6.5, beta: 0.61 },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", basePrice: 480, marketCap: 212000, pe: 41.2, dividendYield: null, beta: 1.33 },
  { symbol: "QCOM", name: "QUALCOMM Inc.", sector: "Technology", basePrice: 158, marketCap: 176000, pe: 17.8, dividendYield: 1.97, beta: 1.22 },
];

export const UNIVERSE_MAP = new Map(UNIVERSE.map((u) => [u.symbol, u]));

export const SECTORS = Array.from(new Set(UNIVERSE.map((u) => u.sector))).sort();
