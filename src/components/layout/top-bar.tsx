"use client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "lucide-react";
import { SymbolSearch } from "@/components/symbol-search";
import { api } from "@/lib/api";
import { MarketClock } from "./market-clock";

export function TopBar() {
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: api.meta, staleTime: Infinity });

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-bg-soft px-4">
      <SymbolSearch className="w-full max-w-md" />
      <div className="ml-auto flex items-center gap-3">
        {meta?.mock && (
          <span
            className="chip border-amber-500/40 bg-amber-500/10 text-amber-400"
            title="No FINNHUB_API_KEY set — serving deterministic mock data."
          >
            <Database className="mr-1 h-3 w-3" />
            Demo data
          </span>
        )}
        <MarketClock />
      </div>
    </header>
  );
}
