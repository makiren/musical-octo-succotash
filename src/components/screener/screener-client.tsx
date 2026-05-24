"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { SECTORS } from "@/lib/finnhub/universe";
import type { ScreenerRow } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { WatchButton } from "@/components/watch-button";
import { cn, formatMarketCap, formatNumber, formatPercent, formatPrice } from "@/lib/utils";

type SortKey = keyof Pick<
  ScreenerRow,
  "symbol" | "price" | "percentChange" | "marketCap" | "peRatio" | "dividendYield" | "beta"
>;

interface Filters {
  query: string;
  sector: string;
  minMarketCap: string; // billions
  maxPE: string;
  minDivYield: string;
  changeDir: "all" | "up" | "down";
}

const DEFAULT_FILTERS: Filters = {
  query: "",
  sector: "All",
  minMarketCap: "",
  maxPE: "",
  minDivYield: "",
  changeDir: "all",
};

export function ScreenerClient() {
  const { data, isLoading } = useQuery({ queryKey: ["screener"], queryFn: api.screener, staleTime: 60_000 });
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "marketCap",
    dir: "desc",
  });

  const rows = useMemo(() => {
    let r = data ?? [];
    const q = filters.query.trim().toUpperCase();
    if (q) r = r.filter((x) => x.symbol.includes(q) || x.name.toUpperCase().includes(q));
    if (filters.sector !== "All") r = r.filter((x) => x.sector === filters.sector);
    const minCap = Number(filters.minMarketCap);
    if (filters.minMarketCap && Number.isFinite(minCap)) {
      r = r.filter((x) => x.marketCap >= minCap * 1000); // input in $B, marketCap in $M
    }
    const maxPE = Number(filters.maxPE);
    if (filters.maxPE && Number.isFinite(maxPE)) {
      r = r.filter((x) => x.peRatio !== null && x.peRatio <= maxPE);
    }
    const minDiv = Number(filters.minDivYield);
    if (filters.minDivYield && Number.isFinite(minDiv)) {
      r = r.filter((x) => (x.dividendYield ?? 0) >= minDiv);
    }
    if (filters.changeDir === "up") r = r.filter((x) => x.percentChange > 0);
    if (filters.changeDir === "down") r = r.filter((x) => x.percentChange < 0);

    const sorted = [...r].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") {
        return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = (av as number | null) ?? -Infinity;
      const bn = (bv as number | null) ?? -Infinity;
      return sort.dir === "asc" ? an - bn : bn - an;
    });
    return sorted;
  }, [data, filters, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  return (
    <>
      <PageHeader
        title="Stock Screener"
        subtitle={`${rows.length} of ${data?.length ?? 0} symbols match your filters.`}
        actions={
          <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-ghost border border-border">
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        }
      />

      {/* Filters */}
      <div className="card grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-6">
        <Field label="Search">
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="Symbol / name"
            className="input w-full"
          />
        </Field>
        <Field label="Sector">
          <select
            value={filters.sector}
            onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}
            className="input w-full"
          >
            <option>All</option>
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Min Mkt Cap ($B)">
          <input
            type="number"
            value={filters.minMarketCap}
            onChange={(e) => setFilters((f) => ({ ...f, minMarketCap: e.target.value }))}
            placeholder="e.g. 100"
            className="input w-full"
          />
        </Field>
        <Field label="Max P/E">
          <input
            type="number"
            value={filters.maxPE}
            onChange={(e) => setFilters((f) => ({ ...f, maxPE: e.target.value }))}
            placeholder="e.g. 30"
            className="input w-full"
          />
        </Field>
        <Field label="Min Div Yield (%)">
          <input
            type="number"
            value={filters.minDivYield}
            onChange={(e) => setFilters((f) => ({ ...f, minDivYield: e.target.value }))}
            placeholder="e.g. 2"
            className="input w-full"
          />
        </Field>
        <Field label="Day Change">
          <select
            value={filters.changeDir}
            onChange={(e) => setFilters((f) => ({ ...f, changeDir: e.target.value as Filters["changeDir"] }))}
            className="input w-full"
          >
            <option value="all">All</option>
            <option value="up">Gainers</option>
            <option value="down">Losers</option>
          </select>
        </Field>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="w-8 px-3 py-2.5" />
              <SortHeader label="Symbol" k="symbol" sort={sort} onClick={toggleSort} />
              <th className="px-3 py-2.5 font-medium">Sector</th>
              <SortHeader label="Price" k="price" sort={sort} onClick={toggleSort} align="right" />
              <SortHeader label="Change" k="percentChange" sort={sort} onClick={toggleSort} align="right" />
              <SortHeader label="Mkt Cap" k="marketCap" sort={sort} onClick={toggleSort} align="right" />
              <SortHeader label="P/E" k="peRatio" sort={sort} onClick={toggleSort} align="right" />
              <SortHeader label="Div %" k="dividendYield" sort={sort} onClick={toggleSort} align="right" />
              <SortHeader label="Beta" k="beta" sort={sort} onClick={toggleSort} align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-text-muted">
                  No symbols match your filters.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.symbol} className="group transition-colors hover:bg-bg-hover">
                  <td className="px-3 py-2.5">
                    <WatchButton symbol={r.symbol} />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/chart/${r.symbol}`} className="block">
                      <div className="font-semibold text-text-bright group-hover:text-accent">{r.symbol}</div>
                      <div className="truncate text-xs text-text-muted">{r.name}</div>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-muted">{r.sector}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(r.price)}</td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", r.percentChange >= 0 ? "text-up" : "text-down")}>
                    {formatPercent(r.percentChange)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatMarketCap(r.marketCap)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(r.peRatio)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {r.dividendYield !== null ? formatPercent(r.dividendYield) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(r.beta)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function SortHeader({
  label,
  k,
  sort,
  onClick,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={cn("px-3 py-2.5 font-medium", align === "right" && "text-right")}>
      <button
        onClick={() => onClick(k)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-text",
          align === "right" && "flex-row-reverse",
          active && "text-text-bright",
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}
