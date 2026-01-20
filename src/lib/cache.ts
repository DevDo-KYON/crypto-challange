import type { Coin, CoinDetail } from "./types";
import { logError } from "./utils";

const COINS_CACHE_KEY = "cryptoquick_coins_cache";

export function saveCoinsToCache(coins: Coin[]): void {
  if (typeof window === "undefined") return;
  
  try {
    // Preserve existing descriptions from cache
    const existingCoins = getCachedCoins();
    if (existingCoins) {
      // Create a map of existing coin descriptions
      const descriptionMap = new Map<string, string>();
      existingCoins.forEach(coin => {
        if (coin.description) {
          descriptionMap.set(coin.id, coin.description);
        }
      });
      
      // Merge descriptions into new coins if they don't have one
      const coinsWithDescriptions = coins.map(coin => ({
        ...coin,
        description: coin.description || descriptionMap.get(coin.id) || undefined,
      }));
      
      localStorage.setItem(COINS_CACHE_KEY, JSON.stringify(coinsWithDescriptions));
    } else {
      // No existing cache, just save the new coins
      localStorage.setItem(COINS_CACHE_KEY, JSON.stringify(coins));
    }
  } catch (error) {
    logError("Error saving coins to cache:", error);
  }
}

export function getCachedCoins(): Coin[] | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(COINS_CACHE_KEY);
    if (!stored) return null;
    
    const coins = JSON.parse(stored) as Coin[];
    return Array.isArray(coins) && coins.length > 0 ? coins : null;
  } catch (error) {
    logError("Error reading cached coins:", error);
    return null;
  }
}

export function updateCoinDescriptionInCache(coinDetail: CoinDetail): void {
  if (typeof window === "undefined") return;
  
  try {
    const coinId = coinDetail.id;
    const description = coinDetail.description.en;
    
    // Skip if no description available
    if (!description) return;
    
    let coins = getCachedCoins();
    
    // If no cache exists or coin not in cache, create/add it
    if (!coins || !coins.find(c => c.id === coinId)) {
      // Create coin from coinDetail
      const newCoin: Coin = {
        id: coinDetail.id,
        name: coinDetail.name,
        symbol: coinDetail.symbol.toUpperCase(),
        current_price: coinDetail.market_data.current_price.usd,
        price_change_percentage_24h: coinDetail.market_data.price_change_percentage_24h,
        image: coinDetail.image.large,
        market_cap: coinDetail.market_data.market_cap.usd,
        description: description,
      };
      
      coins = coins ? [...coins, newCoin] : [newCoin];
    } else {
      // Update existing coin's description
      coins = coins.map(coin => 
        coin.id === coinId 
          ? { ...coin, description }
          : coin
      );
    }
    
    localStorage.setItem(COINS_CACHE_KEY, JSON.stringify(coins));
  } catch (error) {
    logError("Error updating coin description in cache:", error);
  }
}

export function getCachedCoinDetail(coinId: string): CoinDetail | null {
  if (typeof window === "undefined") return null;
  
  try {
    // Get from coin list cache
    const coins = getCachedCoins();
    if (!coins) return null;
    
    const coin = coins.find(c => c.id === coinId);
    if (!coin) return null;
    
    // Create CoinDetail from Coin data (with description if available)
    const coinDetail: CoinDetail = {
      id: coin.id,
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      image: {
        thumb: coin.image,
        small: coin.image,
        large: coin.image,
      },
      description: {
        en: coin.description || "", // Use cached description if available
      },
      market_data: {
        current_price: {
          usd: coin.current_price,
        },
        market_cap: {
          usd: coin.market_cap,
        },
        market_cap_rank: 0, // Not available in Coin type
        price_change_percentage_24h: coin.price_change_percentage_24h,
      },
    };
    
    return coinDetail;
  } catch (error) {
    logError("Error reading cached coin detail:", error);
    return null;
  }
}
