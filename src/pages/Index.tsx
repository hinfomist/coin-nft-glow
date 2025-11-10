import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CryptoTickerTable } from "@/components/CryptoTickerTable";
import { NFTTable } from "@/components/NFTTable";
import { PortfolioTable } from "@/components/PortfolioTable";
import { AlertModal, type PriceAlert } from "@/components/AlertModal";
import { AlertsTable } from "@/components/AlertsTable";
import { UserProfile } from "@/components/UserProfile";
import { PricingModal } from "@/components/PricingModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { apiService, type CryptoData, type NFTData, type PortfolioPriceData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import emailjs from '@emailjs/browser';

const COIN_EMOJIS: Record<string, string> = {
  bitcoin: "₿",
  ethereum: "Ξ",
  solana: "◎",
  dogecoin: "Ð",
  cardano: "₳",
};

const DEFAULT_COINS = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano"];

const Index = () => {
  const [mode, setMode] = useState<"crypto" | "nft" | "portfolio">("crypto");
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [allCryptoData, setAllCryptoData] = useState<CryptoData[]>([]);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(50); // ✅ CHANGED: Now starts at 50 instead of 10
  const [sortBy, setSortBy] = useState<"market_cap" | "price_change_percentage_24h" | "current_price" | "name">("market_cap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeFilter, setActiveFilter] = useState<"all" | "top10" | "top50" | "gainers" | "losers">("all");
  const { toast } = useToast();
  const { isAuthenticated, user, isPro } = useAuth(); // ✅ ADDED: isPro

  // Load alerts from localStorage
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setAlerts([]);
      return;
    }

    const savedAlerts = localStorage.getItem(`cryptoflash-alerts-${user.id}`);
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed);
      } catch (error) {
        console.error("Failed to parse alerts data:", error);
      }
    } else {
      setAlerts([]);
    }
  }, [isAuthenticated, user]);

  // Save alerts to localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`cryptoflash-alerts-${user.id}`, JSON.stringify(alerts));
    }
  }, [alerts, isAuthenticated, user]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchPriceForPortfolio = useCallback(async (id: string): Promise<PortfolioPriceData> => {
    try {
      return await apiService.fetchPortfolioPrice(id);
    } catch (error) {
      console.error("Failed to fetch portfolio price:", error);
      return { price: 0, change24h: 0, name: id, symbol: id, image: "" };
    }
  }, []);

  const fetchCryptoData = useCallback(async (coins: string[]) => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchCryptoPrices(coins);
      setCryptoData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch crypto data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch crypto data after retries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchNFTData = useCallback(async (nftId: string) => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchNFTData(nftId);
      setNftData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch NFT data:", error);
      toast({
        title: "NFT not found",
        description: "Oops, couldn't find that NFT after retries! Try 'bored-ape-yacht-club' 🖼️",
        variant: "destructive",
      });
      setNftData(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchTopCryptos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.fetchTopCryptos(50);
      setAllCryptoData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch top cryptos:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const coinParam = urlParams.get("coin");
    const nftParam = urlParams.get("nft");
    const tabParam = urlParams.get("tab");

    if (tabParam === "portfolio") {
      setMode("portfolio");
    } else if (nftParam || tabParam === "nft") {
      setMode("nft");
      if (nftParam) {
        setSearchQuery(nftParam);
        fetchNFTData(nftParam);
      }
    } else if (coinParam || tabParam === "crypto") {
      setMode("crypto");
      if (coinParam) {
        fetchCryptoData([coinParam]);
      } else {
        fetchTopCryptos();
      }
    } else {
      fetchTopCryptos();
    }
  }, [fetchCryptoData, fetchNFTData, fetchTopCryptos]);

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

  // ✅ UPDATED: Check if user is Pro before allowing alert creation
  const handleSetAlert = (crypto: CryptoData) => {
    if (!isPro) {
      // Show upgrade prompt for free users
      setPricingModalOpen(true);
      toast({
        title: "Pro Feature",
        description: "Price alerts are available for Pro users. Upgrade to unlock!",
        variant: "default",
      });
      return;
    }

    setSelectedCrypto(crypto);
    setAlertModalOpen(true);
  };

  const handleSaveAlert = (alert: PriceAlert) => {
    setAlerts(prev => [...prev, alert]);
    toast({
      title: "Alert created!",
      description: `You'll be notified when ${alert.coinName} ${alert.alertType === "above" ? "goes above" : "drops below"} $${alert.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast({
      title: "Alert deleted",
      description: "Price alert has been removed",
    });
  };

  // Sorting and filtering logic
  const getFilteredAndSortedData = useCallback(() => {
    let data = [...allCryptoData];

    // Apply filters
    switch (activeFilter) {
      case "top10":
        data = data.slice(0, 10);
        break;
      case "top50":
        data = data.slice(0, 50);
        break;
      case "gainers":
        data = data.filter(coin => coin.change24h > 0).sort((a, b) => b.change24h - a.change24h);
        break;
      case "losers":
        data = data.filter(coin => coin.change24h < 0).sort((a, b) => a.change24h - b.change24h);
        break;
      default:
        // all - no filter
        break;
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "market_cap":
          aValue = a.marketCap;
          bValue = b.marketCap;
          break;
        case "price_change_percentage_24h":
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case "current_price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data.slice(0, displayCount);
  }, [allCryptoData, activeFilter, sortBy, sortOrder, displayCount]);

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, 50));
  };

  const handleFilterChange = (filter: "all" | "top10" | "top50" | "gainers" | "losers") => {
    setActiveFilter(filter);
    setDisplayCount(50); // ✅ CHANGED: Reset to 50 instead of 10
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  // Check alerts and send emails
  useEffect(() => {
    if (cryptoData.length === 0 || alerts.length === 0) return;

    const activeAlerts = alerts.filter(alert => alert.isActive);
    if (activeAlerts.length === 0) return;

    activeAlerts.forEach(async (alert) => {
      const crypto = cryptoData.find(c => c.id === alert.coinId);
      if (!crypto) return;

      const shouldTrigger =
        (alert.alertType === "above" && crypto.price >= alert.targetPrice) ||
        (alert.alertType === "below" && crypto.price <= alert.targetPrice);

      if (shouldTrigger) {
        try {
          // Send email using EmailJS
          await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            {
              to_email: alert.email,
              coin_name: alert.coinName,
              alert_type: alert.alertType,
              target_price: alert.targetPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              current_price: crypto.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              coin_symbol: alert.coinSymbol.toUpperCase(),
            },
            'YOUR_PUBLIC_KEY'
          );

          // Deactivate alert after sending
          setAlerts(prev => prev.map(a =>
            a.id === alert.id ? { ...a, isActive: false } : a
          ));

          toast({
            title: "Alert triggered!",
            description: `${alert.coinName} ${alert.alertType === "above" ? "went above" : "dropped below"} your target price`,
          });
        } catch (error) {
          console.error("Failed to send alert email:", error);
        }
      }
    });
  }, [cryptoData, alerts, toast]);

  // Generate JSON-LD schema
  const generateSchema = () => {
    if (mode === "crypto" && cryptoData.length > 0) {
      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": cryptoData.map((coin, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": coin.name,
          "description": `${coin.name} (${coin.symbol.toUpperCase()}) live price and 24h change`,
          "offers": {
            "@type": "Offer",
            "price": coin.price,
            "priceCurrency": "USD"
          }
        }))
      };
    } else if (mode === "nft" && nftData) {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": nftData.name,
        "description": nftData.description || `${nftData.name} NFT collection floor price and stats`,
        "image": nftData.image,
        "offers": {
          "@type": "Offer",
          "price": nftData.floorPrice,
          "priceCurrency": "USD"
        }
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {generateSchema() && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchema()) }}
        />
      )}

      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID"
        crossOrigin="anonymous"
      />

      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onShare={handleShare} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="w-full">
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {mode === "portfolio" ? "Your Portfolio" : `Live ${mode === "crypto" ? "Crypto" : "NFT"} Prices`}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === "portfolio"
                ? "Track your investments in real-time"
                : "Real-time tracking. No ads. No sign-ups. Just data."}
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by{" "}
              <a
                href="https://x.com/hamzaaslam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Hamza Aslam
              </a>
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "crypto" | "nft" | "portfolio")}>
              <TabsList className="grid w-[420px] grid-cols-3">
                <TabsTrigger value="crypto">💰 Crypto</TabsTrigger>
                <TabsTrigger value="nft">🖼️ NFTs</TabsTrigger>
                <TabsTrigger value="portfolio">📊 Portfolio</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {mode !== "portfolio" && (
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
          )}

          <div className="mb-8">
            {mode === "crypto" ? (
              <>
                {!searchQuery && (
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { key: "all", label: "All Coins", count: allCryptoData.length },
                        { key: "top10", label: "Top 10", count: 10 },
                        { key: "top50", label: "Top 50", count: 50 },
                        { key: "gainers", label: "Biggest Gainers", count: allCryptoData.filter(c => c.change24h > 0).length },
                        { key: "losers", label: "Biggest Losers", count: allCryptoData.filter(c => c.change24h < 0).length },
                      ].map(({ key, label, count }) => (
                        <button
                          key={key}
                          onClick={() => handleFilterChange(key as any)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === key
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                        >
                          {label} ({count})
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { key: "market_cap", label: "Market Cap" },
                        { key: "price_change_percentage_24h", label: "24h Change" },
                        { key: "current_price", label: "Price" },
                        { key: "name", label: "Name" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => handleSortChange(key as any)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${sortBy === key
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                        >
                          {label}
                          {sortBy === key && (
                            <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <CryptoTickerTable
                  data={searchQuery ? cryptoData : getFilteredAndSortedData()}
                  isLoading={isLoading}
                  alerts={alerts}
                  onSetAlert={handleSetAlert}
                />

                {/* ✅ REMOVED Load More Button - Now shows all 50 by default */}
              </>
            ) : mode === "nft" ? (
              <NFTTable data={nftData} isLoading={isLoading} />
            ) : (
              <PortfolioTable onFetchPrice={fetchPriceForPortfolio} />
            )}
          </div>

          {/* ✅ UPDATED: Only show alerts for Pro users */}
          {mode === "crypto" && isPro && alerts.length > 0 && (
            <div className="mb-8">
              <AlertsTable alerts={alerts} onDeleteAlert={handleDeleteAlert} />
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>

          {mode !== "portfolio" && (
            <div className="mt-8 p-6 border border-border rounded-xl bg-card text-center">
              <h3 className="text-xl font-bold mb-2">Track Your Portfolio</h3>
              <p className="text-muted-foreground mb-4">
                Add your holdings and see real-time P&L with visual charts
              </p>
              <Link
                to="/?tab=portfolio"
                onClick={() => setMode("portfolio")}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Start Tracking →
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        crypto={selectedCrypto}
        onSaveAlert={handleSaveAlert}
        currentAlertsCount={alerts.length}
      />

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
};

export default Index;