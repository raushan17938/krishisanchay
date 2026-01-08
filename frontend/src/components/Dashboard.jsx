import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, User, LogOut } from "lucide-react";
import WeatherWidget from "@/components/WeatherWidget";
import MarketPrices from "@/components/MarketPrices";
import AdminView from "./dashboard/AdminView";
import BuyerView from "./dashboard/BuyerView";
import ExpertView from "./dashboard/ExpertView";

// Reusing the existing Farmer Dashboard content as FarmerView to keep it modular
import { Mic, Camera, MessageCircle, ShoppingCart, Zap, Briefcase } from "lucide-react";

import { chatWithAI } from "@/api/ai";
import { toast } from "sonner";

const FarmerView = ({ onNavigate }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    const handleVoiceAsk = () => {
        // Stop Speaking logic
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Stop Listening logic
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Voice recognition not supported in this browser");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();

        recognitionRef.current.lang = 'en-US'; // Can be dynamic based on i18n
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            toast.info("Listening... Ask your question");
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;

            toast.success(`You said: "${transcript}"`);

            try {
                // Call AI
                const data = await chatWithAI(transcript);

                if (data.success && data.reply) {
                    speakResponse(data.reply);
                }
            } catch (error) {
                console.error("AI Error:", error);
                toast.error("Failed to get answer");
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setIsListening(false);
            // toast.error("Could not hear you. Please try again.");
        };

        recognitionRef.current.start();
    };

    const speakResponse = (text) => {
        if (!('speechSynthesis' in window)) return;

        // Cancel existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-6">
            {/* Voice Assistant */}
            <Card className="farm-card mb-8 text-center bg-gradient-to-br from-green-50 to-white">
                <div className="flex flex-col items-center py-4">
                    <div className={`bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${isListening ? 'animate-pulse scale-110 shadow-green-500/50' : isSpeaking ? 'animate-pulse shadow-blue-500/50' : 'animate-bounce-soft'}`}>
                        <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-ping' : ''}`} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Ask AI Assistant</h2>
                    <p className="text-muted-foreground mb-4">
                        {isListening ? "Listening... (Click to stop)" : isSpeaking ? "Speaking... (Click to stop)" : "Ask \"How's the weather?\" or \"What's the wheat price?\""}
                    </p>
                    <Button
                        className={`btn-farm transition-all duration-300 w-48 ${isListening ? 'bg-red-500 hover:bg-red-600' : isSpeaking ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                        onClick={handleVoiceAsk}
                    >
                        {isListening ? "Stop Listening" : isSpeaking ? "Stop Speaking" : "Ask with Voice"}
                    </Button>
                </div>
            </Card>

            {/* Main Dashboard Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <WeatherWidget />
                        <MarketPrices />
                    </div>

                    {/* Quick Actions */}
                    <Card className="farm-card">
                        <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Button
                                className="btn-farm justify-start h-14"
                                onClick={() => onNavigate("farmer-profile")}
                            >
                                <User className="w-5 h-5 mr-3" />
                                My Profile
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-14 border-primary hover:bg-primary/10"
                                onClick={() => onNavigate("land-management")}
                            >
                                <Leaf className="w-5 h-5 mr-3" />
                                My Land
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-14 border-accent hover:bg-accent/10"
                                onClick={() => onNavigate("product-management")}
                            >
                                <ShoppingCart className="w-5 h-5 mr-3" />
                                My Products
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-14 border-secondary hover:bg-secondary/50"
                                onClick={() => onNavigate("crop-doctor")}
                            >
                                <Camera className="w-5 h-5 mr-3" />
                                Crop Doctor
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start h-14 border-orange-500 hover:bg-orange-500/10 text-orange-700 dark:text-orange-300"
                                onClick={() => onNavigate("jobs-listing")}
                            >
                                <Briefcase className="w-5 h-5 mr-3" />
                                Find Jobs
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card className="farm-card">
                        <h3 className="text-lg font-semibold mb-4">Your Farm</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Land</span>
                                <span className="font-semibold">5.2 Acres</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Current Crop</span>
                                <span className="font-semibold">Wheat</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="farm-card">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Received AI advice</p>
                                    <p className="text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
};


import SellerVerification from "./dashboard/SellerVerification";

const Dashboard = ({ onNavigate }) => {
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
                {userRole === "farmer" && <FarmerView onNavigate={onNavigate} />}
                {userRole === "buyer" && <BuyerView />}
                {userRole === "expert" && <ExpertView />}
                {userRole === "admin" && <AdminView />}
            </main>
        </div>
    );
};

export default Dashboard;
