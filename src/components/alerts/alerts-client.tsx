"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, BellRing, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useAlerts, type AlertCondition } from "@/lib/store/alerts";
import { useHydrated } from "@/lib/use-hydrated";
import { PageHeader } from "@/components/page-header";
import { cn, formatPrice, formatRelative } from "@/lib/utils";

export function AlertsClient() {
  const alerts = useAlerts((s) => s.alerts);
  const add = useAlerts((s) => s.add);
  const remove = useAlerts((s) => s.remove);
  const clearTriggered = useAlerts((s) => s.clearTriggered);
  const hydrated = useHydrated();

  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [target, setTarget] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(target);
    if (!symbol.trim() || !Number.isFinite(value) || value <= 0) return;
    add({ symbol: symbol.trim().toUpperCase(), condition, target: value });
    setSymbol("");
    setTarget("");
  }

  const active = hydrated ? alerts.filter((a) => !a.triggeredAt) : [];
  const triggered = hydrated ? alerts.filter((a) => a.triggeredAt) : [];

  return (
    <>
      <PageHeader
        title="Price Alerts"
        subtitle="Alerts are evaluated against live quotes every 20 seconds while the app is open."
      />

      <form onSubmit={submit} className="card flex flex-wrap items-end gap-3 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Symbol</span>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" className="input w-28" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Condition</span>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as AlertCondition)}
            className="input w-28"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Target price</span>
          <input
            type="number"
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="200.00"
            className="input w-32"
          />
        </label>
        <button type="submit" className="btn-accent">
          <Plus className="h-4 w-4" />
          Add alert
        </button>
      </form>

      <section className="card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Bell className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-bright">Active ({active.length})</h2>
        </div>
        {active.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">No active alerts.</p>
        ) : (
          <ul className="divide-y divide-border">
            {active.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {a.condition === "above" ? (
                    <ArrowUp className="h-4 w-4 text-up" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-down" />
                  )}
                  <div>
                    <Link href={`/chart/${a.symbol}`} className="font-semibold text-text-bright hover:text-accent">
                      {a.symbol}
                    </Link>
                    <span className="ml-2 text-sm text-text-muted">
                      crosses {a.condition} {formatPrice(a.target)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="text-text-muted transition-colors hover:text-down"
                  aria-label="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {triggered.length > 0 && (
        <section className="card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-text-bright">Triggered ({triggered.length})</h2>
            </div>
            <button onClick={clearTriggered} className="text-xs text-accent hover:underline">
              Clear all
            </button>
          </div>
          <ul className="divide-y divide-border">
            {triggered.map((a) => (
              <li
                key={a.id}
                className={cn("flex items-center justify-between px-4 py-3", "opacity-80")}
              >
                <div>
                  <Link href={`/chart/${a.symbol}`} className="font-semibold text-text-bright hover:text-accent">
                    {a.symbol}
                  </Link>
                  <span className="ml-2 text-sm text-text-muted">
                    {a.condition} {formatPrice(a.target)} · triggered {a.triggeredAt && formatRelative(a.triggeredAt)}
                  </span>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="text-text-muted transition-colors hover:text-down"
                  aria-label="Delete alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
