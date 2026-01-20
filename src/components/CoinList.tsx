"use client";

import { useState, useEffect } from "react";
import { CoinCard } from "./CoinCard";
import { SearchBar } from "./SearchBar";
import { fetchCoins, CoinGeckoError } from "@/lib/api";
import { useWatchlist } from "@/hooks/useWatchlist";
import { saveCoinsToCache, getCachedCoins } from "@/lib/cache";
import type { Coin } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeUntilReset } from "@/lib/formatters";

export function CoinList() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<CoinGeckoError | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const [isShowingCached, setIsShowingCached] = useState(false);
  const { watchlist, isHydrated } = useWatchlist();

  useEffect(() => {
    loadCoins();
  }, []);

  useEffect(() => {
    let filtered = coins;

    // Apply favorites filter
    if (showFavoritesOnly && isHydrated) {
      filtered = filtered.filter((coin) => watchlist.includes(coin.id));
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(query) ||
          coin.symbol.toLowerCase().includes(query)
      );
    }

    setFilteredCoins(filtered);
  }, [searchQuery, coins, showFavoritesOnly, watchlist, isHydrated]);

  async function loadCoins() {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setIsShowingCached(false);

    try {
      const data = await fetchCoins();
      setCoins(data);
      setFilteredCoins(data);
      // Always save to cache after successful fetch
      saveCoinsToCache(data);
    } catch (err) {
      if (err instanceof CoinGeckoError) {
        setErrorDetails(err);

        // Try to load from cache if API fails
        const cachedCoins = getCachedCoins();
        if (cachedCoins && cachedCoins.length > 0) {
          setCoins(cachedCoins);
          setFilteredCoins(cachedCoins);
          setIsShowingCached(true);
          // Don't show error if we have cached data
          setError(null);
        } else {
          // No cache available, show error
          setError(err.message);
        }
      } else {
        setError("Failed to load coins. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  const isRateLimit = errorDetails?.statusCode === 429 ||
    error?.toLowerCase().includes("rate limit");
  const resetTime = errorDetails?.rateLimitReset;

  useEffect(() => {
    if (resetTime) {
      const updateTime = () => {
        setTimeUntilReset(formatTimeUntilReset(resetTime));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeUntilReset("");
    }
  }, [resetTime]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 !top-6" />
          <AlertTitle>
            {isRateLimit ? "API Rate Limit Exceeded" : "Error"}
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            {isRateLimit && resetTime && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {timeUntilReset
                    ? `You can try again ${timeUntilReset}.`
                    : "Please wait a moment before trying again."}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadCoins}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isShowingCached && (
        <Alert variant="warning">
          <AlertTitle>Showing cached data</AlertTitle>
          <AlertDescription>
            Unable to fetch fresh data due to API rate limits. Showing previously saved data.
          </AlertDescription>
        </Alert>
      )}

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
      />

      {filteredCoins.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {showFavoritesOnly
              ? "No favorite coins found."
              : `No coins found matching "${searchQuery}"`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCoins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      )}
    </div>
  );
}
