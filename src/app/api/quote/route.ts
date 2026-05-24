import { NextResponse } from "next/server";
import { getQuote } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  const symbol = new URL(req.url).searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  try {
    const quote = await getQuote(symbol.toUpperCase());
    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
