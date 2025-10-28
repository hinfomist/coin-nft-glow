import { ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface CryptoTickerTableProps {
  data: CryptoData[];
  isLoading: boolean;
}

export const CryptoTickerTable = ({ data, isLoading }: CryptoTickerTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Coin</th>
              <th className="text-right p-4 font-semibold">Price</th>
              <th className="text-right p-4 font-semibold">24h Change</th>
              <th className="text-right p-4 font-semibold">Market Cap</th>
              <th className="text-center p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((crypto) => (
              <tr
                key={crypto.id}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{crypto.emoji}</span>
                    <div>
                      <div className="font-semibold">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground uppercase">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-mono font-semibold">
                  {formatPrice(crypto.price)}
                </td>
                <td className="p-4 text-right">
                  <div
                    className={`inline-flex items-center gap-1 font-semibold ${
                      crypto.change24h >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(crypto.change24h).toFixed(2)}%
                  </div>
                </td>
                <td className="p-4 text-right font-mono">
                  {formatMarketCap(crypto.marketCap)}
                </td>
                <td className="p-4 text-center">
                  <a
                    href={`https://www.binance.com/en/trade/${crypto.symbol}_USDT?ref=YOUR_REF`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Trade <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((crypto) => (
          <Card key={crypto.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{crypto.emoji}</span>
                <div>
                  <div className="font-semibold text-lg">{crypto.name}</div>
                  <div className="text-sm text-muted-foreground uppercase">
                    {crypto.symbol}
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 font-semibold ${
                  crypto.change24h >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {crypto.change24h >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(crypto.change24h).toFixed(2)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Price</div>
                <div className="font-mono font-semibold">
                  {formatPrice(crypto.price)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Market Cap</div>
                <div className="font-mono">{formatMarketCap(crypto.marketCap)}</div>
              </div>
            </div>
            <a
              href={`https://www.binance.com/en/trade/${crypto.symbol}_USDT?ref=YOUR_REF`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
            >
              Trade on Binance <ExternalLink className="w-3 h-3" />
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
};
