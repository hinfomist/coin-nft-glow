import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Clear any pending payment data
    localStorage.removeItem('pending_payment');

    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. No charges were made.",
      variant: "default",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={true} onToggleDarkMode={() => {}} onShare={() => {}} />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>

            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                  No Charges Made
                </span>
              </div>
              <p className="text-muted-foreground">
                Your payment was cancelled and no charges were processed.
                You can try again anytime.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold">Why Upgrade to Pro?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Unlimited portfolios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Unlimited holdings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Unlimited price alerts</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Ad-free experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">CSV export</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/app')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to App
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  // Re-open pricing modal (you'd need to implement this)
                  navigate('/app?tab=portfolio');
                }}
              >
                Try Pro Again
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Still have questions? Contact our support team for help with your upgrade.
                <br />
                <strong>Free plan features remain available</strong> - upgrade anytime!
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentCancel;
