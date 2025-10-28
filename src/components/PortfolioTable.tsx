import { useState, useEffect } from "react";
import { Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import html2canvas from "html2canvas";

interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  price: number;
  change24h: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export const PortfolioTable = ({ onFetchPrice }: { onFetchPrice: (id: string) => Promise<{ price: number; change24h: number; name: string; symbol: string }> }) => {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [assetInput, setAssetInput] = useState("");
  const [qtyInput, setQtyInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cryptoflash-portfolio");
    if (saved) setPortfolio(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (portfolio.length > 0) {
      localStorage.setItem("cryptoflash-portfolio", JSON.stringify(portfolio));
      portfolio.forEach(async (asset) => {
        const data = await onFetchPrice(asset.id);
        setPortfolio((prev) => prev.map((a) => a.id === asset.id ? { ...a, price: data.price, change24h: data.change24h } : a));
      });
    }
  }, [portfolio.length]);

  const handleAdd = async () => {
    if (!assetInput || !qtyInput) return;
    const qty = parseFloat(qtyInput);
    if (isNaN(qty) || qty <= 0) return;

    try {
      const data = await onFetchPrice(assetInput.toLowerCase().replace(/\s+/g, "-"));
      const existing = portfolio.find((a) => a.id === assetInput.toLowerCase().replace(/\s+/g, "-"));
      
      if (existing) {
        setPortfolio(portfolio.map((a) => a.id === existing.id ? { ...a, quantity: a.quantity + qty } : a));
      } else {
        setPortfolio([...portfolio, { id: assetInput.toLowerCase().replace(/\s+/g, "-"), ...data, quantity: qty }]);
      }
      setAssetInput("");
      setQtyInput("");
    } catch (error) {
      console.error("Failed to add asset");
    }
  };

  const handleRemove = (id: string) => {
    const updated = portfolio.filter((a) => a.id !== id);
    setPortfolio(updated);
    localStorage.setItem("cryptoflash-portfolio", JSON.stringify(updated));
  };

  const totalValue = portfolio.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const totalPnL = portfolio.reduce((sum, a) => sum + (a.price * a.quantity * a.change24h / 100), 0);
  const chartData = portfolio.map((a) => ({ name: a.symbol.toUpperCase(), value: a.price * a.quantity }));

  const handleScreenshot = async () => {
    const element = document.getElementById("portfolio-card");
    if (!element) return;
    const canvas = await html2canvas(element);
    const link = document.createElement("a");
    link.download = "crypto-portfolio.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <Input placeholder="Asset (e.g., bitcoin)" value={assetInput} onChange={(e) => setAssetInput(e.target.value)} />
          <Input placeholder="Qty" type="number" value={qtyInput} onChange={(e) => setQtyInput(e.target.value)} className="w-32" />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </Card>

      <Card id="portfolio-card" className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className={`text-sm ${totalPnL >= 0 ? "text-success" : "text-destructive"}`}>
              {totalPnL >= 0 ? "📈" : "📉"} {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} USD (24h)
            </p>
          </div>
          <Button variant="outline" size="icon" onClick={handleScreenshot}><Download className="w-4 h-4" /></Button>
        </div>

        {portfolio.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Value (USD)</TableHead>
                  <TableHead className="text-right">24h P&L</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map((asset) => {
                  const value = asset.price * asset.quantity;
                  const pnl = value * asset.change24h / 100;
                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.name}</TableCell>
                      <TableCell className="text-right">{asset.quantity}</TableCell>
                      <TableCell className="text-right">${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className={`text-right ${asset.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                        {asset.change24h >= 0 ? "📈" : "📉"} {asset.change24h >= 0 ? "+" : ""}{pnl.toFixed(2)} ({asset.change24h.toFixed(2)}%)
                      </TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemove(asset.id)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center py-8">Add your first asset to start tracking 📊</p>
        )}
      </Card>
    </div>
  );
};
