import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Star } from "lucide-react";

const BuyerView = ({ stats }) => {
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
                            <h3 className="text-2xl font-bold text-green-900">{stats?.activeOrders || 2}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Total Clean Purchases</p>
                            <h3 className="text-2xl font-bold text-blue-900">{stats?.totalOrders || 12}</h3>
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
                            <h3 className="text-2xl font-bold text-orange-900">{stats?.savedProducts || 5}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-semibold">Recent Orders</h3>
                    {[1, 2].map((i) => (
                        <Card key={i} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="flex gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Organic Wheat (50kg)</h4>
                                    <p className="text-sm text-muted-foreground">Order #2458{i} • Delivered</p>
                                    <p className="text-primary font-medium mt-1">₹2,400</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Track Order</Button>
                        </Card>
                    ))}
                </div>

                {/* Recommended */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Recommended for You</h3>
                    <Card className="p-4">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-3 items-center border-b last:border-0 pb-3 last:pb-0">
                                    <div className="w-12 h-12 bg-gray-100 rounded-md" />
                                    <div className="flex-1">
                                        <h5 className="font-medium text-sm">Fresh Tomatoes</h5>
                                        <p className="text-xs text-muted-foreground">₹40/kg</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8">
                                        <ShoppingBag className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BuyerView;
