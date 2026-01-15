import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Users, ShoppingBag, FileText, AlertTriangle, Store, Tractor, MapPin, Phone, Filter, MoreHorizontal, Package, Tag, IndianRupee, PlusCircle, ClipboardCheck, Settings, BarChart3, Leaf, Camera, Briefcase, User, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { getUsers, updateUserStatus, getSellerRequests, updateRequestStatus, getAllLandRequests } from "../../api/admin";
import { getAllOrders, updateOrderStatus, getMyOrders, generateDeliveryOtp, verifyDeliveryOtp } from "../../api/order";
import { Link } from "react-router-dom";
import { getProducts } from "../../api/product";
import { getPosts, deletePost } from "../../api/posts";
import { getMyJobs } from "../../api/jobs"; // Imported getMyJobs
import { toast } from "sonner";
import axios from '../../api/axios';
import AnalyticsDashboard from "./AnalyticsDashboard";
import ApplicantsList from "../ApplicantsList";

/**
 * AdminView Component
 * Displays platform overview, user management, seller requests, and product management
 */
const AdminView = ({ onNavigate, onViewApplicants }) => {
    const location = useLocation(); // Use location hook
    const [activeTab, setActiveTab] = useState(location.state?.tab || "overview"); // Initialize with state if available
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedLandRequest, setSelectedLandRequest] = useState(null);
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null); // Added state for Modal

    // ... existing verify state

    // Fetch Land Requests for Admin
    useEffect(() => {
        if (activeTab === 'land-requests') {
            fetchLandRequests();
        }
        if (activeTab === 'my-jobs') {
            fetchMyJobs();
        }
    }, [activeTab]);

    const fetchMyJobs = async () => {
        try {
            const response = await getMyJobs();
            if (response.data.success) {
                setMyJobs(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching my jobs:", error);
            // toast.error("Failed to fetch my jobs");
        }
    };

    const fetchLandRequests = async () => {
        try {
            const response = await axios.get('/land/admin/requests');
            setLandRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching land requests:", error);
            // toast.error("Failed to fetch land requests");
        }
    };

    const handleLandRequestStatusUpdate = async (id, status) => {
        try {
            const response = await axios.put(`/land/requests/${id}`, { status });
            if (response.data.success) {
                toast.success(`Request marked as ${status}`);
                fetchLandRequests();
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    // Clear state after usage to prevent stuck tab on refresh if desired, 
    // but typically harmless. 
    // React Router state persists in history, so navigate(-1) might not work with this specific approach if pushed.
    // However, since we are doing navigate('/', ...), it's a push/replace.

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    // Data States
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // New Orders State
    const [myPurchases, setMyPurchases] = useState([]); // Admin Personal Purchases
    const [posts, setPosts] = useState([]);
    // Mock requests for now (Seller Requests API needed later)
    const [requests, setRequests] = useState([]);
    const [landRequests, setLandRequests] = useState([]); // Added Land Requests State
    const [myJobs, setMyJobs] = useState([]); // Added My Jobs State
    const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalPosts: 0, totalLandRequests: 0, totalMyJobs: 0 });

    // User Filter States
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Product Filter States
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    // OTP Verification State
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [verifyOrder, setVerifyOrder] = useState(null);
    const [otp, setOtp] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Users
                const usersRes = await getUsers();
                if (usersRes.data.success) {
                    const mappedUsers = usersRes.data.data.map(u => ({
                        ...u,
                        image: u.avatar || u.image,
                        address: u.location ? `${u.location.district || ''}, ${u.location.state || ''}` : u.address || 'N/A',
                        // Map seller details if available
                        shopName: u.sellerDetails?.shopName,
                        gst: u.sellerDetails?.gstNumber,
                        landSize: u.sellerDetails?.landSize,
                        crops: u.sellerDetails?.cropTypes?.join(', '),
                        sellerType: u.sellerDetails?.type || u.sellerType, // Prefer verified type
                        phone: u.sellerDetails?.phone || u.mobile // Prefer verified phone
                    }));
                    setUsers(mappedUsers);
                }

                // Fetch Seller Requests
                try {
                    const requestsRes = await getSellerRequests();
                    if (requestsRes.data.success) {
                        setRequests(requestsRes.data.data);
                    }
                } catch (err) {
                    console.error("Error fetching seller requests:", err);
                }

                // Fetch Orders (NEW)
                const ordersRes = await getAllOrders();
                if (ordersRes.success) {
                    setOrders(ordersRes.data);
                }

                // Fetch My Purchases (Admin's personal orders)
                const myPurchasesRes = await getMyOrders();
                if (myPurchasesRes.success) {
                    setMyPurchases(myPurchasesRes.data);
                }

                // Fetch Products
                const productsData = await getProducts();
                if (productsData.success) {
                    const mappedProducts = productsData.data.map(p => ({
                        ...p,
                        stock: p.countInStock > 5 ? 'In Stock' : p.countInStock > 0 ? 'Low Stock' : 'Out of Stock',
                        seller: p.seller?.name || 'Unknown',
                        unit: 'unit'
                    }));
                    setProducts(mappedProducts);
                }

                // Fetch Posts
                const postsRes = await getPosts();
                if (postsRes.data.success) {
                    const mappedPosts = postsRes.data.data.map(p => ({
                        ...p,
                        author: p.author?.name || 'Unknown',
                        authorRole: p.author?.role || 'user',
                        likes: p.likes.length,
                        comments: p.comments.length,
                        date: new Date(p.createdAt).toISOString().split('T')[0],
                        timestamp: p.createdAt
                    }));
                    setPosts(mappedPosts);
                    setPosts(mappedPosts);
                }

                // Fetch All Land Requests (New)
                try {
                    const landReqRes = await getAllLandRequests();
                    if (landReqRes.data.success) {
                        setLandRequests(landReqRes.data.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch land requests", error);
                }


            } catch (error) {
                console.error("Failed to fetch admin data", error);
                // toast.error("Failed to load dashboard data");
            }
        };

        fetchData();
    }, []);

    // Update stats whenever data changes
    useEffect(() => {
        setStats({
            totalUsers: users.length,
            totalProducts: products.length,
            totalPosts: posts.length,
            totalLandRequests: landRequests.length
        });
    }, [users, products, posts]);

    // Filtering Logic Users
    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesRole && matchesStatus;
    });

    // Filtering Logic Products
    const filteredProducts = products.filter(product => {
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'In Stock' && (product.stock === 'In Stock' || product.stock === 'Available')) ||
            (stockFilter === 'Out of Stock' && product.stock === 'Out of Stock');
        return matchesCategory && matchesStock;
    });

    // Filtering Logic Posts
    const filteredPosts = posts.filter(post => {
        if (dateFilter === 'all') return true;
        const postDate = new Date(post.timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === '24h') return diffDays <= 1;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
    });

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deletePost(postId);
            setPosts(posts.filter(p => p._id !== postId));
            toast.success("Post deleted");
        } catch (error) {
            toast.error("Failed to delete post");
        }
    };

    const handleStatusChange = async (userId, newStatus, e) => {
        e.stopPropagation();
        try {
            await updateUserStatus(userId, newStatus);
            setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
            toast.success(`User marked as ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleRequestAction = async (reqId, action) => {
        try {
            const res = await updateRequestStatus(reqId, action);
            if (res.data.success) {
                setRequests(requests.filter(r => r._id !== reqId));
                toast.success(`Request ${action}`);
            }
        } catch (error) {
            console.error("Failed to update request", error);
            toast.error("Failed to update request");
        }
    };

    const handleGenerateOtp = async () => {
        if (!verifyOrder) return;
        try {
            const res = await generateDeliveryOtp(verifyOrder._id);
            if (res.success) {
                toast.success("OTP sent to customer email");
            }
        } catch (error) {
            toast.error("Failed to generate OTP");
        }
    };

    const handleVerifyOtp = async () => {
        if (!verifyOrder || !otp) return;
        try {
            const res = await verifyDeliveryOtp(verifyOrder._id, otp);
            if (res.success) {
                toast.success("Order delivered successfully!");
                setOrders(orders.map(o => o._id === verifyOrder._id ? { ...o, orderStatus: 'Delivered', isDelivered: true, isPaid: true } : o));
                setVerifyDialogOpen(false);
                setOtp("");
                setVerifyOrder(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        }
    };

    const scrollToUsers = () => {
        setActiveTab("overview");
        setTimeout(() => {
            const element = document.getElementById('user-management');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleExportCSV = (data) => {
        if (!data || data.length === 0) {
            // Toast would be ideal, but using alert for simplicity if toast not in scope here
            // Assuming toast is imported based on previous code usage
            // toast.error("No data to export"); 
            // Actually, I'll assume toast is available since I saw it used in handleRequestAction
            alert("No data to export");
            return;
        }

        const headers = ["Name", "Email", "Role", "Status", "Mobile", "Address", "Joined Date"];
        const csvContent = [
            headers.join(","),
            ...data.map(user => [
                `"${user.name || ''}"`,
                `"${user.email || ''}"`,
                `"${user.role || ''}"`,
                `"${user.status || ''}"`,
                `"${user.mobile || ''}"`,
                `"${user.address ? user.address.replace(/"/g, '""') : ''}"`,
                `"${new Date(user.createdAt).toLocaleDateString()}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "users_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4 md:space-y-6 pt-2 md:pt-0">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b overflow-x-auto">
                <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('overview')}
                    className={`rounded-b-none ${activeTab === 'overview' ? 'border-b-2 border-primary' : ''}`}
                >
                    Overview & Users
                </Button>
                <Button
                    variant={activeTab === 'orders' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('orders')}
                    className="rounded-b-none"
                >
                    All Orders
                </Button>
                <Button
                    variant={activeTab === 'products' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('products')}
                    className="rounded-b-none"
                >
                    Products List
                </Button>
                <Button
                    variant={activeTab === 'posts' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('posts')}
                    className="rounded-b-none"
                >
                    Community Posts
                </Button>
                <Button
                    variant={activeTab === 'my-purchases' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('my-purchases')}
                    className="rounded-b-none"
                >
                    My Purchases
                </Button>
                <Button
                    variant={activeTab === 'requests' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('requests')}
                    className="rounded-b-none relative"
                >
                    Seller Requests
                    {requests.filter(r => r.status === 'pending').length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {requests.filter(r => r.status === 'pending').length}
                        </span>
                    )}

                </Button>
                <Button
                    variant={activeTab === 'land-requests' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('land-requests')}
                    className="rounded-b-none"
                >
                    Land Requests
                </Button>
                <Button
                    variant={activeTab === 'my-jobs' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('my-jobs')}
                    className="rounded-b-none"
                >
                    My Posted Jobs
                </Button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Quick Actions Header */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4">
                            <Button
                                className="bg-green-700 hover:bg-green-800 text-white h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("farmer-profile")}
                            >
                                <User className="w-5 h-5" />
                                <span>My Profile</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-green-600 text-green-700 hover:bg-green-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("land-management")}
                            >
                                <Leaf className="w-5 h-5" />
                                <span>My Land</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-yellow-500 text-yellow-700 hover:bg-yellow-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("product-management")}
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span>My Products</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-stone-400 text-stone-700 hover:bg-stone-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("crop-doctor")}
                            >
                                <Camera className="w-5 h-5" />
                                <span>Crop Doctor</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-orange-500 text-orange-700 hover:bg-orange-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("jobs-listing")}
                            >
                                <Briefcase className="w-5 h-5" />
                                <span>Find Jobs</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-blue-500 text-blue-700 hover:bg-blue-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={scrollToUsers}
                            >
                                <Users className="w-5 h-5" />
                                <span>Manage Users</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-purple-500 text-purple-700 hover:bg-purple-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package className="w-5 h-5" />
                                <span>All Orders</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-auto py-4 md:py-2 md:h-10 md:w-auto w-full justify-center md:justify-start px-4 border-blue-500 text-blue-700 hover:bg-blue-50 flex-col md:flex-row items-center gap-2 md:gap-2"
                                onClick={() => onNavigate && onNavigate("my-applications")}
                            >
                                <FileText className="w-5 h-5" />
                                <span>My Applications</span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <Card
                            className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={scrollToUsers}
                            title="Click to manage users"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <h3 className="text-2xl font-bold">{stats?.totalUsers || 1250}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('products')}>
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Products</p>
                                    <h3 className="text-2xl font-bold">{stats?.totalProducts || 450}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('posts')}>
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-full">
                                    <FileText className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Posts</p>
                                    <h3 className="text-2xl font-bold">{stats?.totalPosts || posts.length}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">To Review</p>
                                    <h3 className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Visual Analytics Section */}
                    <div className="mb-8">
                        <AnalyticsDashboard users={users} products={products} orders={orders} />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* User Management Table */}
                        <Card id="user-management" className="lg:col-span-2 p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-semibold">User Management</h3>
                                <div className="flex flex-wrap gap-2 w-full sm:w-auto">

                                    {/* Role Filter */}
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="farmer">Farmer</SelectItem>
                                            <SelectItem value="buyer">Buyer</SelectItem>
                                            <SelectItem value="expert">Expert</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[120px] h-8 text-xs">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8"
                                        onClick={() => handleExportCSV(filteredUsers)}
                                    >
                                        Export CSV
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground w-[250px]">User</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Role</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                            <th className="pb-3 font-medium text-muted-foreground text-right pr-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-muted-foreground">
                                                    No users matching filters
                                                </td>
                                            </tr>
                                        ) : filteredUsers.map((user) => (
                                            <tr
                                                key={user._id}
                                                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-sm">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium w-fit capitalize
                                                ${user.role === 'expert' ? 'bg-purple-100 text-purple-700' :
                                                                user.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                                            {user.role}
                                                        </span>
                                                        {user.isVerifiedSeller && (
                                                            <span className="text-[10px] text-green-600 font-medium mt-1">Verified Seller</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${user.status === 'active' ? 'bg-green-100 text-green-700' :
                                                        user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {user.status !== 'active' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={(e) => handleStatusChange(user._id, 'active', e)}
                                                            >
                                                                Activate
                                                            </Button>
                                                        )}
                                                        {user.status === 'active' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                onClick={(e) => handleStatusChange(user._id, 'inactive', e)}
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        )}
                                                        {user.status !== 'suspended' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={(e) => handleStatusChange(user._id, 'suspended', e)}
                                                            >
                                                                Suspend
                                                            </Button>
                                                        )}
                                                        {user.isVerifiedSeller && user.verificationDoc && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedDocument(user.verificationDoc);
                                                                }}
                                                            >
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                View Doc
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* System Health (Right Column) */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">System Health</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Server Load</span>
                                        <span className="text-green-600">Healthy (24%)</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full">
                                        <div className="h-full bg-green-500 rounded-full w-1/4" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Database Storage</span>
                                        <span className="text-blue-600">45% Used</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full">
                                        <div className="h-full bg-blue-500 rounded-full w-[45%]" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t mt-4">
                                    <h4 className="text-sm font-medium mb-3">Recent Security Alerts</h4>
                                    <div className="space-y-3">
                                        <div className="flex gap-2 text-xs text-muted-foreground items-start">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1 flex-shrink-0" />
                                            <span>Multiple failed login attempts detected from IP: 192.168.X.X</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'orders' && (
                <div className="grid gap-6">
                    <h2 className="text-2xl font-bold">All Orders</h2>
                    <Card className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="border-b text-left">
                                        <th className="py-4 px-6 font-medium text-muted-foreground">Order ID</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground">User</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground">Date</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground">Total</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground">Paid</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground">Delivered</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-muted-foreground">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50">
                                            <td className="py-4 px-6 font-medium text-sm">
                                                #{order._id.substring(0, 10).toUpperCase()}
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                {order.user?.name || 'Unknown'}
                                                <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 font-medium">
                                                ₹{order.totalPrice.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Select
                                                    defaultValue={order.orderStatus || 'Pending'}
                                                    onValueChange={async (value) => {
                                                        if (value === 'Delivered') {
                                                            setVerifyOrder(order);
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
                                                                toast.success(`Order updated to ${value}`);
                                                                setOrders(orders.map(o => o._id === order._id ? { ...o, orderStatus: value, isDelivered: value === 'Delivered' ? true : o.isDelivered } : o));
                                                            }
                                                        } catch (error) {
                                                            toast.error("Failed to update status");
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-[140px] h-8 text-xs">
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
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div >
            )}

            {
                activeTab === 'my-jobs' && (
                    <div className="grid gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">My Posted Jobs</h2>
                        </div>

                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b text-left">
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Job Title</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Type</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Posted Date</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Applicants</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {myJobs.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-muted-foreground">
                                                    You haven't posted any jobs yet.
                                                </td>
                                            </tr>
                                        ) : myJobs.map((job) => (
                                            <tr key={job._id} className="hover:bg-gray-50/50">
                                                <td className="py-4 px-6 font-medium text-sm">
                                                    {job.title}
                                                    <div className="text-xs text-muted-foreground">{job.company}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${job.jobType === 'Full-time' ? 'bg-green-100 text-green-700' :
                                                        job.jobType === 'Part-time' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {job.jobType}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-muted-foreground" />
                                                        {job.applicants ? job.applicants.length : 0}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedJobForApplicants(job._id)}
                                                    >
                                                        View Applicants
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div >
                )}

            {/* Applicants Modal */}
            <Dialog open={!!selectedJobForApplicants} onOpenChange={() => setSelectedJobForApplicants(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedJobForApplicants && <ApplicantsList jobId={selectedJobForApplicants} />}
                </DialogContent>
            </Dialog>

            {
                activeTab === 'products' && (
                    <div className="grid gap-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold">Product Management</h2>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                {/* Category Filter */}
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Seeds">Seeds</SelectItem>
                                        <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                                        <SelectItem value="Pesticides">Pesticides</SelectItem>
                                        <SelectItem value="Rentals">Rentals</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Stock Filter */}
                                <Select value={stockFilter} onValueChange={setStockFilter}>
                                    <SelectTrigger className="w-[140px] h-9">
                                        <SelectValue placeholder="Stock Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b text-left">
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Product</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Category</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Price</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Seller</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Status</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-muted-foreground">
                                                    No products found matching filters
                                                </td>
                                            </tr>
                                        ) : filteredProducts.map((product) => (
                                            <tr
                                                key={product._id}
                                                className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                            {product.image ? (
                                                                <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-medium text-sm">
                                                    ₹{product.price} {product.unit && <span className="text-xs text-muted-foreground font-normal">/{product.unit}</span>}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {product.seller}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide ${product.stock === 'Out of Stock' ? 'bg-red-100 text-red-600' :
                                                        product.stock === 'Low Stock' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )
            }

            {
                activeTab === 'posts' && (
                    <div className="grid gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Community Posts</h2>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                                    <SelectItem value="week">Last 7 Days</SelectItem>
                                    <SelectItem value="month">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.length === 0 ? (
                                <p className="col-span-3 text-center py-10 text-muted-foreground">No posts found matching filter</p>
                            ) : filteredPosts.map((post) => (
                                <Card key={post._id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    {post.image && (
                                        <div className="h-40 w-full overflow-hidden rounded-t-lg">
                                            <img src={post.image} alt="Post content" className="w-full h-full object-cover transition-transform hover:scale-105" />
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                                                    <span className="text-sm">{post.author.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm">{post.author}</h4>
                                                    <p className="text-xs text-muted-foreground">{post.date}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize border ${post.authorRole === 'expert' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {post.authorRole}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-700 leading-relaxed min-h-[60px]">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t mt-auto">
                                            <div className="flex gap-4 text-muted-foreground text-xs">
                                                <span className="flex items-center gap-1">
                                                    {/* Replaced Icon Name with hardcoded placeholders if needed, but assuming imports exist */}
                                                    <span>❤️</span> {post.likes}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span>💬</span> {post.comments}
                                                </span>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => handleDeletePost(post._id)}
                                            >
                                                Delete Post
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'my-purchases' && (
                    <div className="grid gap-6">
                        <h2 className="text-2xl font-bold">My Personal Purchases</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b text-left">
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Order ID</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Date</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Total</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Items</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Status</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {myPurchases.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-muted-foreground">
                                                    You haven't purchased anything yet.
                                                </td>
                                            </tr>
                                        ) : myPurchases.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50">
                                                <td className="py-4 px-6 font-medium text-sm">
                                                    #{order._id.substring(0, 10).toUpperCase()}
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 font-medium">
                                                    ₹{order.totalPrice.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {order.orderItems.length} items
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {order.orderStatus || 'Processing'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Link to={`/order/${order._id}`}>
                                                        <Button size="sm" variant="outline">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )
            }

            {
                activeTab === 'requests' && (
                    /* Requests Tab Content */
                    <div className="grid gap-6">
                        <h2 className="text-2xl font-bold">Pending Seller Requests</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {requests.length === 0 && <p className="text-muted-foreground col-span-3 text-center py-10">No pending requests</p>}

                            {requests.map((request) => (
                                <Card key={request._id} className="p-6 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{request.user?.name || 'Unknown User'}</h3>
                                            <p className="text-xs text-muted-foreground">{request.user?.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${request.type === 'shopkeeper' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {request.type}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-semibold capitalize ${request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {request.status}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm space-y-2 flex-grow">
                                        <p><span className="font-semibold">Location:</span> {request.address}</p>
                                        <p><span className="font-semibold">Phone:</span> {request.phone}</p>

                                        {request.type === 'shopkeeper' && (
                                            <>
                                                <p><span className="font-semibold">Shop Name:</span> {request.shopName}</p>
                                                <p><span className="font-semibold">GST:</span> {request.gstNumber || 'N/A'}</p>
                                            </>
                                        )}

                                        {request.type === 'farmer' && (
                                            <>
                                                <p><span className="font-semibold">Land Size:</span> {request.landSize}</p>
                                                <p><span className="font-semibold">Crops:</span> {request.cropTypes?.join(', ') || 'N/A'}</p>
                                            </>
                                        )}

                                        {request.documentImage && (
                                            <div className="mt-2 border-t pt-2">
                                                <p className="font-semibold mb-1">Document:</p>
                                                <p className="font-semibold mb-1">Document:</p>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-blue-600 hover:underline flex items-center gap-2"
                                                    onClick={() => setSelectedDocument(request.documentImage)}
                                                >
                                                    <FileText className="w-4 h-4" /> View Document
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleRequestAction(request._id, 'approved')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleRequestAction(request._id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* User Details Modal */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="w-[90vw] sm:w-full max-w-md">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Detailed information for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary overflow-hidden">
                                    {selectedUser.image ? (
                                        <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        selectedUser.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="bg-gray-100 text-xs px-2 py-0.5 rounded capitalize">{selectedUser.role}</span>
                                        {selectedUser.isVerifiedSeller && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Verified Seller</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{selectedUser.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm">{selectedUser.address || 'No address provided'}</span>
                                </div>
                            </div>

                            {/* Seller Specific Info */}
                            {selectedUser.isVerifiedSeller && (
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        {selectedUser.sellerType === 'shopkeeper' ? <Store className="w-4 h-4" /> : <Tractor className="w-4 h-4" />}
                                        {selectedUser.sellerType === 'shopkeeper' ? 'Shop Details' : 'Farm Details'}
                                    </h4>

                                    {selectedUser.sellerType === 'shopkeeper' ? (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Shop Name</span>
                                                <span className="font-medium">{selectedUser.shopName}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">GST/License</span>
                                                <span className="font-medium">{selectedUser.gst}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Land Size</span>
                                                <span className="font-medium">{selectedUser.landSize}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-xs">Crops</span>
                                                <span className="font-medium">{selectedUser.crops}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Product Details Modal */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="w-[90vw] sm:w-full max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {selectedProduct.image ? (
                                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <Package className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                                    <p className="text-green-600 font-semibold text-lg flex items-center gap-1">
                                        <IndianRupee className="w-4 h-4" />
                                        {selectedProduct.price}
                                        {selectedProduct.unit && <span className="text-sm text-gray-500 font-normal">/{selectedProduct.unit}</span>}
                                    </p>
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                                        {selectedProduct.category}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Seller</span>
                                    <span className="font-medium">{selectedProduct.seller}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Stock Status</span>
                                    <span className={`font-medium ${selectedProduct.stock === 'Out of Stock' ? 'text-red-600' :
                                        selectedProduct.stock === 'Low Stock' ? 'text-orange-600' : 'text-green-600'
                                        }`}>{selectedProduct.stock}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {selectedProduct.description}
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setSelectedProduct(null)}>Close</Button>
                                <Button variant="destructive">Remove Listing</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal */}
            <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
                <DialogContent className="w-[90vw] sm:w-full max-w-4xl h-[80vh] flex flex-col p-4">
                    <DialogHeader>
                        <DialogTitle>Document Viewer</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full bg-slate-100 rounded-lg overflow-y-auto flex flex-col items-center relative custom-scrollbar">
                        {selectedDocument ? (
                            selectedDocument.toLowerCase().includes('.pdf') ? (
                                <div className="relative w-full min-h-full flex flex-col items-center justify-start p-6">
                                    {selectedDocument.includes('cloudinary') ? (
                                        <img
                                            src={selectedDocument.replace(/\.pdf$/i, '.jpg')}
                                            alt="PDF Preview"
                                            className="w-full max-w-2xl h-auto mb-6 border shadow-lg bg-white"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-6xl mb-4">📄</div>
                                    )}
                                    <div className="hidden text-center mb-4">
                                        <div className="text-6xl mb-2">📄</div>
                                        <p className="text-muted-foreground">Preview not available</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 mb-4">
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {selectedDocument.includes('cloudinary') ? "First Page Preview" : "PDF Document"}
                                        </p>
                                        <Button onClick={() => window.open(selectedDocument, '_blank')}>
                                            Download / View Full PDF
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={selectedDocument}
                                    alt="Verification Document"
                                    className="max-w-full max-h-full object-contain"
                                />
                            )
                        ) : (
                            <p className="text-muted-foreground">No document to display</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => setSelectedDocument(null)}>Close</Button>
                        <Button onClick={() => window.open(selectedDocument, '_blank')}>Download / Open in New Tab</Button>
                    </div>
                </DialogContent>
            </Dialog>



            {
                activeTab === 'land-requests' && (
                    <div className="grid gap-6">
                        <h2 className="text-2xl font-bold">Land Rental Requests</h2>
                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr className="border-b text-left">
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Land</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Owner</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Renter</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Duration</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Status</th>
                                            <th className="py-4 px-6 font-medium text-muted-foreground">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {landRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center text-muted-foreground">
                                                    No land requests found
                                                </td>
                                            </tr>
                                        ) : landRequests.map((req) => (
                                            <tr
                                                key={req._id}
                                                className="hover:bg-gray-50/50 cursor-pointer"
                                                onClick={() => setSelectedLandRequest(req)}
                                            >
                                                <td className="py-4 px-6 font-medium text-sm">
                                                    {req.land?.title || 'Deleted Land'}
                                                    <div className="text-xs text-muted-foreground">{req.land?.location}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {req.owner?.name || 'Unknown'}
                                                    <div className="text-xs text-muted-foreground">{req.owner?.email}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {req.user?.name || 'Unknown'}
                                                    <div className="text-xs text-muted-foreground">{req.user?.email}</div>
                                                </td>
                                                <td className="py-4 px-6 text-sm">
                                                    {req.duration || 'N/A'}
                                                </td>
                                                <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                                                    <Select
                                                        defaultValue={req.status}
                                                        onValueChange={(value) => handleLandRequestStatusUpdate(req._id, value)}
                                                    >
                                                        <SelectTrigger className={`h-8 w-28 text-xs font-medium capitalize border-none shadow-none focus:ring-0
                                                            ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                    req.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="approved">Approved</SelectItem>
                                                            <SelectItem value="rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted-foreground max-w-[200px] truncate" title={req.requestMessage}>
                                                    {req.requestMessage || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Land Request Details Modal */}
            <Dialog open={!!selectedLandRequest} onOpenChange={() => setSelectedLandRequest(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Land Request Details</DialogTitle>
                        <DialogDescription>
                            Application for {selectedLandRequest?.land?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLandRequest && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Owner</h4>
                                    <div className="text-sm">
                                        <p className="font-semibold">{selectedLandRequest.owner?.name}</p>
                                        <p className="text-muted-foreground">{selectedLandRequest.owner?.email}</p>
                                        <p className="text-muted-foreground">{selectedLandRequest.owner?.phone}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground">Applicant</h4>
                                    <div className="text-sm">
                                        <p className="font-semibold">{selectedLandRequest.user?.name}</p>
                                        <p className="text-muted-foreground">{selectedLandRequest.user?.email}</p>
                                        <p className="text-muted-foreground">{selectedLandRequest.user?.phone || 'No phone'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-medium text-muted-foreground">Land Details</h4>
                                <div className="text-sm border p-2 rounded bg-muted/20">
                                    <p className="font-medium">{selectedLandRequest.land?.title}</p>
                                    <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedLandRequest.land?.location}</p>
                                </div>
                            </div>

                            <div className="space-y-1 bg-muted/50 p-3 rounded-md">
                                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3" /> Message
                                </h4>
                                <p className="text-sm text-gray-700">
                                    {selectedLandRequest.requestMessage || "No message provided."}
                                </p>
                            </div>

                            <div className="pt-4 border-t flex justify-between items-center">
                                <span className="text-sm font-medium">Status:</span>
                                <Select
                                    defaultValue={selectedLandRequest.status}
                                    onValueChange={(value) => {
                                        handleLandRequestStatusUpdate(selectedLandRequest._id, value);
                                        setSelectedLandRequest({ ...selectedLandRequest, status: value });
                                    }}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* OTP Verification Dialog */}
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
        </div >
    );
};

export default AdminView;
