import { PageHeader } from "@/components/page-header";
import { WatchlistTable } from "@/components/watchlist-table";
import { SymbolSearch } from "@/components/symbol-search";

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 lg:p-6">
      <PageHeader title="Watchlist" subtitle="Track your favorite symbols. Quotes refresh automatically." />
      <SymbolSearch className="max-w-md" />
      <div className="card p-2">
        <WatchlistTable />
      </div>
    </div>
  );
}
