import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPendingOrders = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'orders'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: (d.data() as any).createdAt?.toDate?.() || new Date() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApproveOrder = async (order: any) => {
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, { status: 'approved' });

            toast({ title: "Success", description: "Order approved." });
        } catch (error) {
            console.error("Error approving order:", error);
            toast({ title: "Error", description: "Failed to approve order.", variant: "destructive" });
        }
    };

    const handleRejectOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'rejected' });
            toast({ title: "Success", description: "Order rejected." });
        } catch (error) {
            console.error("Error rejecting order:", error);
            toast({ title: "Error", description: "Failed to reject order.", variant: "destructive" });
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'deleted' });
            toast({ title: "Success", description: "Order deleted." });
        } catch (error) {
            console.error("Error deleting order:", error);
            toast({ title: "Error", description: "Failed to delete order.", variant: "destructive" });
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Approve or reject new user orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">{order.orderId || order.id.substring(0, 8)}</TableCell>
                                <TableCell>{order.customerEmail}</TableCell>
                                <TableCell>${order.amount}</TableCell>
                                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => handleApproveOrder(order)}><CheckCircle className="h-4 w-4 mr-2" />Approve</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleRejectOrder(order.id)}><XCircle className="h-4 w-4 mr-2" />Reject</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order.id)}>Delete</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AdminPendingOrders;
