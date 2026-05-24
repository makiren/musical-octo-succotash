import { NextResponse } from "next/server";
import { getEconomicCalendar } from "@/lib/finnhub/client";

export async function GET() {
  try {
    return NextResponse.json(await getEconomicCalendar());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
