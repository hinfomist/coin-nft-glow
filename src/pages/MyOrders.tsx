import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  country: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'verified' | 'active' | 'rejected';
  submittedAt: number;
  notes?: string;
}

const MyOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      // Fetch user's orders from Firestore
      const q = query(collection(db, "orders"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      const userOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userOrders.push({
          id: doc.id,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          plan: data.plan,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          status: data.status,
          submittedAt: new Date(data.submittedAt).getTime(),
          notes: data.additionalNotes
        });
      });

      // Sort by submitted date (newest first)
      userOrders.sort((a, b) => b.submittedAt - a.submittedAt);

      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders from database:', error);

      // Fallback to localStorage
      try {
        const allOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        const userOrders = allOrders.filter((order: Order) => order.email === user.email);
        setOrders(userOrders);
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "secondary",
      verified: "default",
      active: "default",
      rejected: "destructive"
    };

    const colors: { [key: string]: string } = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      verified: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };

    return (
      <Badge variant={variants[status] || "outline"} className={colors[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Verification in progress';
      case 'active':
        return '✅ Pro Active!';
      case 'rejected':
        return '❌ Payment issue - Contact support';
      default:
        return status.replace('_', ' ').toUpperCase();
    }
  };

  const handleContactSupport = (orderId: string) => {
    const message = `Hi, I need help with my order ${orderId}. Can you please assist me?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/923144460158?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewDetails = (order: Order) => {
    // Simple modal or expand details
    toast({
      title: "Order Details",
      description: `Order ${order.id} - ${order.plan} - $${order.amount} - Status: ${order.status}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-muted-foreground">Track your subscription orders and payment status</p>
            </div>
            <Button
              variant="outline"
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Upgrade to Pro to see your orders here.</p>
            <Button onClick={() => window.location.href = '/checkout'}>
              Upgrade to Pro
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {getStatusMessage(order.status)}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Plan:</span>
                        <p className="text-muted-foreground">{order.plan.replace('_', ' ').toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>
                        <p className="text-muted-foreground">${order.amount}</p>
                      </div>
                      <div>
                        <span className="font-medium">Payment Method:</span>
                        <p className="text-muted-foreground">{getPaymentMethodName(order.paymentMethod)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <p className="text-muted-foreground">
                          {new Date(order.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-muted rounded text-sm">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactSupport(order.id)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Support
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">📞 WhatsApp Support</p>
              <p className="text-muted-foreground">Get instant help for your orders</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open('https://wa.me/923144460158', '_blank')}
              >
                Contact Support
              </Button>
            </div>
            <div>
              <p className="font-medium mb-2">📧 Email Support</p>
              <p className="text-muted-foreground">support@cryptoflash.com</p>
              <p className="text-muted-foreground">Response time: Within 12 hours</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyOrders;
