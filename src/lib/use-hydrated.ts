"use client";
import { useEffect, useState } from "react";

/**
 * Returns true after the first client render. Persisted zustand stores read
 * from localStorage, so components that branch on their values must wait for
 * hydration to avoid server/client markup mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
