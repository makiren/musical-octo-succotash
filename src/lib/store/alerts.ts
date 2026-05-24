"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverBackedStorage } from "./server-storage";

export type AlertCondition = "above" | "below";

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  target: number;
  createdAt: number;
  triggeredAt: number | null;
}

interface AlertState {
  alerts: PriceAlert[];
  add: (input: { symbol: string; condition: AlertCondition; target: number }) => void;
  remove: (id: string) => void;
  /** Evaluate alerts against the latest prices; marks crossed ones triggered. */
  evaluate: (prices: Record<string, number>) => PriceAlert[];
  clearTriggered: () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAlerts = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      add: ({ symbol, condition, target }) =>
        set({
          alerts: [
            ...get().alerts,
            {
              id: uid(),
              symbol: symbol.toUpperCase(),
              condition,
              target,
              createdAt: Math.floor(Date.now() / 1000),
              triggeredAt: null,
            },
          ],
        }),
      remove: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
      evaluate: (prices) => {
        const now = Math.floor(Date.now() / 1000);
        const newlyTriggered: PriceAlert[] = [];
        const next = get().alerts.map((a) => {
          if (a.triggeredAt) return a;
          const price = prices[a.symbol];
          if (price === undefined) return a;
          const crossed =
            (a.condition === "above" && price >= a.target) ||
            (a.condition === "below" && price <= a.target);
          if (crossed) {
            const triggered = { ...a, triggeredAt: now };
            newlyTriggered.push(triggered);
            return triggered;
          }
          return a;
        });
        if (newlyTriggered.length) set({ alerts: next });
        return newlyTriggered;
      },
      clearTriggered: () => set({ alerts: get().alerts.filter((a) => !a.triggeredAt) }),
    }),
    { name: "tad-alerts", storage: serverBackedStorage },
  ),
);
