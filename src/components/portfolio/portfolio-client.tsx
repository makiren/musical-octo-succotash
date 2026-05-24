"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { usePortfolio } from "@/lib/store/portfolio";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/page-header";
import { cn, formatNumber, formatPercent, formatPrice } from "@/lib/utils";
import { currencyForSymbol } from "@/lib/symbols";

interface Position {
  symbol: string;
  quantity: number;
  avgCost: number;
  cost: number;
  price: number;
  change: number;
  value: number;
  pnl: number;
  pnlPct: number;
  dayPnl: number;
  currency: string;
}

export function PortfolioClient() {
  const lots = usePortfolio((s) => s.lots);
  const removeLot = usePortfolio((s) => s.removeLot);
  const addLot = usePortfolio((s) => s.addLot);
  const hydrated = useHydrated();

  const symbols = useMemo(
    () => Array.from(new Set(lots.map((l) => l.symbol))).sort(),
    [lots],
  );

  const { data: quotes } = useQuery({
    queryKey: ["quotes", "pf", symbols.join(",")],
    queryFn: () => api.quotes(symbols),
    enabled: hydrated && symbols.length > 0,
    refetchInterval: 20_000,
  });

  const positions = useMemo<Position[]>(() => {
    const bySymbol = new Map<string, { qty: number; cost: number }>();
    for (const l of lots) {
      const cur = bySymbol.get(l.symbol) ?? { qty: 0, cost: 0 };
      cur.qty += l.quantity;
      cur.cost += l.quantity * l.costBasis;
      bySymbol.set(l.symbol, cur);
    }
    return Array.from(bySymbol.entries()).map(([symbol, { qty, cost }]) => {
      const q = quotes?.[symbol];
      const price = q?.current ?? 0;
      const change = q?.change ?? 0;
      const value = qty * price;
      const pnl = value - cost;
      return {
        symbol,
        quantity: qty,
        avgCost: cost / qty,
        cost,
        price,
        change,
        value,
        pnl,
        pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
        dayPnl: qty * change,
        currency: q?.currency ?? currencyForSymbol(symbol),
      };
    });
  }, [lots, quotes]);

  const totals = useMemo(() => {
    const value = positions.reduce((s, p) => s + p.value, 0);
    const cost = positions.reduce((s, p) => s + p.cost, 0);
    const dayPnl = positions.reduce((s, p) => s + p.dayPnl, 0);
    const pnl = value - cost;
    // Totals only make sense in a single currency; show one when all holdings
    // share it, otherwise fall back to a neutral number format.
    const currencies = new Set(positions.map((p) => p.currency));
    return {
      value,
      cost,
      pnl,
      pnlPct: cost > 0 ? (pnl / cost) * 100 : 0,
      dayPnl,
      dayPnlPct: value - dayPnl > 0 ? (dayPnl / (value - dayPnl)) * 100 : 0,
      currency: currencies.size === 1 ? [...currencies][0] : null,
    };
  }, [positions]);

  const fmtTotal = (n: number) =>
    totals.currency ? formatPrice(n, totals.currency) : formatNumber(n);

  return (
    <>
      <PageHeader title="Portfolio" subtitle="Holdings, cost basis and unrealized P&L. Quotes refresh live." />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Market Value" value={fmtTotal(totals.value)} />
        <SummaryCard label="Cost Basis" value={fmtTotal(totals.cost)} />
        <SummaryCard
          label="Total P&L"
          value={fmtTotal(totals.pnl)}
          sub={formatPercent(totals.pnlPct)}
          tone={totals.pnl}
        />
        <SummaryCard
          label="Day P&L"
          value={fmtTotal(totals.dayPnl)}
          sub={formatPercent(totals.dayPnlPct)}
          tone={totals.dayPnl}
        />
      </div>

      <AddPositionForm onAdd={addLot} />

      {/* Positions */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
              <th className="px-3 py-2.5 font-medium">Symbol</th>
              <th className="px-3 py-2.5 text-right font-medium">Qty</th>
              <th className="px-3 py-2.5 text-right font-medium">Avg Cost</th>
              <th className="px-3 py-2.5 text-right font-medium">Last</th>
              <th className="px-3 py-2.5 text-right font-medium">Mkt Value</th>
              <th className="px-3 py-2.5 text-right font-medium">Day P&L</th>
              <th className="px-3 py-2.5 text-right font-medium">Unrealized P&L</th>
              <th className="px-3 py-2.5 text-right font-medium">Weight</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!hydrated ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-text-muted">
                  Loading…
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-text-muted">
                  No positions yet. Add one above.
                </td>
              </tr>
            ) : (
              positions.map((p) => (
                <tr key={p.symbol} className="transition-colors hover:bg-bg-hover">
                  <td className="px-3 py-2.5">
                    <Link href={`/chart/${p.symbol}`} className="font-semibold text-text-bright hover:text-accent">
                      {p.symbol}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{p.quantity}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(p.avgCost, p.currency)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{p.price ? formatPrice(p.price, p.currency) : "…"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(p.value, p.currency)}</td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", toneClass(p.dayPnl))}>
                    {formatPrice(p.dayPnl, p.currency)}
                  </td>
                  <td className={cn("px-3 py-2.5 text-right tabular-nums", toneClass(p.pnl))}>
                    {formatPrice(p.pnl, p.currency)} <span className="text-xs">({formatPercent(p.pnlPct)})</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-text-muted">
                    {totals.value > 0 ? `${((p.value / totals.value) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Lots / transactions */}
      {hydrated && lots.length > 0 && (
        <div className="card">
          <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-text-bright">
            Transactions
          </h2>
          <ul className="divide-y divide-border">
            {lots.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-text-bright">{l.symbol}</span>
                  <span className="text-text-muted">
                    {l.quantity} @ {formatPrice(l.costBasis, currencyForSymbol(l.symbol))}
                  </span>
                </div>
                <button
                  onClick={() => removeLot(l.id)}
                  className="text-text-muted transition-colors hover:text-down"
                  aria-label="Remove lot"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function toneClass(n: number): string {
  return n > 0 ? "text-up" : n < 0 ? "text-down" : "text-text-muted";
}

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: number;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold tabular-nums", tone !== undefined && toneClass(tone))}>
        {value}
      </div>
      {sub && <div className={cn("text-xs tabular-nums", tone !== undefined && toneClass(tone))}>{sub}</div>}
    </div>
  );
}

function AddPositionForm({
  onAdd,
}: {
  onAdd: (lot: { symbol: string; quantity: number; costBasis: number }) => void;
}) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    const cost = Number(costBasis);
    if (!symbol.trim() || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(cost) || cost <= 0) return;
    onAdd({ symbol: symbol.trim().toUpperCase(), quantity: qty, costBasis: cost });
    setSymbol("");
    setQuantity("");
    setCostBasis("");
  }

  return (
    <form onSubmit={submit} className="card flex flex-wrap items-end gap-3 p-4">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Symbol</span>
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" className="input w-28" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Quantity</span>
        <input
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="10"
          className="input w-28"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Cost / share</span>
        <input
          type="number"
          step="any"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="150.00"
          className="input w-32"
        />
      </label>
      <button type="submit" className="btn-accent">
        <Plus className="h-4 w-4" />
        Add position
      </button>
    </form>
  );
}
