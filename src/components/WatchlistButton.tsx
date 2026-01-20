"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  coinId: string;
  className?: string;
}

export function WatchlistButton({ coinId, className }: WatchlistButtonProps) {
  const { isInWatchlist, toggleCoin, isHydrated } = useWatchlist();
  const isWatched = isInWatchlist(coinId);

  if (!isHydrated) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("opacity-50", className)}
        disabled
        aria-label="Loading watchlist"
      >
        <Star className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleCoin(coinId);
      }}
      className={cn(
        "transition-colors",
        isWatched && "text-yellow-500 hover:text-yellow-600",
        className
      )}
      aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-all",
          isWatched && "fill-current"
        )}
      />
    </Button>
  );
}
