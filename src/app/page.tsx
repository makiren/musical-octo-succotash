import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/page-header";
import { MarketStrip } from "@/components/overview/market-strip";
import { Movers } from "@/components/overview/movers";
import { WatchlistTable } from "@/components/watchlist-table";
import { NewsList } from "@/components/news-list";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <PageHeader title="Market Overview" subtitle="Indices, movers, your watchlist and the latest headlines." />

      <section>
        <SectionTitle>Major Markets</SectionTitle>
        <MarketStrip />
      </section>

      <Movers />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text-bright">Watchlist</h2>
            <Link href="/watchlist" className="flex items-center gap-1 text-xs text-accent hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-2">
            <WatchlistTable limit={8} />
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text-bright">Market News</h2>
            <Link href="/news" className="flex items-center gap-1 text-xs text-accent hover:underline">
              More <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-4">
            <NewsList limit={6} />
          </div>
        </section>
      </div>
    </div>
  );
}
