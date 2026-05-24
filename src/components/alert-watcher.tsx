"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAlerts } from "@/lib/store/alerts";
import { useToast } from "@/lib/store/toast";
import { Toaster } from "./toaster";
import { formatPrice } from "@/lib/utils";

/**
 * Mounted once at the app root. Polls quotes for every symbol that has an
 * active (untriggered) alert and fires a toast when a threshold is crossed.
 */
export function AlertWatcher() {
  const alerts = useAlerts((s) => s.alerts);
  const evaluate = useAlerts((s) => s.evaluate);
  const push = useToast((s) => s.push);

  const symbols = Array.from(
    new Set(alerts.filter((a) => !a.triggeredAt).map((a) => a.symbol)),
  ).sort();

  const { data: quotes } = useQuery({
    queryKey: ["alert-quotes", symbols.join(",")],
    queryFn: () => api.quotes(symbols),
    enabled: symbols.length > 0,
    refetchInterval: 20_000,
  });

  useEffect(() => {
    if (!quotes) return;
    const prices: Record<string, number> = {};
    for (const [sym, q] of Object.entries(quotes)) prices[sym] = q.current;
    const triggered = evaluate(prices);
    for (const a of triggered) {
      push({
        variant: "warning",
        title: `Alert: ${a.symbol} ${a.condition} ${formatPrice(a.target)}`,
        description: `Now trading at ${formatPrice(prices[a.symbol])}.`,
      });
    }
  }, [quotes, evaluate, push]);

  return <Toaster />;
}
