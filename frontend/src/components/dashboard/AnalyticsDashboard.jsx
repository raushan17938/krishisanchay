import React from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ComposedChart, Scatter
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Mock Data Generators for "Interesting" Visuals
const calculateTrendData = (users, orders) => {
    const last6Months = [];
    const today = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        last6Months.push({
            name: monthName,
            fullDate: d,
            users: 0,
            orders: 0,
            revenue: 0
        });
    }

    // Helper to find month index
    const updateMonthData = (dateStr, type, amount = 0) => {
        if (!dateStr) return;
        const date = new Date(dateStr);
        // Basic check if within last 6 months window roughly
        // Ideally we compare year and month index
        const monthIndex = last6Months.findIndex(m =>
            m.fullDate.getMonth() === date.getMonth() &&
            m.fullDate.getFullYear() === date.getFullYear()
        );

        if (monthIndex !== -1) {
            if (type === 'user') last6Months[monthIndex].users += 1;
            if (type === 'order') {
                last6Months[monthIndex].orders += 1;
                last6Months[monthIndex].revenue += amount;
            }
        }
    };

    users.forEach(u => updateMonthData(u.createdAt, 'user'));
    orders.forEach(o => updateMonthData(o.createdAt, 'order', o.totalPrice || 0));

    return last6Months;
};

const generateCategoryData = (products) => {
    if (!products || products.length === 0) return [];
    const counts = {};
    products.forEach(p => {
        counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = ({ users = [], products = [], orders = [] }) => {
    const trendData = calculateTrendData(users, orders);
    const categoryData = generateCategoryData(products);

    // User Role Distribution
    const userRoles = [
        { name: 'Farmers', value: users.filter(u => u.role === 'farmer').length },
        { name: 'Buyers', value: users.filter(u => u.role === 'buyer').length },
        { name: 'Experts', value: users.filter(u => u.role === 'expert').length },
        { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
    ].filter(i => i.value > 0);

    // Order Status Distribution (Replacing Mock Radar)
    const orderStatusData = [
        { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length },
        { name: 'Processing', value: orders.filter(o => o.status === 'Processing').length },
        { name: 'Shipped', value: orders.filter(o => o.status === 'Shipped').length },
        { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length },
        { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length },
    ].filter(i => i.value > 0);

    // Performance Metrics (Radar)
    // Real System Health KPIs (Radar)
    const totalOrders = orders.length || 1;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const orderSuccessRate = Math.round((deliveredOrders / totalOrders) * 100);

    const totalProducts = products.length || 1;
    const inStockProducts = products.filter(p => !p.stock || p.stock === 'In Stock' || p.stock === 'Available').length;
    const stockHealth = Math.round((inStockProducts / totalProducts) * 100);

    const totalUsers = users.length || 1;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const userActivity = Math.round((activeUsers / totalUsers) * 100);

    const verifiedUsers = users.filter(u => u.isEmailVerified).length;
    const verificationRate = Math.round((verifiedUsers / totalUsers) * 100);

    // Calculate Platform Growth (Month-over-Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const countActivity = (dateStr) => {
        if (!dateStr) return { current: 0, last: 0 };
        const d = new Date(dateStr);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) return { current: 1, last: 0 };
        if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) return { current: 0, last: 1 };
        return { current: 0, last: 0 };
    };

    let currentActivity = 0;
    let lastActivity = 0;

    users.forEach(u => {
        const c = countActivity(u.createdAt);
        currentActivity += c.current;
        lastActivity += c.last;
    });

    orders.forEach(o => {
        const c = countActivity(o.createdAt);
        currentActivity += c.current;
        lastActivity += c.last;
    });

    // Avoid division by zero, cap at 100 on radar for visualization (or map 200% growth to full mark)
    // If last month was 0, and we have activity, it's 100% growth effectively for visualization.
    let growthRate = 0;
    if (lastActivity === 0) {
        growthRate = currentActivity > 0 ? 100 : 0;
    } else {
        const growth = ((currentActivity - lastActivity) / lastActivity) * 100;
        // Normalize for chart (0-100 scale, where 50 is 0% growth? or just raw positive growth?)
        // Let's make it "Performance Score" roughly.
        // If growth is positive, high score.
        growthRate = Math.min(Math.max(50 + growth, 0), 100); // Baseline 50, +growth
    }

    const performanceData = [
        { subject: 'Order Success', A: orderSuccessRate, fullMark: 100 },
        { subject: 'Stock Health', A: stockHealth, fullMark: 100 },
        { subject: 'User Activity', A: userActivity, fullMark: 100 },
        { subject: 'Verification', A: verificationRate, fullMark: 100 },
        { subject: 'Growth Trend', A: Math.round(growthRate), fullMark: 100 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            {/* Row 1: Key Trends (Area & Line) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>User & Order Growth Trends</CardTitle>
                        <CardDescription>Monthly growth overview (Spline Area Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                                <Area type="monotone" dataKey="orders" stroke="#82ca9d" fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                        <CardDescription>Projected vs Actual (Composed Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="name" scale="band" />
                                <YAxis
                                    tickFormatter={(value) => `₹${value}`}
                                    width={80}
                                />
                                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                <Legend />
                                <Bar dataKey="revenue" barSize={20} fill="#413ea0" radius={[4, 4, 0, 0]} name="Revenue (Bar)" />
                                <Line type="monotone" dataKey="revenue" stroke="#ff7300" strokeWidth={2} name="Trend (Line)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Distributions & Radar */}
            {/* Row 2: Distributions & Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Pie Chart - User Roles */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>User Demographics</CardTitle>
                        <CardDescription>Distribution by Role (Donut Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userRoles}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userRoles.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 2. Bar Chart - Product Categories */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Product Inventory</CardTitle>
                        <CardDescription>Stock by Category (Bar Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Radar Chart - KPIs */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                        <CardDescription>Performance KPIs (Radar Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar
                                    name="Current"
                                    dataKey="A"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                {/* 4. Order Status (New) */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Current Order Distribution (Bar Chart)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderStatusData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#ffc658" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
