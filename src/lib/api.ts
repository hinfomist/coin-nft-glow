const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Cache configuration
const CACHE_DURATION = 60000; // 60 seconds
const cache = new Map<string, { data: any; timestamp: number }>();

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
}

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithCache(url: string, options: RequestInit = {}, retryOptions: RetryOptions = {}): Promise<any> {
  // Check cache first
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const { maxRetries = MAX_RETRIES, delay: retryDelay = RETRY_DELAY } = retryOptions;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        const data = await response.json();

        // Cache the result
        cache.set(url, { data, timestamp: Date.now() });

        return data;
      }

      // If not a server error (5xx) or rate limit (429), don't retry
      if (response.status < 500 && response.status !== 429) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      lastError = new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors or API errors
      if (error instanceof APIError && error.status && error.status < 500 && error.status !== 429) {
        throw error;
      }
    }

    if (attempt < maxRetries) {
      console.warn(`API request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${retryDelay}ms...`, lastError.message);
      await delay(retryDelay);
    }
  }

  throw lastError;
}

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  price: number;
  change24h: number;
  marketCap: number;
}

export interface NFTData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  description: string;
  floorPrice: number;
  floorPriceChange24h: number;
  volume24h: number;
  uniqueAddresses: number;
  uniqueAddressesChange24h: number;
  links: {
    homepage?: string;
    twitter?: string;
    discord?: string;
  };
}

export interface PortfolioPriceData {
  price: number;
  change24h: number;
  name: string;
  symbol: string;
  image: string;
}

const COIN_EMOJIS: Record<string, string> = {
  bitcoin: "₿",
  ethereum: "Ξ",
  solana: "◎",
  dogecoin: "Ð",
  cardano: "₳",
};

export const apiService = {
  async fetchCryptoPrices(coins: string[]): Promise<CryptoData[]> {
    const ids = coins.join(",");
    const priceData = await fetchWithCache(
      `${API_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
    );

    const coinsData = await fetchWithCache(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}`
    );

    return coinsData.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      emoji: COIN_EMOJIS[coin.id] || "🪙",
      price: priceData[coin.id]?.usd || 0,
      change24h: priceData[coin.id]?.usd_24h_change || 0,
      marketCap: priceData[coin.id]?.usd_market_cap || 0,
    }));
  },

  async fetchTopCryptos(limit: number = 50): Promise<CryptoData[]> {
    const data = await fetchWithCache(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );

    return data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      emoji: COIN_EMOJIS[coin.id] || "🪙",
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap,
    }));
  },

  async fetchNFTData(nftId: string): Promise<NFTData> {
    const data = await fetchWithCache(`${API_BASE_URL}/nfts/${nftId}`);

    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol || "",
      image: data.image?.small || "",
      description: data.description || "",
      floorPrice: data.floor_price?.usd || 0,
      floorPriceChange24h: data.floor_price_in_usd_24h_percentage_change || 0,
      volume24h: data.volume_24h?.usd || 0,
      uniqueAddresses: data.number_of_unique_addresses || 0,
      uniqueAddressesChange24h: data.number_of_unique_addresses_24h_percentage_change || 0,
      links: {
        homepage: data.links?.homepage || "",
        twitter: data.links?.twitter || "",
        discord: data.links?.discord || "",
      },
    };
  },

  async fetchPortfolioPrice(coinId: string): Promise<PortfolioPriceData> {
    const priceData = await fetchWithCache(
      `${API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );

    const coinData = await fetchWithCache(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${coinId}`
    );

    return {
      price: priceData[coinId]?.usd || 0,
      change24h: priceData[coinId]?.usd_24h_change || 0,
      name: coinData[0]?.name || coinId,
      symbol: coinData[0]?.symbol || coinId,
      image: coinData[0]?.image || "",
    };
  },
};
