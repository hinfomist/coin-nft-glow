import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, doc, updateDoc, orderBy, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch orders from Firebase
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data() as any).createdAt?.toDate?.() || new Date(),
      }));
      setOrders(ordersData);
      console.log('✅ Loaded orders:', ordersData.length);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string, orderEmail: string) => {
    try {
      const adminUid = (await import("firebase/auth")).getAuth().currentUser?.uid;
      const now = Date.now();
      const expires = new Date(now + 30 * 24 * 60 * 60 * 1000);

      // Update order status in Firebase with expiry and admin reference
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedByUid: adminUid || null,
        proPlan: 'monthly',
        expiresAt: Timestamp.fromDate(expires),
      });

      // Upsert user profile with pro flags and expiry, document id as the email
      const userRef = doc(db, 'users', orderEmail);
      await setDoc(userRef, {
        email: orderEmail,
        isPro: true,
        proPlan: 'monthly',
        proStartedAt: serverTimestamp(),
        proExpiresAt: Timestamp.fromDate(expires),
      }, { merge: true });

      toast({
        title: "Success",
        description: "Order approved and user upgraded to Pro for 30 days.",
      });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('❌ Error approving order:', error);
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
      });

      toast({
        title: "Order Rejected",
        description: "Order has been rejected",
      });

      fetchOrders();
    } catch (error) {
      console.error('❌ Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <Button onClick={() => navigate('/admin/login')} variant="outline">
            Logout
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">Order #{order.orderId}</h3>
                        <p className="text-sm text-muted-foreground">
                          {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant={
                        order.status === 'approved' ? 'default' :
                        order.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Customer:</span> {order.customerName}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {order.customerEmail}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {order.customerPhone}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span> {order.country}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ${order.amount}
                      </div>
                      <div>
                        <span className="font-medium">Payment:</span> {order.paymentMethod}
                      </div>
                      {order.additionalNotes && (
                        <div>
                          <span className="font-medium">Notes:</span> {order.additionalNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Proof */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Payment Proof:</h4>
                    {order.paymentProof ? (
                      order.paymentProof.startsWith('data:image') ? (
                        <img
                          src={order.paymentProof}
                          alt="Payment Proof"
                          className="w-full rounded-lg border"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{order.paymentProof}</p>
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">No image uploaded</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'pending' && (
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => handleApprove(order.id, order.customerEmail)}
                      className="flex-1"
                    >
                      Approve & Activate Pro
                    </Button>
                    <Button
                      onClick={() => handleReject(order.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
