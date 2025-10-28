import { useState, useEffect, useCallback } from "react";
import { Search, Moon, Sun, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CryptoTickerTable } from "@/components/CryptoTickerTable";
import { NFTTable } from "@/components/NFTTable";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COIN_EMOJIS: Record<string, string> = {
  bitcoin: "₿",
  ethereum: "Ξ",
  solana: "◎",
  dogecoin: "Ð",
  cardano: "₳",
};

const DEFAULT_COINS = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface NFTData {
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

const Index = () => {
  const [mode, setMode] = useState<"crypto" | "nft">("crypto");
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchCryptoData = useCallback(async (coins: string[]) => {
    setIsLoading(true);
    try {
      const ids = coins.join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`
      );
      
      if (!response.ok) throw new Error("Failed to fetch crypto data");
      
      const data = await response.json();
      const coinsInfo = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`
      );
      const coinsData = await coinsInfo.json();

      const formattedData: CryptoData[] = coinsData.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        emoji: COIN_EMOJIS[coin.id] || "🪙",
        price: data[coin.id]?.usd || 0,
        change24h: data[coin.id]?.usd_24h_change || 0,
        marketCap: data[coin.id]?.usd_market_cap || 0,
      }));

      setCryptoData(formattedData);
      setLastUpdated(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch crypto data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchNFTData = useCallback(async (nftId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/nfts/${nftId}`
      );
      
      if (!response.ok) {
        throw new Error("NFT not found");
      }
      
      const data = await response.json();

      const formattedData: NFTData = {
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

      setNftData(formattedData);
      setLastUpdated(new Date());
    } catch (error) {
      toast({
        title: "NFT not found",
        description: "Oops, couldn't find that NFT! Try 'bored-ape-yacht-club' 🖼️",
        variant: "destructive",
      });
      setNftData(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinParam = urlParams.get("coin");
    const nftParam = urlParams.get("nft");

    if (nftParam) {
      setMode("nft");
      setSearchQuery(nftParam);
      fetchNFTData(nftParam);
    } else if (coinParam) {
      setMode("crypto");
      fetchCryptoData([coinParam]);
    } else {
      fetchCryptoData(DEFAULT_COINS);
    }
  }, [fetchCryptoData, fetchNFTData]);

  useEffect(() => {
    if (mode === "crypto" && cryptoData.length > 0) {
      const interval = setInterval(() => {
        const coins = cryptoData.map((c) => c.id);
        fetchCryptoData(coins.length ? coins : DEFAULT_COINS);
      }, 30000);
      return () => clearInterval(interval);
    } else if (mode === "nft" && nftData) {
      const interval = setInterval(() => {
        fetchNFTData(nftData.id);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [mode, cryptoData, nftData, fetchCryptoData, fetchNFTData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        if (mode === "crypto") {
          fetchCryptoData([searchQuery.toLowerCase().replace(/\s+/g, "-")]);
        } else {
          fetchNFTData(searchQuery.toLowerCase().replace(/\s+/g, "-"));
        }
      } else if (mode === "crypto") {
        fetchCryptoData(DEFAULT_COINS);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, mode, fetchCryptoData, fetchNFTData]);

  const handleShare = () => {
    const baseUrl = window.location.origin;
    let shareUrl = baseUrl;
    
    if (mode === "crypto" && cryptoData.length === 1) {
      shareUrl += `?coin=${cryptoData[0].id}`;
    } else if (mode === "nft" && nftData) {
      shareUrl += `?nft=${nftData.id}`;
    }

    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share this link to show live prices",
    });
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CryptoFlash
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-2">
            Live {mode === "crypto" ? "Crypto" : "NFT"} Prices
          </h2>
          <p className="text-muted-foreground text-lg">
            Real-time tracking. No ads. No sign-ups. Just data.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "crypto" | "nft")}>
            <TabsList className="grid w-[280px] grid-cols-2">
              <TabsTrigger value="crypto">💰 Crypto</TabsTrigger>
              <TabsTrigger value="nft">🖼️ NFTs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder={
              mode === "crypto"
                ? "Search any crypto (e.g., BTC, ETH, SOL)..."
                : "Search NFT collection (e.g., bored-ape-yacht-club)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-xl"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
          )}
        </div>

        {/* Data Display */}
        <div className="mb-8">
          {mode === "crypto" ? (
            <CryptoTickerTable data={cryptoData} isLoading={isLoading} />
          ) : (
            <NFTTable data={nftData} isLoading={isLoading} />
          )}
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Footer */}
        <footer className="text-center space-y-4 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              CoinGecko
            </a>
          </p>
          <div className="text-xs text-muted-foreground">
            Free forever. Built with ⚡ by crypto enthusiasts.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
