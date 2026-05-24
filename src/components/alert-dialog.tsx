"use client";
import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useAlerts, type AlertCondition } from "@/lib/store/alerts";
import { useToast } from "@/lib/store/toast";
import { cn } from "@/lib/utils";

export function AddAlertButton({
  symbol,
  currentPrice,
  className,
}: {
  symbol: string;
  currentPrice?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<AlertCondition>("above");
  const [target, setTarget] = useState("");
  const add = useAlerts((s) => s.add);
  const push = useToast((s) => s.push);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(target);
    if (!Number.isFinite(value) || value <= 0) return;
    add({ symbol, condition, target: value });
    push({
      variant: "success",
      title: "Alert created",
      description: `${symbol} ${condition} $${value}`,
    });
    setOpen(false);
    setTarget("");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn("btn-ghost border border-border", className)}>
        <Bell className="h-4 w-4" />
        Alert
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-bright">New price alert</h3>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              {symbol}
              {currentPrice !== undefined && ` · currently $${currentPrice.toFixed(2)}`}
            </p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="flex gap-2">
                {(["above", "below"] as AlertCondition[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={cn(
                      "flex-1 rounded-md border py-2 text-sm font-medium capitalize transition-colors",
                      condition === c
                        ? "border-accent bg-accent/10 text-text-bright"
                        : "border-border text-text-muted hover:bg-bg-hover",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="any"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Target price"
                autoFocus
                className="input w-full"
              />
              <button type="submit" className="btn-accent w-full">
                Create alert
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
