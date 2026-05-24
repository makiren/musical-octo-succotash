"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverBackedStorage } from "./server-storage";

function defaultSymbols(): string[] {
  const env = process.env.NEXT_PUBLIC_DEFAULT_WATCHLIST;
  if (env) return env.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  return ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL"];
}

interface WatchlistState {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
  has: (symbol: string) => boolean;
  reorder: (symbols: string[]) => void;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: defaultSymbols(),
      add: (symbol) => {
        const s = symbol.toUpperCase();
        if (get().symbols.includes(s)) return;
        set({ symbols: [...get().symbols, s] });
      },
      remove: (symbol) =>
        set({ symbols: get().symbols.filter((s) => s !== symbol.toUpperCase()) }),
      toggle: (symbol) => {
        const s = symbol.toUpperCase();
        get().has(s) ? get().remove(s) : get().add(s);
      },
      has: (symbol) => get().symbols.includes(symbol.toUpperCase()),
      reorder: (symbols) => set({ symbols }),
    }),
    { name: "tad-watchlist", storage: serverBackedStorage },
  ),
);
