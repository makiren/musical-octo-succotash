"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { serverBackedStorage } from "./server-storage";

export interface Lot {
  id: string;
  symbol: string;
  quantity: number;
  costBasis: number; // per-share purchase price
  openedAt: number; // unix seconds
}

interface PortfolioState {
  lots: Lot[];
  addLot: (lot: Omit<Lot, "id" | "openedAt">) => void;
  removeLot: (id: string) => void;
  clear: () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const usePortfolio = create<PortfolioState>()(
  persist(
    (set, get) => ({
      lots: [],
      addLot: (lot) =>
        set({
          lots: [
            ...get().lots,
            { ...lot, symbol: lot.symbol.toUpperCase(), id: uid(), openedAt: Math.floor(Date.now() / 1000) },
          ],
        }),
      removeLot: (id) => set({ lots: get().lots.filter((l) => l.id !== id) }),
      clear: () => set({ lots: [] }),
    }),
    { name: "tad-portfolio", storage: serverBackedStorage },
  ),
);
