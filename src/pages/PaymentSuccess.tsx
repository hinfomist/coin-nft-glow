import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, ArrowRight, MessageCircle, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Get order data from localStorage
    const data = localStorage.getItem('checkout_data');
    if (data) {
      setCheckoutData(JSON.parse(data));
    }

    // Show confetti animation
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const handleReturnToDashboard = () => {
    navigate('/app');
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/923144460158', '_blank');
  };

  const handleDownloadReceipt = () => {
    // Simple receipt download
    const receiptData = {
      orderId: checkoutData?.orderId,
      customer: checkoutData?.fullName,
      email: checkoutData?.email,
      plan: 'Pro Monthly',
      amount: `$${checkoutData?.amount}`,
      date: new Date().toLocaleDateString(),
      status: 'Payment Submitted - Pending Verification'
    };

    const receiptText = `
CryptoFlash Pro Subscription Receipt

Order ID: ${receiptData.orderId}
Customer: ${receiptData.customer}
Email: ${receiptData.email}
Plan: ${receiptData.plan}
Amount: ${receiptData.amount}
Date: ${receiptData.date}
Status: ${receiptData.status}

Thank you for your subscription!
Your Pro features will be activated within 24 hours after payment verification.
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CryptoFlash_Receipt_${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Payment Submitted Successfully!</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-lg">Order ID:</span>
              <Badge variant="outline" className="text-lg px-3 py-1 font-mono">
                {checkoutData?.orderId}
              </Badge>
            </div>
          </div>

          {/* What Happens Next */}
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">What Happens Next?</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Step 1: Payment submitted</h3>
                  <p className="text-sm text-muted-foreground">Completed - Your payment proof has been received</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Step 2: Verification in progress</h3>
                  <p className="text-sm text-muted-foreground">24 hours - We're manually verifying your payment</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Step 3: Account activation</h3>
                  <p className="text-sm text-muted-foreground">You'll receive an email and WhatsApp confirmation</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Information Boxes */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-blue-600" />
              <h3 className="font-semibold mb-2">Confirmation Email Sent</h3>
              <p className="text-sm text-muted-foreground">
                We've sent order details to {checkoutData?.email}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-orange-600" />
              <h3 className="font-semibold mb-2">Activation Time</h3>
              <p className="text-sm text-muted-foreground">
                Your Pro subscription will be activated within 24 hours
              </p>
            </Card>

            <Card className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-2">WhatsApp Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Check your WhatsApp for order details
              </p>
            </Card>
          </div>

          {/* While You Wait */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">While You Wait:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p>• Continue using Free features</p>
                <p>• Explore the crypto market</p>
              </div>
              <div className="space-y-2">
                <p>• Set up your portfolio</p>
                <p>• Join our community</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={handleReturnToDashboard}
              className="flex items-center gap-2"
            >
              Return to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleContactSupport}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleDownloadReceipt}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
          </div>

          {/* Support Section */}
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📞 WhatsApp: +92 314 4460158</p>
              <p>📧 Email: support@cryptoflash.com</p>
              <p>⏰ Response time: Within 12 hours</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
