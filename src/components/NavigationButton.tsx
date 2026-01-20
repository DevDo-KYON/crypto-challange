"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Coin } from "@/lib/types";

interface NavigationButtonProps {
  coin: (Coin & { rank: number }) | null;
  direction: "previous" | "next";
  disabled?: boolean;
}

export function NavigationButton({
  coin,
  direction,
  disabled = false,
}: NavigationButtonProps) {
  const isPrevious = direction === "previous";
  const isDisabled = disabled || !coin;

  if (isDisabled) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(
          "flex items-center gap-2 h-auto py-2 px-3 opacity-50 cursor-not-allowed",
          isPrevious ? "flex-row" : "flex-row"
        )}
      >
        {isPrevious ? (
          <>
            <ChevronLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted" />
              <span className="text-sm font-medium">-</span>
              <span className="text-sm text-muted-foreground">#-</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">#-</span>
              <span className="text-sm font-medium">-</span>
              <div className="w-6 h-6 rounded-full bg-muted" />
            </div>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    );
  }

  const content = isPrevious ? (
    <>
      <ChevronLeft className="h-4 w-4" />
      <div className="flex items-center gap-2">
        <div className="relative w-6 h-6 flex-shrink-0">
          <Image
            src={coin.image}
            alt={coin.name}
            fill
            className="rounded-full"
            sizes="24px"
          />
        </div>
        <span className="text-sm font-medium">{coin.symbol}</span>
        <span className="text-sm text-muted-foreground">#{coin.rank}</span>
      </div>
    </>
  ) : (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">#{coin.rank}</span>
        <span className="text-sm font-medium">{coin.symbol}</span>
        <div className="relative w-6 h-6 flex-shrink-0">
          <Image
            src={coin.image}
            alt={coin.name}
            fill
            className="rounded-full"
            sizes="24px"
          />
        </div>
      </div>
      <ChevronRight className="h-4 w-4" />
    </>
  );

  return (
    <Link href={`/coin/${coin.id}`} className="no-underline">
      <Button
        variant="outline"
        className="flex items-center gap-2 h-auto py-2 px-3 transition-all hover:bg-accent"
      >
        {content}
      </Button>
    </Link>
  );
}
