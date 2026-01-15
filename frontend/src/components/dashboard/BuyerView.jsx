import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getMyOrders } from "../../api/order";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const BuyerView = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getMyOrders();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Calculate stats
    const activeOrders = orders.filter(o => !o.isDelivered && o.orderStatus !== 'Cancelled').length;
    const totalOrders = orders.length;
    // Mock wishlist count for now as we don't have that API yet
    const wishlistCount = 5;

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <ShoppingBag className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-green-800 font-medium">Active Orders</p>
                            <h3 className="text-2xl font-bold text-green-900">{activeOrders}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Total Orders</p>
                            <h3 className="text-2xl font-bold text-blue-900">{totalOrders}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <Star className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-orange-800 font-medium">Wishlist Items</p>
                            <h3 className="text-2xl font-bold text-orange-900">{wishlistCount}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold">Recent Orders</h3>
                    {orders.length === 0 ? (
                        <p className="text-muted-foreground">No orders found.</p>
                    ) : (
                        orders.slice(0, 5).map((order) => (
                            <Card key={order._id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                        <Package className="text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={order.isDelivered ? "default" : "secondary"}>
                                                {order.orderStatus || (order.isDelivered ? 'Delivered' : 'Processing')}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium mt-1">₹{order.totalPrice}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/order/${order._id}`)}>
                                    View Details
                                </Button>
                            </Card>
                        ))
                    )}
                </div>

                {/* Recommended */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Recommended for You</h3>
                    <Card className="p-4">
                        <div className="text-center py-4 text-muted-foreground text-sm">
                            Recommendations coming soon...
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BuyerView;
