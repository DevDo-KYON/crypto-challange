"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "./WatchlistButton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";
import { formatPrice, formatChange } from "@/lib/formatters";
import type { Coin } from "@/lib/types";

interface CoinCardProps {
  coin: Coin;
}

export function CoinCard({ coin }: CoinCardProps) {
  const { isInWatchlist, isHydrated } = useWatchlist();
  const isWatched = isHydrated && isInWatchlist(coin.id);
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <Link href={`/coin/${coin.id}`}>
      <Card
        className={cn(
          "transition-all hover:shadow-md cursor-pointer",
          isWatched && "ring-2 ring-yellow-500/50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={coin.image}
                  alt={coin.name}
                  fill
                  className="rounded-full"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">
                    {coin.name}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {coin.symbol}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">
                    {formatPrice(coin.current_price)}
                  </span>
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {formatChange(coin.price_change_percentage_24h)}
                  </Badge>
                </div>
              </div>
            </div>
            <WatchlistButton coinId={coin.id} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
