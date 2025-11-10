import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const AdminTrashOrders = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [trashOrders, setTrashOrders] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'orders'), where('status', '==', 'deleted'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTrashOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: (d.data() as any).createdAt?.toDate?.() || new Date() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleRestoreOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'pending' });
            toast({ title: "Success", description: "Order restored." });
        } catch (error) {
            console.error("Error restoring order:", error);
            toast({ title: "Error", description: "Failed to restore order.", variant: "destructive" });
        }
    };

    const handlePermanentDeleteOrder = async (orderId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'orders', orderId));
            toast({ title: "Success", description: "Order permanently deleted." });
        } catch (error) {
            console.error("Error permanently deleting order:", error);
            toast({ title: "Error", description: "Failed to permanently delete order.", variant: "destructive" });
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trash Orders</CardTitle>
                <CardDescription>View and manage deleted orders.</CardDescription>
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
                        {trashOrders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">{order.orderId || order.id.substring(0, 8)}</TableCell>
                                <TableCell>{order.customerEmail}</TableCell>
                                <TableCell>${order.amount}</TableCell>
                                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => handleRestoreOrder(order.id)}>Restore</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handlePermanentDeleteOrder(order.id)}>Permanent Delete</Button>
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

export default AdminTrashOrders;
