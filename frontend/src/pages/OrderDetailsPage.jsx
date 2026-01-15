import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrder } from "../api/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, Package, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            toast.error("Please login to view order details");
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await getOrder(id);
                if (response.success) {
                    setOrder(response.data);
                } else {
                    toast.error(response.message || "Failed to load order");
                }
            } catch (error) {
                console.error("Failed to fetch order", error);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const handleDownloadInvoice = () => {
        if (!order) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(40);
            doc.text("INVOICE", 14, 20);

            doc.setFontSize(10);
            doc.text(`Invoice #: ${order._id.substring(0, 10).toUpperCase()}`, 14, 30);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 35);

            // Company Details
            doc.setFontSize(12);
            doc.text("Krishi Sanchay", 150, 20);
            doc.setFontSize(10);
            doc.text("New Delhi, India", 150, 25);
            doc.text("support@krishisanchay.com", 150, 30);

            // Bill To
            doc.line(14, 45, 196, 45); // Horizontal line
            doc.setFontSize(12);
            doc.text("Bill To:", 14, 55);
            doc.setFontSize(10);
            doc.text(order.user?.name || "Customer", 14, 62);
            doc.text(order.user?.email || "", 14, 67);

            // Shipping Address
            doc.text(order.shippingAddress?.address || "", 14, 75);
            doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}`, 14, 80);
            doc.text(order.shippingAddress?.country || "India", 14, 85);

            // Table
            const tableColumn = ["Item", "Quantity", "Price", "Total"];
            const tableRows = [];

            if (order.orderItems && Array.isArray(order.orderItems)) {
                order.orderItems.forEach(item => {
                    const itemData = [
                        item.name,
                        item.qty,
                        `Rs. ${(item.price || 0).toLocaleString("en-IN")}`,
                        `Rs. ${((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}`
                    ];
                    tableRows.push(itemData);
                });
            }

            // Using functional approach for autoTable
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 95,
                theme: 'grid',
                headStyles: { fillColor: [22, 163, 74] } // Green color
            });

            // Totals
            const finalY = doc.lastAutoTable?.finalY || 150;
            doc.setFontSize(10);
            const total = order.totalPrice || 0;
            doc.text(`Subtotal: Rs. ${total.toLocaleString("en-IN")}`, 150, finalY + 10);
            doc.setFontSize(12);
            doc.setTextColor(22, 163, 74);
            doc.text(`Total: Rs. ${total.toLocaleString("en-IN")}`, 150, finalY + 17);

            // Footer
            doc.setTextColor(150);
            doc.setFontSize(8);
            doc.text("Thank you for your business!", 14, finalY + 30);

            doc.save(`Invoice_${order._id.substring(0, 8)}.pdf`);
            toast.success("Invoice downloaded successfully");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error(`Failed to generate invoice: ${error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h2 className="text-2xl font-bold">Order Not Found</h2>
                <Link to="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/", { state: { view: "dashboard", tab: "orders" } })}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold">Order Details</h1>
                    </div>
                    <Button onClick={handleDownloadInvoice} className="bg-blue-600 hover:bg-blue-700">
                        <Package className="w-4 h-4 mr-2" />
                        Download Invoice
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">

                    {/* Main Order Info */}
                    <div className="flex-1 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium">
                                    Order #{order._id.substring(0, 10).toUpperCase()}
                                </CardTitle>
                                <Badge className={order.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                    {order.isPaid ? "Paid" : "Pending"}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-500 mb-4">
                                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                </div>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, index) => (
                                        <div key={index} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.name}</h4>
                                                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                            </div>
                                            <div className="font-medium">
                                                ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.orderStatus === 'Cancelled' ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4 text-red-700">
                                        <div className="bg-red-100 p-2 rounded-full">
                                            <div className="w-6 h-6 font-bold text-center">X</div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Order Cancelled</h4>
                                            <p className="text-sm">This order has been cancelled.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative py-8">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />

                                        {/* Active Progress Bar */}
                                        <div
                                            className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500"
                                            style={{
                                                width: `${Math.max(0, ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(order.orderStatus) / 4 * 100)}%`
                                            }}
                                        />

                                        <div className="relative z-10 flex justify-between w-full">
                                            {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, index) => {
                                                const currentStepIndex = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(order.orderStatus || 'Pending');
                                                const isCompleted = index <= currentStepIndex;
                                                const isCurrent = index === currentStepIndex;

                                                return (
                                                    <div key={step} className="flex flex-col items-center gap-2">
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                                                                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                                                            `}
                                                        >
                                                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                                        </div>
                                                        <span
                                                            className={`text-xs font-medium text-center absolute -bottom-6 w-24
                                                                ${isCurrent ? 'text-green-600 font-bold' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                                                            `}
                                                        >
                                                            {step}
                                                        </span>
                                                        {isCurrent && step === 'Delivered' && (
                                                            <div className="absolute -bottom-10 text-[10px] text-green-600 font-medium whitespace-nowrap">
                                                                {new Date(order.deliveredAt).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="w-full md:w-80 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Customer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {order.user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.user?.name}</p>
                                        <p className="text-xs text-gray-500">{order.user?.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                        <p>{order.shippingAddress?.country}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
