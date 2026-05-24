"use client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/utils";

export function NewsList({ symbol, limit }: { symbol?: string; limit?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["news", symbol ?? "general"],
    queryFn: () => api.news(symbol),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-bg-soft" />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return <p className="py-6 text-center text-sm text-text-muted">No news available.</p>;
  }

  const items = limit ? data.slice(0, limit) : data;

  return (
    <ul className="divide-y divide-border">
      {items.map((n) => (
        <li key={n.id}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-3 py-3 transition-colors hover:bg-bg-hover/40"
          >
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-text group-hover:text-text-bright">
                {n.headline}
              </p>
              <p className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                <span className="font-medium">{n.source}</span>
                <span>·</span>
                <span>{formatRelative(n.datetime)}</span>
                {n.related && (
                  <>
                    <span>·</span>
                    <span className="chip border-border px-1.5 py-0 text-[10px]">{n.related}</span>
                  </>
                )}
              </p>
            </div>
            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </li>
      ))}
    </ul>
  );
}
