import type { Coin, CoinDetail, CoinMarketData } from "./types";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export class CoinGeckoError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public rateLimitReset?: number
  ) {
    super(message);
    this.name = "CoinGeckoError";
  }
}

async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });

    // Handle rate limiting FIRST - before checking response.ok
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const resetTime = retryAfter
        ? Date.now() + parseInt(retryAfter) * 1000
        : undefined;
      throw new CoinGeckoError(
        "API rate limit exceeded. Please try again later.",
        429,
        resetTime
      );
    }

    // Handle other HTTP errors
    if (!response.ok) {
      // Check if it might be a rate limit issue even if status is not 429
      if (response.status === 403 || response.status === 503) {
        throw new CoinGeckoError(
          "API rate limit exceeded or service unavailable. Please try again later.",
          response.status
        );
      }
      throw new CoinGeckoError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof CoinGeckoError) {
      throw error;
    }

    // Handle AbortError (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      // Timeout might indicate rate limiting
      throw new CoinGeckoError(
        "Request timeout. The API might be rate limiting. Please wait a moment and try again."
      );
    }

    // Handle network errors - but check if it might be rate limiting
    if (error instanceof TypeError) {
      if (
        error.message.includes("fetch") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        // Network errors can sometimes occur when rate limited
        // Provide a more helpful message
        throw new CoinGeckoError(
          "Network error. This might be due to API rate limiting. Wait a 60 seconds until the rate limit resets and try again."
        );
      }
    }

    // Re-throw unknown errors
    throw new CoinGeckoError(
      error instanceof Error ? error.message : "An unknown error occurred"
    );
  }
}

export async function fetchCoins(): Promise<Coin[]> {
  const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`;

  const data = await fetchWithErrorHandling<CoinMarketData[]>(url);

  // Transform API response to our Coin type
  return data.map((coin) => ({
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    current_price: coin.current_price,
    price_change_percentage_24h: coin.price_change_percentage_24h,
    image: coin.image,
    market_cap: coin.market_cap,
  }));
}

export async function fetchCoinDetail(id: string): Promise<CoinDetail> {
  const url = `${COINGECKO_API_BASE}/coins/${id}`;

  const data = await fetchWithErrorHandling<CoinDetail>(url);

  return data;
}
