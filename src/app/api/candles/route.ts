import { NextResponse } from "next/server";
import { getCandles } from "@/lib/finnhub/client";
import type { Resolution } from "@/lib/types";

const VALID: Resolution[] = ["1", "5", "15", "30", "60", "D", "W", "M"];

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const symbol = params.get("symbol");
  const resolution = (params.get("resolution") ?? "D") as Resolution;
  const count = Number(params.get("count") ?? "300");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  if (!VALID.includes(resolution)) {
    return NextResponse.json({ error: "invalid resolution" }, { status: 400 });
  }
  try {
    const candles = await getCandles(symbol.toUpperCase(), resolution, Math.min(Math.max(count, 30), 1000));
    return NextResponse.json(candles);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
