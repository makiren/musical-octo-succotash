import { ChartWorkspace } from "@/components/chart/chart-workspace";
import { normalizeSymbol } from "@/lib/symbols";

export default async function ChartPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ChartWorkspace symbol={normalizeSymbol(decodeURIComponent(symbol))} />;
}
