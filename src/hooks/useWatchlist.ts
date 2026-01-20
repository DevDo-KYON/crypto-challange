"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist as checkIsInWatchlist,
  WATCHLIST_STORAGE_KEY,
} from "@/lib/watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load watchlist from localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWatchlist(getWatchlist());
      setIsHydrated(true);
    }
  }, []);

  // Listen for storage changes to sync across tabs/components
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WATCHLIST_STORAGE_KEY) {
        setWatchlist(getWatchlist());
      }
    };

    // Listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      setWatchlist(getWatchlist());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("watchlist-changed", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("watchlist-changed", handleCustomStorageChange);
    };
  }, [isHydrated]);

  const toggleCoin = useCallback(
    (coinId: string) => {
      if (!isHydrated) return;

      const isInWatchlist = checkIsInWatchlist(coinId);
      if (isInWatchlist) {
        removeFromWatchlist(coinId);
      } else {
        addToWatchlist(coinId);
      }

      // Update state immediately for UI responsiveness
      setWatchlist((prev) => {
        if (isInWatchlist) {
          return prev.filter((id) => id !== coinId);
        } else {
          return [...prev, coinId];
        }
      });
    },
    [isHydrated]
  );

  const checkIsInWatchlistState = useCallback(
    (coinId: string): boolean => {
      if (!isHydrated) return false;
      return watchlist.includes(coinId);
    },
    [watchlist, isHydrated]
  );

  return {
    watchlist,
    isHydrated,
    toggleCoin,
    isInWatchlist: checkIsInWatchlistState,
  };
}
