import type { Candle } from "./types";

export interface LinePoint {
  time: number;
  value: number;
}

/** Simple Moving Average. Output aligned to candle times; undefined head dropped. */
export function sma(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0) return [];
  const out: LinePoint[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: round(sum / period) });
  }
  return out;
}

/** Exponential Moving Average. */
export function ema(candles: Candle[], period: number): LinePoint[] {
  if (period <= 0 || candles.length < period) return [];
  const out: LinePoint[] = [];
  const k = 2 / (period + 1);
  // Seed with SMA of the first `period` closes.
  let prev = 0;
  for (let i = 0; i < period; i++) prev += candles[i].close;
  prev /= period;
  out.push({ time: candles[period - 1].time, value: round(prev) });
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k);
    out.push({ time: candles[i].time, value: round(prev) });
  }
  return out;
}

function emaSeries(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  out.push(prev);
  for (let i = 1; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

/** Relative Strength Index (Wilder's smoothing). Returns 0–100 line. */
export function rsi(candles: Candle[], period = 14): LinePoint[] {
  if (candles.length <= period) return [];
  const out: LinePoint[] = [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  const rs0 = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  out.push({ time: candles[period].time, value: round(rs0) });
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const g = diff >= 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    const value = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    out.push({ time: candles[i].time, value: round(value) });
  }
  return out;
}

export interface MacdResult {
  macd: LinePoint[];
  signal: LinePoint[];
  histogram: LinePoint[];
}

/** MACD (12, 26, 9 by default). */
export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): MacdResult {
  if (candles.length < slow + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }
  const closes = candles.map((c) => c.close);
  const emaFast = emaSeries(closes, fast);
  const emaSlow = emaSeries(closes, slow);
  const macdLine = closes.map((_, i) => emaFast[i] - emaSlow[i]);
  // Signal = EMA of MACD, computed from `slow-1` onward for stability.
  const start = slow - 1;
  const macdTail = macdLine.slice(start);
  const signalTail = emaSeries(macdTail, signalPeriod);

  const macdPts: LinePoint[] = [];
  const signalPts: LinePoint[] = [];
  const histPts: LinePoint[] = [];
  for (let i = start; i < candles.length; i++) {
    const t = candles[i].time;
    const m = macdLine[i];
    const s = signalTail[i - start];
    macdPts.push({ time: t, value: round(m) });
    signalPts.push({ time: t, value: round(s) });
    histPts.push({ time: t, value: round(m - s) });
  }
  return { macd: macdPts, signal: signalPts, histogram: histPts };
}

export interface BollingerResult {
  upper: LinePoint[];
  middle: LinePoint[];
  lower: LinePoint[];
}

/** Bollinger Bands (20, 2 by default). */
export function bollinger(candles: Candle[], period = 20, mult = 2): BollingerResult {
  const upper: LinePoint[] = [];
  const middle: LinePoint[] = [];
  const lower: LinePoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    const mean = sum / period;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      variance += (candles[j].close - mean) ** 2;
    }
    const sd = Math.sqrt(variance / period);
    const t = candles[i].time;
    middle.push({ time: t, value: round(mean) });
    upper.push({ time: t, value: round(mean + mult * sd) });
    lower.push({ time: t, value: round(mean - mult * sd) });
  }
  return { upper, middle, lower };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
