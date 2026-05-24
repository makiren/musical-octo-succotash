import { NextResponse } from "next/server";
import { getFinancials, getProfile } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  const symbol = new URL(req.url).searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  const s = symbol.toUpperCase();
  try {
    const [profile, financials] = await Promise.all([getProfile(s), getFinancials(s)]);
    return NextResponse.json({ profile, financials });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
