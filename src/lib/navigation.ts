import type { Coin } from "./types";
import { getCachedCoins } from "./cache";
import { fetchCoins } from "./api";

/**
 * Gets adjacent coins (previous and next) for navigation with their ranks
 * @param currentCoinId - The ID of the current coin
 * @returns Object with previous and next coin with their ranks, or null if not found
 */
export async function getAdjacentCoins(
    currentCoinId: string
): Promise<{
    previous: (Coin & { rank: number }) | null;
    next: (Coin & { rank: number }) | null;
}> {
    // Try to get coin list from cache first
    let coinList = getCachedCoins();

    // If no cache, try to fetch from API
    if (!coinList || coinList.length === 0) {
        try {
            coinList = await fetchCoins();
        } catch (error) {
            // If API fails, return null for both
            return { previous: null, next: null };
        }
    }

    if (!coinList || coinList.length === 0) {
        return { previous: null, next: null };
    }

    // Find current coin index
    const currentIndex = coinList.findIndex((coin) => coin.id === currentCoinId);

    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    // Get previous and next coins with their ranks (index + 1)
    const previous =
        currentIndex > 0
            ? { ...coinList[currentIndex - 1], rank: currentIndex }
            : null;
    const next =
        currentIndex < coinList.length - 1
            ? { ...coinList[currentIndex + 1], rank: currentIndex + 2 }
            : null;

    return { previous, next };
}
