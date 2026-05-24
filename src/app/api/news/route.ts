import { NextResponse } from "next/server";
import { getCompanyNews, getMarketNews } from "@/lib/finnhub/client";

export async function GET(req: Request) {
  const symbol = new URL(req.url).searchParams.get("symbol");
  try {
    const news = symbol ? await getCompanyNews(symbol.toUpperCase()) : await getMarketNews();
    return NextResponse.json(news);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
