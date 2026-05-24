import { NextResponse } from "next/server";
import { getScreenerRows } from "@/lib/finnhub/client";

export async function GET() {
  try {
    return NextResponse.json(await getScreenerRows());
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
