import { NextResponse } from "next/server";
import { getQuote } from "@/lib/finnhub/client";
import type { Quote } from "@/lib/types";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("symbols");
  if (!raw) return NextResponse.json({ error: "symbols required" }, { status: 400 });
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 50);
  const results = await Promise.all(
    symbols.map(async (s): Promise<Quote | null> => {
      try {
        return await getQuote(s);
      } catch {
        return null;
      }
    }),
  );
  const quotes: Record<string, Quote> = {};
  for (const q of results) if (q) quotes[q.symbol] = q;
  return NextResponse.json(quotes);
}
