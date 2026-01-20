"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";
import { CoinGeckoError } from "@/lib/api";
import { getCachedCoinDetail } from "@/lib/cache";
import { CoinDetailContent } from "@/components/CoinDetailContent";
import { formatTimeUntilReset } from "@/lib/formatters";
import { logError } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { CoinDetail } from "@/lib/types";

interface ErrorProps {
  error: Error & { digest?: string; statusCode?: number; rateLimitReset?: number };
  reset: () => void;
}

// Helper function to safely extract rateLimitReset
function getRateLimitReset(error: ErrorProps["error"]): number | undefined {
  if (error instanceof CoinGeckoError) {
    return error.rateLimitReset;
  }
  if ("rateLimitReset" in error && typeof error.rateLimitReset === "number") {
    return error.rateLimitReset;
  }
  return undefined;
}

// Helper function to safely check if it's a rate limit error
function checkIsRateLimit(error: ErrorProps["error"]): boolean {
  if (error instanceof CoinGeckoError) {
    return error.statusCode === 429;
  }
  if ("statusCode" in error && typeof error.statusCode === "number" && error.statusCode === 429) {
    return true;
  }
  return error.message?.toLowerCase().includes("rate limit") ?? false;
}

export default function Error({ error, reset }: ErrorProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");
  const pathname = usePathname();
  const coinId = pathname?.split("/").pop() || "";

  // Check cache synchronously on first render to avoid flash of error
  const cachedCoin = useMemo(() => {
    if (coinId && typeof window !== "undefined") {
      return getCachedCoinDetail(coinId);
    }
    return null;
  }, [coinId]);

  useEffect(() => {
    logError("Coin detail error:", error);
  }, [error]);

  // Extract rate limit reset time safely
  const resetTime = useMemo(() => getRateLimitReset(error), [error]);
  const isRateLimit = useMemo(() => checkIsRateLimit(error), [error]);

  useEffect(() => {
    if (resetTime) {
      const updateTime = () => {
        setTimeUntilReset(formatTimeUntilReset(resetTime));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [resetTime]);

  // If we have cached data, show it with warning
  if (cachedCoin) {
    return <CoinDetailContent coin={cachedCoin} coinId={coinId} isCached={true} />;
  }

  return (
    <main className="container mx-auto px-4 pb-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Back to list
          </Button>
        </Link>
      </div>

      <Alert variant="destructive">
        <AlertTitle className="text-lg font-semibold">
          {isRateLimit ? "API Rate Limit Exceeded" : "Error Loading Coin Details"}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            {isRateLimit
              ? "The CoinGecko API rate limit has been exceeded. This happens when too many requests are made in a short period."
              : "Something went wrong while loading the coin details. Please try again."}
          </p>

          {isRateLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {timeUntilReset
                  ? `You can try again ${timeUntilReset}.`
                  : resetTime
                    ? `You can try again ${formatTimeUntilReset(resetTime)}.`
                    : "Please wait a moment before trying again."}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={reset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Coin List
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </main>
  );
}
