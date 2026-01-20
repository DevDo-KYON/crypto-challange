"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WatchlistButton } from "@/components/WatchlistButton";
import { NavigationButton } from "@/components/NavigationButton";
import { updateCoinDescriptionInCache } from "@/lib/cache";
import { getAdjacentCoins } from "@/lib/navigation";
import { formatPrice, formatChange, formatMarketCap } from "@/lib/formatters";
import type { CoinDetail, Coin } from "@/lib/types";

interface CoinDetailContentProps {
  coin: CoinDetail;
  coinId: string;
  isCached?: boolean;
}

export function CoinDetailContent({ coin, coinId, isCached = false }: CoinDetailContentProps) {
  const [adjacentCoins, setAdjacentCoins] = useState<{
    previous: (Coin & { rank: number }) | null;
    next: (Coin & { rank: number }) | null;
  }>({ previous: null, next: null });
  const [loadingNavigation, setLoadingNavigation] = useState(true);

  // Save description to cache when we have fresh data (not cached)
  useEffect(() => {
    if (!isCached && coin.description.en) {
      updateCoinDescriptionInCache(coin);
    }
  }, [coin, isCached]);

  // Load adjacent coins for navigation
  useEffect(() => {
    async function loadAdjacentCoins() {
      setLoadingNavigation(true);
      try {
        const adjacent = await getAdjacentCoins(coinId);
        setAdjacentCoins(adjacent);
      } catch (error) {
        // If fails, set both to null
        setAdjacentCoins({ previous: null, next: null });
      } finally {
        setLoadingNavigation(false);
      }
    }

    loadAdjacentCoins();
  }, [coinId]);

  const isPositive = coin.market_data.price_change_percentage_24h >= 0;
  const rawDescription = coin.description.en || "No description available.";

  // Convert plain text with line breaks to HTML paragraphs
  const description = rawDescription.includes("<")
    ? rawDescription
    : rawDescription
        .split(/\n\s*\n/)
        .filter((para) => para.trim())
        .map((para) => `<p>${para.trim().replace(/\n/g, " ")}</p>`)
        .join("");

  return (
    <main className="container mx-auto px-4 pb-8 max-w-4xl">
      {isCached && (
        <Alert variant="warning" className="mb-6">
          <AlertTitle>Showing cached data</AlertTitle>
          <AlertDescription>
            Unable to fetch fresh data due to API rate limits. Showing previously saved data. Some information may be outdated.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <Image
                  src={coin.image.large}
                  alt={coin.name}
                  fill
                  className="rounded-full"
                  sizes="64px"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <CardTitle className="text-3xl">{coin.name}</CardTitle>
                  <WatchlistButton coinId={coin.id} className="[&>svg]:h-5 [&>svg]:w-5" />
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm">
                    {coin.symbol.toUpperCase()}
                  </Badge>
                  {coin.market_data.market_cap_rank && (
                    <Badge variant="outline" className="text-sm">
                      Rank #{coin.market_data.market_cap_rank}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">
                <List className="h-4 w-4 mr-1" />
                Back to list
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Current Price
              </h3>
              <p className="text-2xl font-bold">
                {formatPrice(coin.market_data.current_price.usd)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                24h Change
              </h3>
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className="text-lg"
              >
                {formatChange(coin.market_data.price_change_percentage_24h)}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Market Cap
              </h3>
              <p className="text-xl font-semibold">
                {formatMarketCap(coin.market_data.market_cap.usd)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            {rawDescription !== "No description available." ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unable to fetch description</AlertTitle>
                <AlertDescription>
                  Due to API rate limits, we cannot retrieve the description at this time. Please try again later.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {(adjacentCoins.previous || adjacentCoins.next) && (
        <div className="flex items-center justify-between gap-4 mt-6">
          {adjacentCoins.previous ? (
            <NavigationButton
              coin={adjacentCoins.previous}
              direction="previous"
              disabled={loadingNavigation}
            />
          ) : (
            <div /> // Placeholder to maintain spacing
          )}
          {adjacentCoins.next ? (
            <NavigationButton
              coin={adjacentCoins.next}
              direction="next"
              disabled={loadingNavigation}
            />
          ) : (
            <div /> // Placeholder to maintain spacing
          )}
        </div>
      )}
    </main>
  );
}
