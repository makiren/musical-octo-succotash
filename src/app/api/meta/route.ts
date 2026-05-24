import { NextResponse } from "next/server";
import { isMockMode } from "@/lib/finnhub/client";

export async function GET() {
  return NextResponse.json({ mock: isMockMode() });
}
