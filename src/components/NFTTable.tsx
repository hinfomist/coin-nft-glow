import { ArrowUp, ArrowDown, ExternalLink, Twitter, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

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

interface NFTTableProps {
  data: NFTData | null;
  isLoading: boolean;
}

export const NFTTable = ({ data, isLoading }: NFTTableProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(0);
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <img
          src={data.image}
          alt={data.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <div>
              <h3 className="text-2xl font-bold">{data.name}</h3>
              <p className="text-sm text-muted-foreground uppercase">{data.symbol}</p>
            </div>
            <div className="flex gap-3">
              {data.links.homepage && (
                <a
                  href={data.links.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {data.links.twitter && (
                <a
                  href={data.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          {data.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {data.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Floor Price</div>
          <div className="text-xl font-bold font-mono">{formatPrice(data.floorPrice)}</div>
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              data.floorPriceChange24h >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {data.floorPriceChange24h >= 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(data.floorPriceChange24h).toFixed(2)}%
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">24h Volume</div>
          <div className="text-xl font-bold font-mono">{formatPrice(data.volume24h)}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Unique Owners</div>
          <div className="text-xl font-bold font-mono">{formatNumber(data.uniqueAddresses)}</div>
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              data.uniqueAddressesChange24h >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {data.uniqueAddressesChange24h >= 0 ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(data.uniqueAddressesChange24h).toFixed(2)}%
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Collection</div>
          <a
            href={`https://opensea.io/collection/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-semibold"
          >
            View on OpenSea <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};
