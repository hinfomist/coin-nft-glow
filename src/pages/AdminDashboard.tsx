import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, where, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, User, ShoppingCart, Settings, BarChart, LogOut, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [viewingOrder, setViewingOrder] = useState<any>(null);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [settings, setSettings] = useState({ proPlanDuration: 30 });

    useEffect(() => {
        const ordersUnsub = onSnapshot(
            query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
            (snapshot) => {
                setOrders(snapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                    createdAt: (d.data() as any).createdAt?.toDate?.() || new Date()
                })));
                setLoading(false);
            }
        );

        const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return () => {
            ordersUnsub();
            usersUnsub();
        };
    }, []);

    const getRemainingDays = (expiresAt: any) => {
        if (!expiresAt) return 0;
        const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
        const remaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return remaining > 0 ? remaining : 0;
    };

    const proUsers = users.filter(u => u.isPro && getRemainingDays(u.proExpiresAt) > 0);
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const approvedOrRejectedOrders = orders.filter(o => o.status === 'approved' || o.status === 'rejected');
    const trashedOrders = orders.filter(o => o.status === 'deleted');

    // DASHBOARD TAB
    const renderDashboard = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingOrders.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                    <User className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{proUsers.length}</div>
                </CardContent>
            </Card>
        </div>
    );

    // PENDING ORDERS TAB
    const handleApprovePendingOrder = async (order: any) => {
        try {
            const adminUid = auth.currentUser?.uid;
            const now = Date.now();
            const expires = new Date(now + settings.proPlanDuration * 24 * 60 * 60 * 1000);

            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                status: 'approved',
                approvedAt: serverTimestamp(),
                approvedByUid: adminUid || null,
            });

            const userRef = doc(db, 'users', order.customerEmail);
            await setDoc(userRef, {
                email: order.customerEmail,
                name: order.customerName || order.fullName || 'User', // ✅ 
                isPro: true,
                proPlan: 'monthly',
                proStartedAt: serverTimestamp(),
                proExpiresAt: Timestamp.fromDate(expires),
                planLimit: 30,
                usageCount: 0,
            }, { merge: true });

            toast({ title: "Success", description: "Order approved and user upgraded to Pro." });
        } catch (error) {
            console.error("Error approving order:", error);
            toast({ title: "Error", description: "Failed to approve order.", variant: "destructive" });
        }
    };

    const handleRejectPendingOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'rejected', rejectedAt: serverTimestamp() });
            toast({ title: "Success", description: "Order rejected." });
        } catch (error) {
            console.error("Error rejecting order:", error);
            toast({ title: "Error", description: "Failed to reject order.", variant: "destructive" });
        }
    };

    const handleDeletePendingOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'deleted', deletedAt: serverTimestamp() });
            toast({ title: "Success", description: "Order moved to trash." });
        } catch (error) {
            console.error("Error deleting order:", error);
            toast({ title: "Error", description: "Failed to delete order.", variant: "destructive" });
        }
    };

    const renderPendingOrders = () => (
        <Card>
            <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Approve, reject, or delete new orders.</CardDescription>
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
                        {pendingOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No pending orders
                                </TableCell>
                            </TableRow>
                        ) : (
                            pendingOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono">{order.orderId || order.id.substring(0, 8)}</TableCell>
                                    <TableCell>{order.customerEmail}</TableCell>
                                    <TableCell>${order.amount}</TableCell>
                                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => setViewingOrder(order)}>
                                                <Eye className="h-4 w-4 mr-1" />View
                                            </Button>
                                            <Button size="sm" variant="default" onClick={() => handleApprovePendingOrder(order)}>
                                                <CheckCircle className="h-4 w-4 mr-1" />Approve
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectPendingOrder(order.id)}>
                                                <XCircle className="h-4 w-4 mr-1" />Reject
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleDeletePendingOrder(order.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    // ORDERS TAB (Approved/Rejected)
    const handleDeleteOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'deleted', deletedAt: serverTimestamp() });
            toast({ title: "Success", description: "Order moved to trash." });
        } catch (error) {
            console.error("Error deleting order:", error);
            toast({ title: "Error", description: "Failed to delete order.", variant: "destructive" });
        }
    };

    const renderOrders = () => (
        <Card>
            <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>View and manage approved or rejected orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Days Left</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {approvedOrRejectedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No orders yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            approvedOrRejectedOrders.map(order => {
                                const user = users.find(u => u.email === order.customerEmail);
                                const daysLeft = user && user.isPro ? getRemainingDays(user.proExpiresAt) : 0;
                                return (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">{order.orderId || order.id.substring(0, 8)}</TableCell>
                                        <TableCell>{order.customerEmail}</TableCell>
                                        <TableCell>${order.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === 'approved' ? 'default' : 'destructive'}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.status === 'approved' && daysLeft > 0 ? `${daysLeft} days` : 'N/A'}
                                        </TableCell>
                                        <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setViewingOrder(order)}>View</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setEditingOrder(order)}>Change Status</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-red-600">
                                                        Move to Trash
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    // TRASH TAB
    const handleRestoreOrder = async (orderId: string) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { status: 'pending' });
            toast({ title: "Success", description: "Order restored to pending." });
        } catch (error) {
            console.error("Error restoring order:", error);
            toast({ title: "Error", description: "Failed to restore order.", variant: "destructive" });
        }
    };

    const handlePermanentDelete = async (orderId: string) => {
        if (!window.confirm("Permanently delete this order? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'orders', orderId));
            toast({ title: "Success", description: "Order permanently deleted." });
        } catch (error) {
            console.error("Error permanently deleting order:", error);
            toast({ title: "Error", description: "Failed to permanently delete order.", variant: "destructive" });
        }
    };

    const renderTrash = () => (
        <Card>
            <CardHeader>
                <CardTitle>Trash Orders</CardTitle>
                <CardDescription>Restore or permanently delete orders.</CardDescription>
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
                        {trashedOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No trashed orders
                                </TableCell>
                            </TableRow>
                        ) : (
                            trashedOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono">{order.orderId || order.id.substring(0, 8)}</TableCell>
                                    <TableCell>{order.customerEmail}</TableCell>
                                    <TableCell>${order.amount}</TableCell>
                                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => handleRestoreOrder(order.id)}>
                                                Restore
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handlePermanentDelete(order.id)}>
                                                Delete Forever
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    // USERS TAB
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Delete this user? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'users', userId));
            toast({ title: "Success", description: "User deleted successfully." });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        }
    };

    const renderUsers = () => (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan Usage</TableHead>
                            <TableHead>Days Left</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => {
                            const daysLeft = getRemainingDays(user.proExpiresAt);
                            const usageCount = user.usageCount || 0;
                            const planLimit = user.planLimit || 30;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isPro && daysLeft > 0 ? "default" : "secondary"}>
                                            {user.isPro && daysLeft > 0 ? "Pro" : "Free"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isPro && daysLeft > 0 ? `${usageCount}/${planLimit} used` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {user.isPro && daysLeft > 0 ? `${daysLeft} days` : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => navigate(`/admin/user/${user.id}`)}>
                                                    View/Manage
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    // SETTINGS TAB
    const handleUpdateSettings = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: "Success", description: "Settings updated successfully." });
    };

    const renderSettings = () => (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage application-wide settings.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-md">
                    <div>
                        <Label htmlFor="proPlanDuration">Pro Plan Duration (days)</Label>
                        <Input
                            id="proPlanDuration"
                            type="number"
                            value={settings.proPlanDuration}
                            onChange={(e) => setSettings({ ...settings, proPlanDuration: parseInt(e.target.value) })}
                        />
                    </div>
                    <Button type="submit">Save Settings</Button>
                </form>
            </CardContent>
        </Card>
    );

    const handleUpdateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;
        try {
            const orderRef = doc(db, 'orders', editingOrder.id);
            await updateDoc(orderRef, { status: editingOrder.status });
            toast({ title: "Success", description: "Order updated successfully." });
            setEditingOrder(null);
        } catch (error) {
            console.error("Error updating order:", error);
            toast({ title: "Error", description: "Failed to update order.", variant: "destructive" });
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            {/* SIDEBAR */}
            <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
                <h2 className="mb-6 text-2xl font-bold tracking-tight">Admin Panel</h2>
                <nav className="flex flex-col space-y-1">
                    <Button variant={activeTab === "dashboard" ? "secondary" : "ghost"} onClick={() => setActiveTab("dashboard")} className="justify-start">
                        <BarChart className="mr-2 h-4 w-4" />Dashboard
                    </Button>
                    <Button variant={activeTab === "pending" ? "secondary" : "ghost"} onClick={() => setActiveTab("pending")} className="justify-start">
                        <ShoppingCart className="mr-2 h-4 w-4" />Pending Orders
                        {pendingOrders.length > 0 && (
                            <Badge className="ml-auto" variant="default">{pendingOrders.length}</Badge>
                        )}
                    </Button>
                    <Button variant={activeTab === "orders" ? "secondary" : "ghost"} onClick={() => setActiveTab("orders")} className="justify-start">
                        <ShoppingCart className="mr-2 h-4 w-4" />Orders
                    </Button>
                    <Button variant={activeTab === "trash" ? "secondary" : "ghost"} onClick={() => setActiveTab("trash")} className="justify-start">
                        <Trash2 className="mr-2 h-4 w-4" />Trash
                    </Button>
                    <Button variant={activeTab === "users" ? "secondary" : "ghost"} onClick={() => setActiveTab("users")} className="justify-start">
                        <User className="mr-2 h-4 w-4" />Users
                    </Button>
                    <Button variant={activeTab === "settings" ? "secondary" : "ghost"} onClick={() => setActiveTab("settings")} className="justify-start">
                        <Settings className="mr-2 h-4 w-4" />Settings
                    </Button>
                </nav>
                <div className="mt-auto">
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                        <LogOut className="mr-2 h-4 w-4" />Logout
                    </Button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6">
                <h1 className="text-3xl font-bold capitalize mb-6">{activeTab}</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {activeTab === "dashboard" && renderDashboard()}
                        {activeTab === "pending" && renderPendingOrders()}
                        {activeTab === "orders" && renderOrders()}
                        {activeTab === "trash" && renderTrash()}
                        {activeTab === "users" && renderUsers()}
                        {activeTab === "settings" && renderSettings()}
                    </>
                )}
            </main>

            {/* VIEW ORDER DIALOG */}
            {viewingOrder && (
                <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2 py-4 text-sm">
                            <p><strong>Order ID:</strong> {viewingOrder.orderId || viewingOrder.id}</p>
                            <p><strong>Email:</strong> {viewingOrder.customerEmail}</p>
                            <p><strong>Name:</strong> {viewingOrder.customerName}</p>
                            <p><strong>Phone:</strong> {viewingOrder.customerPhone}</p>
                            <p><strong>Country:</strong> {viewingOrder.country}</p>
                            <p><strong>Amount:</strong> ${viewingOrder.amount}</p>
                            <p><strong>Payment Method:</strong> {viewingOrder.paymentMethod}</p>
                            <p><strong>Status:</strong> <Badge>{viewingOrder.status}</Badge></p>
                            <p><strong>Date:</strong> {viewingOrder.createdAt.toLocaleString()}</p>
                            {viewingOrder.additionalNotes && (
                                <p><strong>Notes:</strong> {viewingOrder.additionalNotes}</p>
                            )}
                            {viewingOrder.paymentProof && (
                                <div className="mt-4">
                                    <p className="font-semibold mb-2">Payment Proof:</p>
                                    <img src={viewingOrder.paymentProof} alt="Payment Proof" className="rounded-md border max-w-full h-auto" />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* EDIT ORDER DIALOG */}
            {editingOrder && (
                <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Order Status</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateOrder}>
                            <div className="grid gap-4 py-4">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default AdminDashboard;