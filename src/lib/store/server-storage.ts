"use client";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Storage backend for persisted stores. The server (a JSON file on disk) is the
 * source of truth so data survives server restarts and is independent of any
 * single browser. localStorage is kept as a synchronous cache and offline
 * fallback: reads prefer the server but fall back to the cache, and writes go
 * to both.
 */
const hybridStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const res = await fetch(`/api/state/${name}`, { cache: "no-store" });
      if (res.ok) {
        const text = await res.text();
        if (text && text !== "null") {
          try {
            localStorage.setItem(name, text);
          } catch {
            /* ignore quota / unavailable */
          }
          return text;
        }
      }
    } catch {
      /* server unreachable — fall back to the local cache */
    }
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* ignore */
    }
    try {
      await fetch(`/api/state/${name}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: value,
      });
    } catch {
      /* server unreachable — local cache still holds the value */
    }
  },
  removeItem: async (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
    try {
      await fetch(`/api/state/${name}`, { method: "DELETE" });
    } catch {
      /* ignore */
    }
  },
};

export const serverBackedStorage = createJSONStorage(() => hybridStorage);
