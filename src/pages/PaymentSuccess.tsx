import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, upgradeToPro } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment details from URL parameters (PayPal returns these)
        const paymentId = searchParams.get('tx'); // PayPal transaction ID
        const paymentStatus = searchParams.get('st'); // Payment status

        // Get pending payment from localStorage
        const pendingPayment = localStorage.getItem('pending_payment');
        if (!pendingPayment) {
          throw new Error('No pending payment found');
        }

        const paymentData = JSON.parse(pendingPayment);

        // Verify payment (in production, you'd verify with PayPal IPN/webhook)
        if (paymentStatus === 'Completed' || paymentId) {
          // Payment successful - upgrade user to Pro
          upgradeToPro();

          // Clear pending payment
          localStorage.removeItem('pending_payment');

          // Store subscription info
          const subscriptionData = {
            userId: user?.id,
            subscriptionId: paymentId || `sub_${Date.now()}`,
            status: 'active',
            plan: 'pro',
            amount: 9.99,
            currency: 'USD',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            paymentMethod: 'paypal'
          };

          localStorage.setItem(`cryptoflash_subscription_${user?.id}`, JSON.stringify(subscriptionData));

          toast({
            title: "Welcome to Pro! 🎉",
            description: "Your subscription has been activated successfully.",
          });

          setIsProcessing(false);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/app');
      }
    };

    // Small delay to show processing state
    setTimeout(verifyPayment, 1000);
  }, [searchParams, user, upgradeToPro, toast, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar darkMode={true} onToggleDarkMode={() => {}} onShare={() => {}} />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={true} onToggleDarkMode={() => {}} onShare={() => {}} />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h1>

            <div className="bg-primary/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold">CryptoFlash Pro Activated</span>
              </div>
              <p className="text-muted-foreground">
                Welcome to the Pro experience! Your subscription is now active.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold">What's Unlocked:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited portfolios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited holdings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Unlimited price alerts</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Ad-free experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">CSV export</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/app?tab=portfolio')}
                className="flex items-center gap-2"
              >
                Start Using Pro Features
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/app')}
              >
                Explore Crypto Prices
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Next billing date:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                <br />
                You can manage your subscription anytime from your account settings.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
