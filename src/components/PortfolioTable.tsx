import { useState, useEffect, useRef } from "react";
import { Trash2, Download, Plus, Edit, Lock, Search, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useProStatus } from "@/hooks/useProStatus";
import { PricingModal } from "@/components/PricingModal";
import { AuthModal } from "@/components/AuthModal";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  image: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  change24h: number;
}

interface HoldingFormData {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  quantity: string;
  purchasePrice: string;
}

interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  market_cap_rank: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export const PortfolioTable = ({ onFetchPrice }: { onFetchPrice: (id: string) => Promise<{ price: number; change24h: number; name: string; symbol: string; image: string }> }) => {
  const { isAuthenticated, user } = useAuth();
  const { isPro, loading: proLoading } = useProStatus();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<HoldingFormData>({
    coinId: "",
    coinName: "",
    coinSymbol: "",
    coinImage: "",
    quantity: "",
    purchasePrice: ""
  });

  // Coin search state
  const [coinSearchOpen, setCoinSearchOpen] = useState(false);
  const [coinSearchQuery, setCoinSearchQuery] = useState("");
  const [coinSearchResults, setCoinSearchResults] = useState<CoinSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for managing intervals and timeouts
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const priceUpdateIntervalRef = useRef<NodeJS.Timeout>();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Real-time Firebase listener for cross-tab sync
  useEffect(() => {
    if (!isAuthenticated || !user || !user.email) {
      setPortfolio([]);
      return;
    }

    setIsLoading(true);
    console.log('📡 Setting up real-time listener for:', user.email);

    const portfolioRef = doc(db, 'portfolios', user.email);

    const unsubscribe = onSnapshot(
      portfolioRef,
      (docSnap) => {
        setIsLoading(false);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('✅ Portfolio loaded from Firebase:', data.holdings?.length || 0, 'holdings');
          setPortfolio(data.holdings || []);
        } else {
          console.log('📭 No portfolio found, starting fresh');
          setPortfolio([]);
        }
      },
      (error) => {
        console.error('❌ Failed to load portfolio:', error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load portfolio data",
          variant: "destructive",
        });
      }
    );

    return () => {
      console.log('🔌 Disconnecting portfolio listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCoinSearchOpen(false);
      }
    };

    if (coinSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [coinSearchOpen]);

  // ✅ Search coins from CoinGecko API
  useEffect(() => {
    if (!coinSearchQuery || coinSearchQuery.length < 2) {
      setCoinSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${coinSearchQuery}`);
        const data = await response.json();

        const topCoins = data.coins?.slice(0, 10) || [];
        setCoinSearchResults(topCoins);
      } catch (error) {
        console.error('Failed to search coins:', error);
        setCoinSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [coinSearchQuery]);

  const savePortfolioToFirebase = async (holdings: PortfolioAsset[]) => {
    if (!isAuthenticated || !user || !user.email) return;

    try {
      console.log('💾 Saving portfolio to Firebase...', holdings.length, 'holdings');
      const portfolioRef = doc(db, 'portfolios', user.email);
      await setDoc(portfolioRef, {
        holdings: holdings,
        updatedAt: serverTimestamp(),
        userEmail: user.email,
      }, { merge: true });
      console.log('✅ Portfolio saved successfully');
    } catch (error) {
      console.error("❌ Failed to save portfolio:", error);
      toast({
        title: "Error",
        description: "Failed to save portfolio data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user || isLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      savePortfolioToFirebase(portfolio);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [portfolio, isAuthenticated, user?.email, isLoading]);

  useEffect(() => {
    const updatePrices = async () => {
      if (portfolio.length === 0) return;

      try {
        const updatedPortfolio = await Promise.all(
          portfolio.map(async (asset) => {
            try {
              const data = await onFetchPrice(asset.id);
              return {
                ...asset,
                currentPrice: data.price,
                change24h: data.change24h,
              };
            } catch (error) {
              console.error(`Failed to update price for ${asset.id}:`, error);
              return asset;
            }
          })
        );

        const pricesChanged = updatedPortfolio.some((asset, idx) =>
          asset.currentPrice !== portfolio[idx]?.currentPrice
        );

        if (pricesChanged) {
          setPortfolio(updatedPortfolio);
        }
      } catch (error) {
        console.error('Price update failed:', error);
      }
    };

    const initialTimeout = setTimeout(updatePrices, 2000);
    priceUpdateIntervalRef.current = setInterval(updatePrices, 30000);

    return () => {
      clearTimeout(initialTimeout);
      if (priceUpdateIntervalRef.current) {
        clearInterval(priceUpdateIntervalRef.current);
      }
    };
  }, [portfolio.length, onFetchPrice]);

  const handleCoinSelect = (coin: CoinSearchResult) => {
    setFormData(prev => ({
      ...prev,
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol,
      coinImage: coin.thumb
    }));
    setCoinSearchOpen(false);
    setCoinSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.purchasePrice);

    if (!formData.coinId || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a coin and enter valid quantity and price",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await onFetchPrice(formData.coinId);

      if (editingAsset) {
        setPortfolio(prev => prev.map(asset =>
          asset.id === editingAsset.id
            ? {
              ...asset,
              quantity: qty,
              purchasePrice: price,
              currentPrice: data.price,
              change24h: data.change24h,
              name: data.name,
              symbol: data.symbol,
              image: data.image
            }
            : asset
        ));
        toast({
          title: "Success",
          description: "Holding updated successfully",
        });
      } else {
        const existing = portfolio.find(a => a.id === formData.coinId);
        if (existing) {
          setPortfolio(prev => prev.map(asset =>
            asset.id === existing.id
              ? { ...asset, quantity: asset.quantity + qty }
              : asset
          ));
        } else {
          const newAsset: PortfolioAsset = {
            id: formData.coinId,
            name: data.name,
            symbol: data.symbol,
            image: data.image,
            quantity: qty,
            purchasePrice: price,
            currentPrice: data.price,
            change24h: data.change24h
          };
          setPortfolio(prev => [...prev, newAsset]);
        }
        toast({
          title: "Success",
          description: "Holding added successfully",
        });
      }

      setFormData({
        coinId: "",
        coinName: "",
        coinSymbol: "",
        coinImage: "",
        quantity: "",
        purchasePrice: ""
      });
      setIsAddModalOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error("Failed to add/edit asset:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coin data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (asset: PortfolioAsset) => {
    setEditingAsset(asset);
    setFormData({
      coinId: asset.id,
      coinName: asset.name,
      coinSymbol: asset.symbol,
      coinImage: asset.image,
      quantity: asset.quantity.toString(),
      purchasePrice: asset.purchasePrice.toString()
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPortfolio(prev => prev.filter(asset => asset.id !== id));
    toast({
      title: "Success",
      description: "Holding deleted successfully",
    });
  };

  const handleAddNew = () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      return;
    }

    if (proLoading) {
      return;
    }

    if (!isPro) {
      setPricingModalOpen(true);
      return;
    }

    setEditingAsset(null);
    setFormData({
      coinId: "",
      coinName: "",
      coinSymbol: "",
      coinImage: "",
      quantity: "",
      purchasePrice: ""
    });
    setIsAddModalOpen(true);
  };

  const totalValue = portfolio.reduce((sum, asset) => sum + asset.currentPrice * asset.quantity, 0);
  const totalCost = portfolio.reduce((sum, asset) => sum + asset.purchasePrice * asset.quantity, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const chartData = portfolio.map((asset) => ({
    name: asset.symbol.toUpperCase(),
    value: asset.currentPrice * asset.quantity
  }));

  const handleScreenshot = async () => {
    const element = document.getElementById("portfolio-card");
    if (!element) return;
    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.download = "crypto-portfolio.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <>
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">
            <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Portfolio Tracking</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sign up to track your crypto portfolio, set price alerts, and get detailed P&L analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setAuthModalOpen(true)}>Sign Up Free</Button>
            <Button variant="outline" onClick={() => setAuthModalOpen(true)}>Login</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Free forever • No credit card required
          </p>
        </Card>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your portfolio...</p>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className={`text-sm ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnL >= 0 ? "📈" : "📉"} {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)} ({totalPnLPercentage >= 0 ? "+" : ""}{totalPnLPercentage.toFixed(2)}%)
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
              if (!open) {
                setIsAddModalOpen(false);
                setCoinSearchQuery("");
                setCoinSearchResults([]);
                setCoinSearchOpen(false);
              }
            }}>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Holding
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAsset ? "Edit Holding" : "Add New Holding"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="coinId">Select Coin</Label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setCoinSearchOpen(!coinSearchOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        {formData.coinName ? (
                          <div className="flex items-center gap-2">
                            <img src={formData.coinImage} alt={formData.coinName} className="w-5 h-5 rounded-full" />
                            <span>{formData.coinName}</span>
                            <span className="text-muted-foreground">({formData.coinSymbol.toUpperCase()})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Search for a coin...</span>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>

                      {coinSearchOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-hidden">
                          <div className="flex items-center border-b px-3 py-2">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                              type="text"
                              placeholder="Search Bitcoin, Ethereum..."
                              value={coinSearchQuery}
                              onChange={(e) => setCoinSearchQuery(e.target.value)}
                              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                              autoFocus
                            />
                            {coinSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCoinSearchQuery("")}
                                className="ml-2 hover:bg-accent rounded p-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div className="overflow-y-auto max-h-[250px]">
                            {isSearching ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Searching...
                              </div>
                            ) : coinSearchResults.length > 0 ? (
                              <div className="p-1">
                                {coinSearchResults.map((coin) => (
                                  <button
                                    key={coin.id}
                                    type="button"
                                    onClick={() => handleCoinSelect(coin)}
                                    className="w-full flex items-center gap-3 px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  >
                                    <img src={coin.thumb} alt={coin.name} className="w-6 h-6 rounded-full" />
                                    <div className="flex-1 text-left">
                                      <div className="font-medium">{coin.name}</div>
                                      <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                                    </div>
                                    {coin.market_cap_rank && (
                                      <div className="text-xs text-muted-foreground">#{coin.market_cap_rank}</div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            ) : coinSearchQuery.length >= 2 ? (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No coins found.
                              </div>
                            ) : (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                Type at least 2 characters to search
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!formData.coinId}>
                      {editingAsset ? "Update" : "Add"} Holding
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" onClick={handleScreenshot}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card id="portfolio-card" className="p-6">
        {portfolio.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Amount Held</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Current Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((asset) => {
                  const currentValue = asset.currentPrice * asset.quantity;
                  const costBasis = asset.purchasePrice * asset.quantity;
                  const pnl = currentValue - costBasis;
                  const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <img src={asset.image} alt={asset.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <div>{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{asset.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${asset.purchasePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">${asset.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={`text-right ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                        <div>${pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</div>
                        <div className="text-sm">({pnlPercentage >= 0 ? "+" : ""}{pnlPercentage.toFixed(2)}%)</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No holdings yet</h3>
            <p className="text-muted-foreground mb-6">Start building your crypto portfolio by adding your first holding</p>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Holding
            </Button>
            {!isPro && (
              <p className="text-sm text-muted-foreground mt-3">
                Pro required to add holdings. Purchase a plan to unlock this feature.
              </p>
            )}
          </div>
        )}
      </Card>

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};