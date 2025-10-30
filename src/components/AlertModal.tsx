import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  crypto: CryptoData | null;
  onSaveAlert: (alert: PriceAlert) => void;
}

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  targetPrice: number;
  alertType: "above" | "below";
  email: string;
  createdAt: Date;
  isActive: boolean;
}

export const AlertModal = ({ isOpen, onClose, crypto, onSaveAlert }: AlertModalProps) => {
  const [targetPrice, setTargetPrice] = useState("");
  const [alertType, setAlertType] = useState<"above" | "below">("above");
  const [email, setEmail] = useState("");
  const { canAddAlert } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddAlert()) {
      toast({
        title: "Upgrade Required",
        description: "You've reached the free plan limit. Upgrade to Pro for unlimited alerts!",
        variant: "destructive",
      });
      onClose();
      return;
    }

    if (!crypto || !targetPrice || !email) return;

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) return;

    const alert: PriceAlert = {
      id: `${crypto.id}-${Date.now()}`,
      coinId: crypto.id,
      coinName: crypto.name,
      coinSymbol: crypto.symbol,
      targetPrice: price,
      alertType,
      email,
      createdAt: new Date(),
      isActive: true
    };

    onSaveAlert(alert);

    // Reset form
    setTargetPrice("");
    setAlertType("above");
    setEmail("");
    onClose();
  };

  if (!crypto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Price Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <span className="text-2xl">{crypto.emoji}</span>
            <div>
              <div className="font-semibold">{crypto.name}</div>
              <div className="text-sm text-muted-foreground">
                Current: ${crypto.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="alertType">Alert Type</Label>
            <Select value={alertType} onValueChange={(value: "above" | "below") => setAlertType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price drops below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="targetPrice">Target Price (USD)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="any"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Set Alert
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
