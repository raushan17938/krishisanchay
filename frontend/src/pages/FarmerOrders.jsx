import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, IndianRupee, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { getFarmerOrders, updateOrderStatus, generateDeliveryOtp, verifyDeliveryOtp } from "../api/order";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const FarmerOrders = ({ onBack }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [otp, setOtp] = useState("");

    const handleGenerateOtp = async () => {
        if (!selectedOrder) return;
        try {
            const res = await generateDeliveryOtp(selectedOrder._id);
            if (res.success) {
                toast.success("OTP sent to customer email");
            }
        } catch (error) {
            toast.error("Failed to generate OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (!selectedOrder || !otp) return;
        try {
            const res = await verifyDeliveryOtp(selectedOrder._id, otp);
            if (res.success) {
                toast.success("Order delivered successfully!");
                setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, orderStatus: 'Delivered', isDelivered: true, isPaid: true } : o));
                setVerifyDialogOpen(false);
                setOtp("");
                setSelectedOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getFarmerOrders();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
                toast.error("Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" onClick={onBack} className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold">All Orders</h1>
                        <p className="text-muted-foreground mt-2">View and manage all orders for your products</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium">No orders yet</h3>
                        <p className="text-muted-foreground">Orders for your products will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <Card key={order._id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 bg-muted/20">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base">
                                                Customer: {order.user?.name || "Unknown"}
                                            </CardTitle>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                defaultValue={order.orderStatus || 'Pending'}
                                                onValueChange={async (value) => {
                                                    if (value === 'Delivered') {
                                                        setSelectedOrder(order);
                                                        setVerifyDialogOpen(true);
                                                        try {
                                                            const res = await generateDeliveryOtp(order._id);
                                                            if (res.success) toast.success("OTP sent to customer email");
                                                        } catch (error) {
                                                            toast.error("Failed to send OTP");
                                                        }
                                                        return;
                                                    }

                                                    try {
                                                        const response = await updateOrderStatus(order._id, value);
                                                        if (response.success) {
                                                            toast.success(`Order status updated to ${value}`);
                                                            // Update local state
                                                            setOrders(orders.map(o => o._id === order._id ? { ...o, orderStatus: value } : o));
                                                        }
                                                    } catch (error) {
                                                        toast.error("Failed to update status");
                                                        console.error(error);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Processing">Processing</SelectItem>
                                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Badge className={order.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                                {order.isPaid ? "Paid" : "Pending Payment"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-4">
                                        {order.orderItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
                                                    )}
                                                    <span>{item.name} <span className="text-muted-foreground">x{item.qty}</span></span>
                                                </div>
                                                <span>₹{item.price * item.qty}</span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-4 flex justify-between items-center font-semibold">
                                            <span>Total Amount</span>
                                            <span>₹{order.totalPrice}</span>
                                        </div>
                                        {order.orderStatus === 'Out for Delivery' && (
                                            <Button
                                                className="w-full mt-2"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setVerifyDialogOpen(true);
                                                }}
                                            >
                                                Verify Delivery (OTP)
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Verify Delivery</DialogTitle>
                            <DialogDescription>
                                Ask the customer for the OTP sent to their email to confirm delivery.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Button variant="outline" onClick={handleGenerateOtp} className="w-full">
                                Send/Resend OTP
                            </Button>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleVerifyOtp} disabled={otp.length !== 6}>Verify & Deliver</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default FarmerOrders;
