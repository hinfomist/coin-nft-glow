import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from '@emailjs/browser';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react";

interface CheckoutData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  orderId: string;
  amount: number;
  plan: string;
}

// Initialize EmailJS
emailjs.init('qGne5q3S91snhJgUr');

const PaymentProof = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofImage, setProofImage] = useState<string>("");

  useEffect(() => {
    const checkout = localStorage.getItem('checkout_data');
    const method = localStorage.getItem('selected_payment_method');

    if (!checkout || !method) {
      navigate('/checkout');
      return;
    }

    setCheckoutData(JSON.parse(checkout));
    setSelectedMethod(method);
  }, [navigate]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        setProofImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
      setProofImage('PDF uploaded - ' + file.name);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    setProofImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (!proofImage) {
      toast({
        title: "Error",
        description: "Please upload payment proof",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        orderId: checkoutData!.orderId,
        customerName: checkoutData!.fullName,
        customerEmail: user?.email || checkoutData!.email,
        customerPhone: checkoutData!.phone,
        country: checkoutData!.country,
        amount: checkoutData!.amount,
        paymentMethod: selectedMethod,
        paymentProof: proofImage,
        additionalNotes: notes || '',
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        userId: (user as any)?.uid || null,
      };

      // Save to Firebase Firestore
      console.log('💾 Saving order to Firebase...');
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);
      console.log('✅ Order saved to Firebase');

      // Send email to admin
      console.log('📧 Sending admin notification...');
      try {
        await emailjs.send(
          'hinfomist',
          'hinfomist1',
          {
            to_email: 'hinfomist1@gmail.com',
            order_id: checkoutData!.orderId,
            customer_name: checkoutData!.fullName,
            customer_email: user?.email || checkoutData!.email,
            customer_phone: checkoutData!.phone,
            country: checkoutData!.country,
            amount: checkoutData!.amount,
            payment_method: selectedMethod,
            additional_notes: notes || 'None provided',
            submitted_time: new Date().toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
            }),
          }
        );
        console.log('✅ Admin email sent successfully');
      } catch (emailError) {
        console.error('❌ Admin email failed:', emailError);
        // Don't block - continue anyway
      }

      // Send confirmation email to customer
      console.log('📧 Sending customer confirmation...');
      try {
        await emailjs.send(
          'hinfomist',
          'i6c5y8p',
          {
            to_email: user?.email || checkoutData!.email,
            customer_name: checkoutData!.fullName,
            order_id: checkoutData!.orderId,
            plan: 'Pro Monthly',
            amount: checkoutData!.amount,
            payment_method: selectedMethod,
          }
        );
        console.log('✅ Customer email sent successfully');
      } catch (emailError) {
        console.error('❌ Customer email failed:', emailError);
        // Don't block - continue anyway
      }

      toast({
        title: "Success!",
        description: "Order submitted. Check your email for confirmation.",
      });

      navigate("/payment-success", {
        state: { orderId: checkoutData!.orderId },
      });
    } catch (error) {
      console.error('❌ Error submitting order:', error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    const names: { [key: string]: string } = {
      wire_transfer: 'International Wire Transfer',
      payoneer: 'Payoneer Transfer',
      jazzcash: 'JazzCash',
      local_bank: 'Local Bank Transfer'
    };
    return names[method] || method;
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
              <Badge variant="outline">Step 3 of 3</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Upload Payment Proof
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Order Summary */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Order ID:</span> <span className="font-mono">{checkoutData.orderId}</span></p>
              <p><span className="font-medium">Customer:</span> {checkoutData.fullName}</p>
              <p><span className="font-medium">Email:</span> {user?.email || checkoutData.email}</p>
            </div>
            <div>
              <p><span className="font-medium">Plan:</span> Pro Monthly</p>
              <p><span className="font-medium">Amount:</span> ${checkoutData.amount}</p>
              <p><span className="font-medium">Payment Method:</span> {getPaymentMethodName(selectedMethod)}</p>
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Payment Proof</h2>

          {!uploadedFile ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Drag & drop your payment screenshot here</h3>
              <p className="text-muted-foreground mb-4">OR</p>
              <Button variant="outline">Click to upload</Button>
              <p className="text-sm text-muted-foreground mt-4">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                {previewUrl ? (
                  <img src={previewUrl} alt="Payment proof" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <FileText className="w-16 h-16 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Replace File
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </Card>

        {/* Additional Notes */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Additional Information (Optional)</h3>
          <Textarea
            placeholder="Any transaction ID, reference number, or additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            onClick={(e) => handleSubmit(e as any)}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Payment Proof'
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Your subscription will be activated within 24 hours after verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentProof;
