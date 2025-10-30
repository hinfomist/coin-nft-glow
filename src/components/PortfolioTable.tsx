import { useState, useEffect } from "react";
import { Trash2, Download, Plus, Edit, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { PricingModal } from "@/components/PricingModal";
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
  quantity: string;
  purchasePrice: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export const PortfolioTable = ({ onFetchPrice }: { onFetchPrice: (id: string) => Promise<{ price: number; change24h: number; name: string; symbol: string; image: string }> }) => {
  const { isAuthenticated, user, canAddHolding } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [formData, setFormData] = useState<HoldingFormData>({
    coinId: "",
    quantity: "",
    purchasePrice: ""
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPortfolio([]);
      return;
    }

    const saved = localStorage.getItem(`cryptoflash-portfolio-${user.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPortfolio(parsed);
      } catch (error) {
        console.error("Failed to parse portfolio data:", error);
      }
    } else {
      setPortfolio([]);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && portfolio.length > 0) {
      localStorage.setItem(`cryptoflash-portfolio-${user.id}`, JSON.stringify(portfolio));
    }
  }, [portfolio, isAuthenticated, user]);

  // Real-time price updates
  useEffect(() => {
    const updatePrices = async () => {
      if (portfolio.length === 0) return;

      const updatedPortfolio = await Promise.all(
        portfolio.map(async (asset) => {
          try {
            const data = await onFetchPrice(asset.id);
            return {
              ...asset,
              currentPrice: data.price,
              change24h: data.change24h,
              name: data.name,
              symbol: data.symbol,
              image: data.image
            };
          } catch (error) {
            console.error(`Failed to update price for ${asset.id}:`, error);
            return asset;
          }
        })
      );

      setPortfolio(updatedPortfolio);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [portfolio.length, onFetchPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.purchasePrice);

    if (!formData.coinId || isNaN(qty) || qty <= 0 || isNaN(price) || price <= 0) {
      return;
    }

    try {
      const data = await onFetchPrice(formData.coinId.toLowerCase().replace(/\s+/g, "-"));

      if (editingAsset) {
        // Edit existing
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
      } else {
        // Add new
        const existing = portfolio.find(a => a.id === data.name.toLowerCase().replace(/\s+/g, "-"));
        if (existing) {
          setPortfolio(prev => prev.map(asset =>
            asset.id === existing.id
              ? { ...asset, quantity: asset.quantity + qty }
              : asset
          ));
        } else {
          const newAsset: PortfolioAsset = {
            id: data.name.toLowerCase().replace(/\s+/g, "-"),
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
      }

      setFormData({ coinId: "", quantity: "", purchasePrice: "" });
      setIsAddModalOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error("Failed to add/edit asset:", error);
    }
  };

  const handleEdit = (asset: PortfolioAsset) => {
    setEditingAsset(asset);
    setFormData({
      coinId: asset.name,
      quantity: asset.quantity.toString(),
      purchasePrice: asset.purchasePrice.toString()
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPortfolio(prev => prev.filter(asset => asset.id !== id));
  };

  const handleAddNew = () => {
    if (!canAddHolding()) {
      // Show upgrade prompt
      setPricingModalOpen(true);
      return;
    }
    setEditingAsset(null);
    setFormData({ coinId: "", quantity: "", purchasePrice: "" });
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
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">
          <Lock className="w-16 h-16 mx-auto text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Portfolio Tracking</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sign up for a free account to track your crypto portfolio, set price alerts, and get detailed P&L analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button>Sign Up Free</Button>
          <Button variant="outline">Login</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Free forever • No credit card required
        </p>
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
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Holding
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAsset ? "Edit Holding" : "Add New Holding"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="coinId">Coin Name</Label>
                    <Input
                      id="coinId"
                      placeholder="e.g., bitcoin, ethereum"
                      value={formData.coinId}
                      onChange={(e) => setFormData(prev => ({ ...prev, coinId: e.target.value }))}
                      required
                    />
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
                    <Button type="submit">
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
          </div>
        )}
      </Card>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
};
