import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, User, LogOut } from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import MarketPrices from "@/components/MarketPrices";
import AdminView from "./dashboard/AdminView";
import BuyerView from "./dashboard/BuyerView";
import ExpertView from "./dashboard/ExpertView";




import FarmerDashboard from "./FarmerDashboard";

const Dashboard = ({ onNavigate, onViewApplicants }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // Initialize as null
    const [showVerification, setShowVerification] = useState(false);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                setUser(parsedUser);
                if (parsedUser.role) {
                    setUserRole(parsedUser.role);
                }
            } catch (error) {
                console.error("Error parsing user info:", error);
            }
        }
    }, []);

    // Removed demo toggleRole function

    if (showVerification) {
        return <SellerVerification onBack={() => setShowVerification(false)} />;
    }

    if (!userRole) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Handling loading state
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="bg-card shadow-soft border-b sticky top-0 z-20">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-primary w-10 h-10 rounded-full flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Krishi Sanchay</h1>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">Welcome back, {user ? user.name : 'Guest'}</p>

                                    {/* Removed clickable role badge */}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary select-none">
                                        {userRole.toUpperCase()}
                                    </span>

                                    {userRole !== 'admin' && (
                                        <span
                                            onClick={() => setShowVerification(true)}
                                            className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200"
                                        >
                                            Verify to Sell
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {userRole === "farmer" && <FarmerDashboard onNavigate={onNavigate} onViewApplicants={onViewApplicants} />}
                {userRole === "buyer" && <BuyerView />}
                {userRole === "expert" && <ExpertView />}
                {userRole === "admin" && <AdminView onNavigate={onNavigate} onViewApplicants={onViewApplicants} />}
            </main>
        </div>
    );
};

export default Dashboard;
