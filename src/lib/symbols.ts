// Shared, client-safe helpers for reasoning about ticker symbols across
// markets. Japanese (Tokyo) equities use the Yahoo-style "<code>.T" form
// (e.g. 7203.T for Toyota); a bare 4-digit code is treated as Tokyo.

export function normalizeSymbol(input: string): string {
  const s = input.trim().toUpperCase();
  if (/^\d{4}$/.test(s)) return `${s}.T`;
  return s;
}

export function isJpSymbol(symbol: string): boolean {
  return /\.T$/.test(symbol.toUpperCase());
}

export function currencyForSymbol(symbol: string): string {
  return isJpSymbol(symbol) ? "JPY" : "USD";
}
