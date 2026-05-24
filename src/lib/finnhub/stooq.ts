import "server-only";
import type { Candle, Resolution } from "@/lib/types";

// Stooq offers free end-of-day history via a CSV download endpoint. It only
// covers daily / weekly / monthly bars (no intraday), which is why intraday
// resolutions fall through to other sources upstream.
const INTERVAL: Partial<Record<Resolution, string>> = { D: "d", W: "w", M: "m" };

export function stooqSupports(resolution: Resolution): boolean {
  return resolution in INTERVAL;
}

function toStooqSymbol(symbol: string): string {
  // US equities/ETFs use a ".us" suffix; dotted tickers (BRK.B) use a hyphen.
  return symbol.toLowerCase().replace(/\./g, "-") + ".us";
}

export function parseStooqCsv(text: string, count: number): Candle[] | null {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return null;
  // A valid response starts with the CSV header. Errors return "No data" or HTML.
  if (!lines[0].toLowerCase().startsWith("date")) return null;

  const out: Candle[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 5) continue;
    const [date, o, h, l, c, v] = cols;
    const time = Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
    const open = Number(o);
    const high = Number(h);
    const low = Number(l);
    const close = Number(c);
    const volume = Number(v ?? 0);
    if (!Number.isFinite(time) || !Number.isFinite(close)) continue;
    out.push({
      time,
      open,
      high,
      low,
      close,
      volume: Number.isFinite(volume) ? volume : 0,
    });
  }
  if (out.length === 0) return null;
  return out.slice(-count);
}

export async function fetchStooqCandles(
  symbol: string,
  resolution: Resolution,
  count: number,
): Promise<Candle[] | null> {
  const interval = INTERVAL[resolution];
  if (!interval) return null;
  const url = `https://stooq.com/q/d/l/?s=${toStooqSymbol(symbol)}&i=${interval}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return parseStooqCsv(await res.text(), count);
  } catch {
    return null;
  }
}
