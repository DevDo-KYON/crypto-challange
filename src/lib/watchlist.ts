import { logError } from "./utils";

export const WATCHLIST_STORAGE_KEY = "cryptoquick_watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logError("Error reading watchlist from localStorage:", error);
    return [];
  }
}

export function addToWatchlist(coinId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const watchlist = getWatchlist();
    if (!watchlist.includes(coinId)) {
      const updated = [...watchlist, coinId];
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event("watchlist-changed"));
    }
  } catch (error) {
    logError("Error adding to watchlist:", error);
  }
}

export function removeFromWatchlist(coinId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const watchlist = getWatchlist();
    const updated = watchlist.filter((id) => id !== coinId);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("watchlist-changed"));
  } catch (error) {
    logError("Error removing from watchlist:", error);
  }
}

export function isInWatchlist(coinId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const watchlist = getWatchlist();
  return watchlist.includes(coinId);
}

export function toggleWatchlist(coinId: string): void {
  if (isInWatchlist(coinId)) {
    removeFromWatchlist(coinId);
  } else {
    addToWatchlist(coinId);
  }
}
