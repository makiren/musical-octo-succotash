import { NextResponse } from "next/server";
import { searchSymbols } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 1) return NextResponse.json([]);
  try {
    return NextResponse.json(await searchSymbols(q));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
