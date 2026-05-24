import { PageHeader } from "@/components/page-header";
import { NewsList } from "@/components/news-list";
import { EconomicCalendar } from "@/components/economic-calendar";

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 lg:p-6">
      <PageHeader title="News & Economic Calendar" subtitle="Market headlines and upcoming macro events." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-text-bright">
            Market News
          </h2>
          <div className="px-4">
            <NewsList />
          </div>
        </section>
        <section className="card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-text-bright">
            Economic Calendar
          </h2>
          <EconomicCalendar />
        </section>
      </div>
    </div>
  );
}
