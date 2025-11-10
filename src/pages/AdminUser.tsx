import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface User {
    id: string;
    email: string;
    isPro: boolean;
    proExpiresAt?: any;
    planLimit?: number;
    usageCount?: number;
}

const AdminUser = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [planLimit, setPlanLimit] = useState<number>(30);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!id) {
            toast({ title: "Error", description: "User ID is required.", variant: "destructive" });
            navigate("/admin/dashboard");
            return;
        }

        const fetchUser = async () => {
            try {
                const userRef = doc(db, 'users', id);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data() as User;
                    setUser({ id: userSnap.id, ...userData });
                    setPlanLimit(userData.planLimit || 30); // Initialize planLimit
                } else {
                    toast({ title: "Error", description: "User not found.", variant: "destructive" });
                    navigate("/admin/dashboard");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast({ title: "Error", description: "Failed to fetch user.", variant: "destructive" });
                navigate("/admin/dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const fetchOrders = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where("customerEmail", "==", user?.email), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({ title: "Error", description: "Failed to fetch orders.", variant: "destructive" });
            }
        };

        if (user?.email) {
            fetchOrders();
        }
    }, [id, navigate, toast, user?.email]);

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                isPro: user.isPro,
                proExpiresAt: user.proExpiresAt,
                planLimit: planLimit, // Update planLimit
            });
            toast({ title: "Success", description: "User updated successfully." });
            setEditing(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            await deleteDoc(doc(db, 'users', user.id));
            toast({ title: "Success", description: "User deleted successfully." });
            navigate("/admin/dashboard");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        }
    };

    const handleResetUsage = async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { usageCount: 0 });
            setUser({ ...user, usageCount: 0 });
            toast({ title: "Success", description: "Usage counter reset successfully." });
        } catch (error) {
            console.error("Error resetting usage counter:", error);
            toast({ title: "Error", description: "Failed to reset usage counter.", variant: "destructive" });
        }
    };

    const handleUpdateOrder = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast({ title: "Success", description: "Order status updated successfully." });
        } catch (error) {
            console.error("Error updating order status:", error);
            toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
        }
    };

    if (loading) {
        return <p>Loading user data...</p>;
    }

    if (!user) {
        return <p>User not found.</p>;
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>View and manage user information.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label>Email</Label>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <Label>Pro Status</Label>
                            <p>{user.isPro ? "Pro" : "Free"}</p>
                        </div>
                        {user.isPro && (
                            <>
                                <div>
                                    <Label>Expires At</Label>
                                    <p>{user.proExpiresAt?.toDate().toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label>Plan Limit</Label>
                                    {editing ? (
                                        <Input
                                            type="number"
                                            value={planLimit}
                                            onChange={(e) => setPlanLimit(parseInt(e.target.value))}
                                        />
                                    ) : (
                                        <p>{planLimit}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Usage</Label>
                                    <p>Used {user.usageCount || 0} / {planLimit} tasks</p>
                                </div>
                            </>
                        )}
                        <Button onClick={() => setEditing(!editing)}>{editing ? "Cancel Edit" : "Edit User"}</Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
                        <Button onClick={handleResetUsage}>Reset Usage Counter</Button>
                    </div>

                    {/* Display Orders */}
                    {orders.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Orders</h3>
                            <table className="w-full border-collapse border border-gray-400">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-400 p-2">Order ID</th>
                                        <th className="border border-gray-400 p-2">Amount</th>
                                        <th className="border border-gray-400 p-2">Status</th>
                                        <th className="border border-gray-400 p-2">Date</th>
                                        <th className="border border-gray-400 p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="border border-gray-400 p-2">{order.orderId || order.id}</td>
                                            <td className="border border-gray-400 p-2">${order.amount}</td>
                                            <td className="border border-gray-400 p-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleUpdateOrder(order.id, e.target.value)}
                                                    className="p-1 border rounded"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="border border-gray-400 p-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="border border-gray-400 p-2">
                                                <Button variant="destructive" size="sm">Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUser;
