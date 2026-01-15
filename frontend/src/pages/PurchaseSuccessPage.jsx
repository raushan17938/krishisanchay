import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { confirmCheckoutSession } from "../api/order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

const PurchaseSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get("session_id");

    const clearCart = () => {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event("storage"));
    };

    const [status, setStatus] = useState("loading"); // loading, success, error
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            toast.error("Please login to view this page");
            navigate("/login");
            return;
        }

        if (!sessionId) {
            navigate("/");
            return;
        }

        const handleCheckoutSuccess = async () => {
            try {
                const response = await confirmCheckoutSession(sessionId);
                if (response.success) {
                    setStatus("success");
                    setOrder(response.order);
                    clearCart();
                    toast.success("Payment confirmed!");
                } else {
                    setStatus("error");
                    toast.error(response.message || "Payment verification failed");
                }
            } catch (error) {
                console.error(error);
                setStatus("error");
                toast.error(error.response?.data?.message || "Error verifying payment");
            }
        };

        handleCheckoutSuccess();
    }, [sessionId, navigate]);

    if (status === "loading") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Verifying your payment...</h2>
                <p className="text-gray-600 mt-2">Please do not close this window.</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
                <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Something went wrong!</h1>
                <p className="text-gray-600 mb-8 max-w-md">There was an issue creating your order. If money was deducted, please contact support.</p>
                <div className="space-x-4">
                    <Link to="/contact">
                        <Button variant="outline">Contact Support</Button>
                    </Link>
                    <Link to="/">
                        <Button>Go to Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center border border-gray-100">
                <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>

                {order && (
                    <Card className="mb-8 text-left bg-neutral-50 border-neutral-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex justify-between items-center text-gray-800">
                                <span>Order Receipt</span>
                                <span className="text-sm font-normal text-gray-500">
                                    ID: {order._id.substring(0, 10)}...
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name} (x{item.qty})</span>
                                        <span className="font-medium">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-800">
                                <span>Total Amount</span>
                                <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            {order.shippingAddress && (
                                <div className="border-t border-gray-200 pt-3 text-sm text-gray-600">
                                    <p className="font-semibold text-gray-700 mb-1">Delivering to:</p>
                                    <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <p className="text-gray-500 mb-6 text-sm">A confirmation email has been sent to you.</p>

                <div className="flex justify-center space-x-4">
                    <Link to={`/order/${order._id}`}>
                        <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">View Full Details</Button>
                    </Link>
                    <Link to="/">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">Continue Shopping</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PurchaseSuccessPage;
