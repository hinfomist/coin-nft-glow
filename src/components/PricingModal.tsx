import { useState } from "react";
import { Check, X, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, upgradeToPro } = useAuth();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const paypalEmail = import.meta.env.VITE_PAYPAL_EMAIL || 'your-paypal-email@example.com';
      const currency = import.meta.env.VITE_PAYPAL_CURRENCY || 'USD';
      const price = import.meta.env.VITE_PRO_PRICE || '9.99';

      // PayPal integration for Pakistan and global users
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalEmail)}&item_name=${encodeURIComponent('CryptoFlash Pro Subscription')}&amount=${price}&currency_code=${currency}&return=${encodeURIComponent(window.location.origin + '/payment/success')}&cancel_return=${encodeURIComponent(window.location.origin + '/payment/cancel')}&notify_url=${encodeURIComponent(window.location.origin + '/api/paypal/webhook')}`;

      // Store payment intent in localStorage for verification
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('pending_payment', JSON.stringify({
        id: paymentId,
        amount: parseFloat(price),
        currency: currency,
        timestamp: Date.now(),
        userId: user?.id
      }));

      toast({
        title: "Redirecting to PayPal...",
        description: "You'll be redirected to PayPal to complete your secure payment.",
      });

      // Redirect to PayPal
      window.location.href = paypalUrl;

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const features = {
    free: [
      { name: "View live prices for 50+ cryptos", included: true },
      { name: "Search and filter cryptocurrencies", included: true },
      { name: "1 portfolio with up to 5 holdings", included: true },
      { name: "2 price alerts", included: true },
      { name: "Basic portfolio analytics", included: true },
      { name: "Ad-supported experience", included: true },
      { name: "Unlimited portfolios", included: false },
      { name: "Unlimited holdings per portfolio", included: false },
      { name: "Unlimited price alerts", included: false },
      { name: "Historical price charts", included: false },
      { name: "Export portfolio to CSV", included: false },
      { name: "Ad-free experience", included: false },
      { name: "Priority support", included: false },
    ],
    pro: [
      { name: "View live prices for 50+ cryptos", included: true },
      { name: "Search and filter cryptocurrencies", included: true },
      { name: "Unlimited portfolios", included: true },
      { name: "Unlimited holdings per portfolio", included: true },
      { name: "Unlimited price alerts", included: true },
      { name: "Advanced portfolio analytics", included: true },
      { name: "Historical price charts (coming soon)", included: true },
      { name: "Export portfolio to CSV", included: true },
      { name: "Ad-free experience", included: true },
      { name: "Priority support", included: true },
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Unlock the full potential of CryptoFlash
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <Card className="p-6 relative">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-1">$0</div>
              <p className="text-sm text-muted-foreground">Forever free</p>
            </div>

            <div className="space-y-3 mb-6">
              {features.free.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                Pro
                <Zap className="w-5 h-5 text-primary" />
              </h3>
              <div className="text-3xl font-bold mb-1">
                ${(import.meta.env.VITE_PRO_PRICE || '9.99')}
              </div>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>

            <div className="space-y-3 mb-6">
              {features.pro.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-foreground">
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upgrade to Pro"}
            </Button>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Why Upgrade to Pro?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Track unlimited portfolios and holdings</li>
            <li>• Set unlimited price alerts for any cryptocurrency</li>
            <li>• Export your portfolio data for tax reporting</li>
            <li>• Enjoy an ad-free experience</li>
            <li>• Get priority support for any questions</li>
          </ul>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Secure payment powered by PayPal • Cancel anytime • 30-day money-back guarantee
        </div>
      </DialogContent>
    </Dialog>
  );
};
