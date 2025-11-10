import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Clock, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  orderId: string;
  amount: number;
}

const PaymentInstructions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('checkout_data');
    if (!data) {
      navigate('/checkout');
      return;
    }

    const parsedData = JSON.parse(data);
    setCheckoutData(parsedData);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Fetch exchange rate
    fetchExchangeRate();

    return () => clearInterval(timer);
  }, [navigate]);

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data && data.rates && data.rates.PKR) {
        setExchangeRate(data.rates.PKR);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Fallback to a reasonable default if API fails
      setExchangeRate(280);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    localStorage.setItem('selected_payment_method', methodId);
  };

  const handleProceedToUpload = () => {
    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method before proceeding.",
        variant: "destructive",
      });
      return;
    }
    navigate('/payment-proof');
  };

  if (!checkoutData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">CryptoFlash</h1>
              <Badge variant="outline">Step 2 of 3</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Complete payment within</div>
              <div className="text-lg font-semibold text-orange-600 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Customer Info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Complete Your Payment</h2>
          <p className="text-muted-foreground">
            Hello <span className="font-semibold">{checkoutData.fullName}</span>, your Order ID is{" "}
            <span className="font-mono font-semibold">{checkoutData.orderId}</span>
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Choose Your Payment Method</h3>

          {/* Wire Transfer */}
          <Card
            className={`p-6 cursor-pointer transition-all mb-4 ${
              selectedMethod === 'wire_transfer' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => handlePaymentMethodSelect('wire_transfer')}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">💳</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">International Wire Transfer</h4>
                  {selectedMethod === 'wire_transfer' && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">For international customers</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bank Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">NayaPay</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('NayaPay', 'Bank name'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Holder:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">Hamza Aslam</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('Hamza Aslam', 'Account holder'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">PK42 NAYA 1234 5030 7269 0158</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('PK42 NAYA 1234 5030 7269 0158', 'IBAN'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>SWIFT Code:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">NAYAPKKA</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('NAYAPKKA', 'SWIFT code'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Country:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">Pakistan</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('Pakistan', 'Country'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Processing time: 2-3 business days</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Payoneer */}
          <Card
            className={`p-6 cursor-pointer transition-all mb-4 ${
              selectedMethod === 'payoneer' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => handlePaymentMethodSelect('payoneer')}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">🌍</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">Payoneer Transfer</h4>
                  {selectedMethod === 'payoneer' && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">For international customers preferring Payoneer</p>
                <div className="space-y-2 text-sm">
                  <p className="font-medium mb-2">Contact for Payment</p>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`https://wa.me/923144460158?text=Hi! I want to pay via Payoneer. Order ID: ${checkoutData.orderId}`, '_blank'); 
                      }}
                    >
                      Contact via WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`mailto:hamzaaslam64@gmail.com?subject=Payoneer Payment - Order ${checkoutData.orderId}`, '_blank'); 
                      }}
                    >
                      Contact via Email
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">We'll send you a Payoneer payment request link within 1 hour</p>
                  <p className="text-xs text-muted-foreground">Processing time: Same day</p>
                </div>
              </div>
            </div>
          </Card>

          {/* JazzCash */}
          <Card
            className={`p-6 cursor-pointer transition-all mb-4 ${
              selectedMethod === 'jazzcash' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => handlePaymentMethodSelect('jazzcash')}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">JazzCash (Pakistan Only)</h4>
                  {selectedMethod === 'jazzcash' && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">For Pakistani customers only</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>JazzCash Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">0308 72 43 537</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('03087243537', 'JazzCash number'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Name:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">Hamza Aslam</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('Hamza Aslam', 'Account name'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-muted rounded text-sm">
                    <p className="font-medium mb-2">Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open JazzCash app</li>
                      <li>Select "Send Money"</li>
                      <li>Enter above number</li>
                      <li>Amount: PKR {Math.round((checkoutData.amount || 9.99) * 280)}</li>
                      <li>Complete payment</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">Processing time: Instant</p>
                </div>
              </div>
            </div>
          </Card>

          {/* NayaPay */}
          <Card
            className={`p-6 cursor-pointer transition-all mb-4 ${
              selectedMethod === 'nayapay' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => handlePaymentMethodSelect('nayapay')}
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">🏦</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">NayaPay (Pakistan)</h4>
                  {selectedMethod === 'nayapay' && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">Fast local transfers</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>NayaPay ID:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">hamzaaslam64@nayapay</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('hamzaaslam64@nayapay', 'NayaPay ID'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">03072690158</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('03072690158', 'Account number'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Raast ID/IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">PK42 NAYA 1234 5030 7269 0158</span>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyToClipboard('PK42 NAYA 1234 5030 7269 0158', 'Raast ID/IBAN'); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Processing time: Instant</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Currency Converter */}
        <Card className="p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-primary mt-0.5">💱</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">USD to PKR Converter</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchExchangeRate}
                  disabled={isLoadingRate}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground mb-1">Amount (USD)</div>
                  <div className="text-xl font-semibold">${checkoutData.amount.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <div className="text-sm text-muted-foreground mb-1">Equivalent (PKR)</div>
                  <div className="text-xl font-semibold">
                    {exchangeRate 
                      ? `PKR ${Math.round(checkoutData.amount * exchangeRate).toLocaleString()}`
                      : isLoadingRate ? 'Loading...' : 'Rate unavailable'}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Exchange rate: 1 USD = {exchangeRate ? `${exchangeRate.toFixed(2)} PKR` : 'Loading...'} 
                <span className="text-xs ml-1">(Updated: {new Date().toLocaleString()})</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-6 mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-start gap-3">
            <div className="text-orange-600 mt-0.5">⚠️</div>
            <div>
              <h4 className="font-semibold mb-2">Important:</h4>
              <ul className="text-sm space-y-1">
                <li>• Amount to pay: ${checkoutData.amount} USD (or PKR {exchangeRate ? Math.round(checkoutData.amount * exchangeRate) : Math.round(checkoutData.amount * 280)} equivalent)</li>
                <li>• Include Order ID <span className="font-mono font-semibold">{checkoutData.orderId}</span> in payment description</li>
                <li>• Take screenshot of payment confirmation</li>
                <li>• Your subscription activates after manual verification (within 24 hours)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/checkout')}
            className="flex-1"
          >
            Back to Checkout
          </Button>
          <Button
            onClick={handleProceedToUpload}
            className="flex-1"
            size="lg"
          >
            I've Made the Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
