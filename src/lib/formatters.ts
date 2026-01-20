/**
 * Formatting utility functions for displaying cryptocurrency data
 */

/**
 * Formats a price value as USD currency
 * @param price - The price value to format
 * @returns Formatted price string (e.g., "$1,234.56" or "$0.000123" for very small values)
 */
export function formatPrice(price: number): string {
  if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a percentage change value
 * @param change - The percentage change value
 * @returns Formatted change string with sign (e.g., "+5.23%" or "-2.45%")
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Formats a market cap value in abbreviated form (T, B, M)
 * @param marketCap - The market cap value
 * @returns Formatted market cap string (e.g., "$1.23T", "$456.78B", "$789.12M")
 */
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return formatPrice(marketCap);
}

/**
 * Formats the time until rate limit reset
 * @param resetTime - Timestamp when rate limit resets (in milliseconds)
 * @returns Formatted time string (e.g., "in 5 minutes", "in 30 seconds", "now", or empty string)
 */
export function formatTimeUntilReset(resetTime?: number): string {
  if (!resetTime) return "";

  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) return "now";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  return `in ${seconds} second${seconds !== 1 ? "s" : ""}`;
}
